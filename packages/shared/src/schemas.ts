import { z } from "zod";

export const uuid = z.string().uuid();

export const productSchema = z.object({
  id: uuid,
  sku: z.string().min(1),
  name: z.string().min(1),
  unit: z.enum(["bottle", "ml", "can", "shot", "glass", "crate", "pack"]),
  category: z.string().optional(),
  costPrice: z.number().int().nonnegative(),
  salePrice: z.number().int().nonnegative(),
  taxRate: z.number().min(0).max(100),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const stockLevelSchema = z.object({
  id: uuid,
  productId: uuid,
  quantity: z.number().int(),
  location: z.enum(["main", "store", "other"]),
  updatedAt: z.string(),
});

export const stockMovementSchema = z.object({
  id: uuid,
  productId: uuid,
  type: z.enum(["in", "out", "adjustment"]),
  quantity: z.number().int(),
  reason: z.string().optional(),
  reference: z.string().optional(),
  createdAt: z.string(),
  userId: uuid,
});

export const stocktakeSchema = z.object({
  id: uuid,
  startedAt: z.string(),
  completedAt: z.string().optional(),
  userId: uuid,
  notes: z.string().optional(),
});

export const stocktakeLineSchema = z.object({
  id: uuid,
  stocktakeId: uuid,
  productId: uuid,
  countedQuantity: z.number().int(),
  varianceQuantity: z.number().int(),
});

export const customerSchema = z.object({
  id: uuid,
  name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  createdAt: z.string(),
});

export const saleSchema = z.object({
  id: uuid,
  number: z.string().min(1),
  createdAt: z.string(),
  userId: uuid,
  customerId: uuid.optional(),
  totalAmount: z.number().int().nonnegative(),
  currency: z.enum(["ZMW", "USD"]),
  paymentMethod: z.enum(["cash", "mobile_money", "card", "tab"]),
});

export const saleLineSchema = z.object({
  id: uuid,
  saleId: uuid,
  productId: uuid,
  quantity: z.number().int(),
  unitPrice: z.number().int().nonnegative(),
  lineTotal: z.number().int().nonnegative(),
});
