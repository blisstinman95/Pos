import "dotenv/config";
import express from "express";
import cors from "cors";
import { db, initDb } from "./db";
import { z } from "zod";
import { productSchema } from "@pos/shared";
const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));
initDb();
app.get("/api/health", (_req, res) => {
    res.json({ ok: true, time: new Date().toISOString() });
});
// Products CRUD
app.get("/api/products", (_req, res) => {
    const rows = db.prepare("SELECT * FROM products WHERE is_active = 1").all();
    res.json(rows.map(mapProductFromDb));
});
app.post("/api/products", (req, res) => {
    const parsed = productSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    const p = parsed.data;
    upsertProduct(p);
    res.status(201).json(p);
});
app.put("/api/products/:id", (req, res) => {
    const parsed = productSchema.safeParse({ ...req.body, id: req.params.id });
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    const p = parsed.data;
    upsertProduct(p);
    res.json(p);
});
app.delete("/api/products/:id", (req, res) => {
    const id = req.params.id;
    const now = new Date().toISOString();
    db.prepare("UPDATE products SET is_active = 0, updated_at = ? WHERE id = ?").run(now, id);
    res.status(204).end();
});
// Stock endpoints
app.get("/api/stock/levels", (_req, res) => {
    const rows = db.prepare("SELECT * FROM stock_levels").all();
    res.json(rows.map(mapStockLevelFromDb));
});
const stockMovementSchema = z.object({
    id: z.string().uuid(),
    productId: z.string().uuid(),
    type: z.enum(["in", "out", "adjustment"]),
    quantity: z.number().int(),
    reason: z.string().optional(),
    reference: z.string().optional(),
    createdAt: z.string(),
    userId: z.string().uuid(),
});
app.post("/api/stock/movements", (req, res) => {
    const parsed = stockMovementSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    const m = parsed.data;
    db.prepare(`INSERT OR REPLACE INTO stock_movements (id, product_id, type, quantity, reason, reference, created_at, user_id)
     VALUES (@id, @productId, @type, @quantity, @reason, @reference, @createdAt, @userId)`).run(m);
    // Update stock level
    const current = db.prepare("SELECT * FROM stock_levels WHERE product_id = ?").get(m.productId);
    const newQty = (current?.quantity ?? 0) + (m.type === "in" ? m.quantity : m.type === "out" ? -m.quantity : m.quantity);
    const now = new Date().toISOString();
    if (!current) {
        db.prepare(`INSERT INTO stock_levels (id, product_id, quantity, location, updated_at)
       VALUES (?, ?, ?, 'main', ?)`).run(m.id, m.productId, newQty, now);
    }
    else {
        db.prepare("UPDATE stock_levels SET quantity = ?, updated_at = ? WHERE id = ?").run(newQty, now, current.id);
    }
    res.status(201).json({ ok: true });
});
// Sales
const saleSchema = z.object({
    id: z.string().uuid(),
    number: z.string(),
    createdAt: z.string(),
    userId: z.string().uuid(),
    customerId: z.string().uuid().optional(),
    totalAmount: z.number().int(),
    currency: z.enum(["ZMW", "USD"]),
    paymentMethod: z.enum(["cash", "mobile_money", "card", "tab"]),
});
const saleLineSchema = z.object({
    id: z.string().uuid(),
    saleId: z.string().uuid(),
    productId: z.string().uuid(),
    quantity: z.number().int(),
    unitPrice: z.number().int(),
    lineTotal: z.number().int(),
});
app.post("/api/sales", (req, res) => {
    const saleParsed = saleSchema.safeParse(req.body.sale);
    const linesParsed = z.array(saleLineSchema).safeParse(req.body.lines);
    if (!saleParsed.success || !linesParsed.success) {
        return res.status(400).json({ error: { sale: saleParsed.error?.flatten(), lines: linesParsed.error?.flatten() } });
    }
    const sale = saleParsed.data;
    const lines = linesParsed.data;
    const tx = db.transaction(() => {
        db.prepare(`INSERT OR REPLACE INTO sales (id, number, created_at, user_id, customer_id, total_amount, currency, payment_method)
       VALUES (@id, @number, @createdAt, @userId, @customerId, @totalAmount, @currency, @paymentMethod)`).run(sale);
        const insertLine = db.prepare(`INSERT OR REPLACE INTO sale_lines (id, sale_id, product_id, quantity, unit_price, line_total)
       VALUES (@id, @saleId, @productId, @quantity, @unitPrice, @lineTotal)`);
        for (const line of lines) {
            insertLine.run(line);
            // decrease stock
            const current = db.prepare("SELECT * FROM stock_levels WHERE product_id = ?").get(line.productId);
            const now = new Date().toISOString();
            const newQty = (current?.quantity ?? 0) - line.quantity;
            if (!current) {
                db.prepare(`INSERT INTO stock_levels (id, product_id, quantity, location, updated_at)
           VALUES (?, ?, ?, 'main', ?)`).run(line.id, line.productId, newQty, now);
            }
            else {
                db.prepare("UPDATE stock_levels SET quantity = ?, updated_at = ? WHERE id = ?").run(newQty, now, current.id);
            }
        }
    });
    tx();
    res.status(201).json({ ok: true });
});
// Simple sync endpoint (naive upsert + pull changes)
app.post("/api/sync", (req, res) => {
    const body = req.body;
    const since = body.since ? new Date(body.since).toISOString() : undefined;
    let applied = 0;
    const upsertMany = (table, rows) => {
        if (!rows?.length)
            return;
        const keys = Object.keys(rows[0]);
        const cols = keys.map((k) => camelToSnake(k)).join(", ");
        const placeholders = keys.map((k) => `@${k}`).join(", ");
        const stmt = db.prepare(`INSERT OR REPLACE INTO ${table} (${cols}) VALUES (${placeholders})`);
        for (const row of rows)
            stmt.run(row);
        applied += rows.length;
    };
    try {
        const tx = db.transaction(() => {
            const d = body.data || {};
            upsertMany("products", (d.products || []).map(mapProductToDb));
            upsertMany("stock_levels", (d.stockLevels || []).map(mapStockLevelToDb));
            upsertMany("stock_movements", (d.stockMovements || []).map(mapStockMovementToDb));
            upsertMany("customers", d.customers || []);
            upsertMany("sales", (d.sales || []).map(mapSaleToDb));
            upsertMany("sale_lines", (d.saleLines || []).map(mapSaleLineToDb));
        });
        tx();
    }
    catch (e) {
        return res.status(400).json({ error: String(e) });
    }
    const changes = {};
    const pull = (table, mapper) => {
        const where = since ? " WHERE updated_at >= ?" : "";
        const stmt = db.prepare(`SELECT * FROM ${table}${where}`);
        const rows = since ? stmt.all(since) : stmt.all();
        changes[table] = rows.map(mapper);
    };
    pull("products", mapProductFromDb);
    // stock_levels updated_at used for sync
    pull("stock_levels", mapStockLevelFromDb);
    const serverTime = new Date().toISOString();
    res.json({ serverTime, applied, conflicts: [], changes });
});
function upsertProduct(p) {
    const mapped = mapProductToDb(p);
    db.prepare(`INSERT OR REPLACE INTO products (
      id, sku, name, unit, category, cost_price, sale_price, tax_rate, is_active, created_at, updated_at
    ) VALUES (
      @id, @sku, @name, @unit, @category, @cost_price, @sale_price, @tax_rate, @is_active, @created_at, @updated_at
    )`).run(mapped);
}
// Utility mappers
function mapProductToDb(p) {
    return {
        id: p.id,
        sku: p.sku,
        name: p.name,
        unit: p.unit,
        category: p.category ?? null,
        cost_price: p.costPrice,
        sale_price: p.salePrice,
        tax_rate: p.taxRate,
        is_active: p.isActive ? 1 : 0,
        created_at: p.createdAt,
        updated_at: p.updatedAt,
    };
}
function mapProductFromDb(row) {
    return {
        id: row.id,
        sku: row.sku,
        name: row.name,
        unit: row.unit,
        category: row.category ?? undefined,
        costPrice: row.cost_price,
        salePrice: row.sale_price,
        taxRate: row.tax_rate,
        isActive: row.is_active === 1,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}
function mapStockLevelToDb(s) {
    return {
        id: s.id,
        product_id: s.productId,
        quantity: s.quantity,
        location: s.location,
        updated_at: s.updatedAt,
    };
}
function mapStockLevelFromDb(row) {
    return {
        id: row.id,
        productId: row.product_id,
        quantity: row.quantity,
        location: row.location,
        updatedAt: row.updated_at,
    };
}
function mapStockMovementToDb(m) {
    return {
        id: m.id,
        product_id: m.productId,
        type: m.type,
        quantity: m.quantity,
        reason: m.reason ?? null,
        reference: m.reference ?? null,
        created_at: m.createdAt,
        user_id: m.userId,
    };
}
function mapSaleToDb(s) {
    return {
        id: s.id,
        number: s.number,
        created_at: s.createdAt,
        user_id: s.userId,
        customer_id: s.customerId ?? null,
        total_amount: s.totalAmount,
        currency: s.currency,
        payment_method: s.paymentMethod,
    };
}
function mapSaleLineToDb(l) {
    return {
        id: l.id,
        sale_id: l.saleId,
        product_id: l.productId,
        quantity: l.quantity,
        unit_price: l.unitPrice,
        line_total: l.lineTotal,
    };
}
function camelToSnake(key) {
    return key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
}
const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
    console.log(`POS server listening on http://localhost:${port}`);
});
