"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saleLineSchema = exports.saleSchema = exports.customerSchema = exports.stocktakeLineSchema = exports.stocktakeSchema = exports.stockMovementSchema = exports.stockLevelSchema = exports.productSchema = exports.uuid = void 0;
const zod_1 = require("zod");
exports.uuid = zod_1.z.string().uuid();
exports.productSchema = zod_1.z.object({
    id: exports.uuid,
    sku: zod_1.z.string().min(1),
    name: zod_1.z.string().min(1),
    unit: zod_1.z.enum(["bottle", "ml", "can", "shot", "glass", "crate", "pack"]),
    category: zod_1.z.string().optional(),
    costPrice: zod_1.z.number().int().nonnegative(),
    salePrice: zod_1.z.number().int().nonnegative(),
    taxRate: zod_1.z.number().min(0).max(100),
    isActive: zod_1.z.boolean(),
    createdAt: zod_1.z.string(),
    updatedAt: zod_1.z.string(),
});
exports.stockLevelSchema = zod_1.z.object({
    id: exports.uuid,
    productId: exports.uuid,
    quantity: zod_1.z.number().int(),
    location: zod_1.z.enum(["main", "store", "other"]),
    updatedAt: zod_1.z.string(),
});
exports.stockMovementSchema = zod_1.z.object({
    id: exports.uuid,
    productId: exports.uuid,
    type: zod_1.z.enum(["in", "out", "adjustment"]),
    quantity: zod_1.z.number().int(),
    reason: zod_1.z.string().optional(),
    reference: zod_1.z.string().optional(),
    createdAt: zod_1.z.string(),
    userId: exports.uuid,
});
exports.stocktakeSchema = zod_1.z.object({
    id: exports.uuid,
    startedAt: zod_1.z.string(),
    completedAt: zod_1.z.string().optional(),
    userId: exports.uuid,
    notes: zod_1.z.string().optional(),
});
exports.stocktakeLineSchema = zod_1.z.object({
    id: exports.uuid,
    stocktakeId: exports.uuid,
    productId: exports.uuid,
    countedQuantity: zod_1.z.number().int(),
    varianceQuantity: zod_1.z.number().int(),
});
exports.customerSchema = zod_1.z.object({
    id: exports.uuid,
    name: zod_1.z.string().min(1),
    phone: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
    createdAt: zod_1.z.string(),
});
exports.saleSchema = zod_1.z.object({
    id: exports.uuid,
    number: zod_1.z.string().min(1),
    createdAt: zod_1.z.string(),
    userId: exports.uuid,
    customerId: exports.uuid.optional(),
    totalAmount: zod_1.z.number().int().nonnegative(),
    currency: zod_1.z.enum(["ZMW", "USD"]),
    paymentMethod: zod_1.z.enum(["cash", "mobile_money", "card", "tab"]),
});
exports.saleLineSchema = zod_1.z.object({
    id: exports.uuid,
    saleId: exports.uuid,
    productId: exports.uuid,
    quantity: zod_1.z.number().int(),
    unitPrice: zod_1.z.number().int().nonnegative(),
    lineTotal: zod_1.z.number().int().nonnegative(),
});
