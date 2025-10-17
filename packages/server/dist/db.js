import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
const dataDir = path.resolve(process.cwd(), "packages/server/data");
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}
const dbPath = path.join(dataDir, "server.db");
export const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
export function initDb() {
    db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      sku TEXT NOT NULL,
      name TEXT NOT NULL,
      unit TEXT NOT NULL,
      category TEXT,
      cost_price INTEGER NOT NULL,
      sale_price INTEGER NOT NULL,
      tax_rate REAL NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS stock_levels (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      location TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(product_id) REFERENCES products(id)
    );

    CREATE INDEX IF NOT EXISTS idx_stock_levels_product ON stock_levels(product_id);

    CREATE TABLE IF NOT EXISTS stock_movements (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      type TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      reason TEXT,
      reference TEXT,
      created_at TEXT NOT NULL,
      user_id TEXT NOT NULL,
      FOREIGN KEY(product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sales (
      id TEXT PRIMARY KEY,
      number TEXT NOT NULL,
      created_at TEXT NOT NULL,
      user_id TEXT NOT NULL,
      customer_id TEXT,
      total_amount INTEGER NOT NULL,
      currency TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      FOREIGN KEY(customer_id) REFERENCES customers(id)
    );

    CREATE TABLE IF NOT EXISTS sale_lines (
      id TEXT PRIMARY KEY,
      sale_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price INTEGER NOT NULL,
      line_total INTEGER NOT NULL,
      FOREIGN KEY(sale_id) REFERENCES sales(id),
      FOREIGN KEY(product_id) REFERENCES products(id)
    );

    CREATE INDEX IF NOT EXISTS idx_sale_lines_sale ON sale_lines(sale_id);
  `);
}
