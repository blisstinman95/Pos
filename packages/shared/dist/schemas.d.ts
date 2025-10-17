import { z } from "zod";
export declare const uuid: z.ZodString;
export declare const productSchema: z.ZodObject<{
    id: z.ZodString;
    sku: z.ZodString;
    name: z.ZodString;
    unit: z.ZodEnum<["bottle", "ml", "can", "shot", "glass", "crate", "pack"]>;
    category: z.ZodOptional<z.ZodString>;
    costPrice: z.ZodNumber;
    salePrice: z.ZodNumber;
    taxRate: z.ZodNumber;
    isActive: z.ZodBoolean;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    sku: string;
    name: string;
    unit: "bottle" | "ml" | "can" | "shot" | "glass" | "crate" | "pack";
    costPrice: number;
    salePrice: number;
    taxRate: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    category?: string | undefined;
}, {
    id: string;
    sku: string;
    name: string;
    unit: "bottle" | "ml" | "can" | "shot" | "glass" | "crate" | "pack";
    costPrice: number;
    salePrice: number;
    taxRate: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    category?: string | undefined;
}>;
export declare const stockLevelSchema: z.ZodObject<{
    id: z.ZodString;
    productId: z.ZodString;
    quantity: z.ZodNumber;
    location: z.ZodEnum<["main", "store", "other"]>;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    updatedAt: string;
    productId: string;
    quantity: number;
    location: "main" | "store" | "other";
}, {
    id: string;
    updatedAt: string;
    productId: string;
    quantity: number;
    location: "main" | "store" | "other";
}>;
export declare const stockMovementSchema: z.ZodObject<{
    id: z.ZodString;
    productId: z.ZodString;
    type: z.ZodEnum<["in", "out", "adjustment"]>;
    quantity: z.ZodNumber;
    reason: z.ZodOptional<z.ZodString>;
    reference: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
    userId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: "in" | "out" | "adjustment";
    createdAt: string;
    productId: string;
    quantity: number;
    userId: string;
    reason?: string | undefined;
    reference?: string | undefined;
}, {
    id: string;
    type: "in" | "out" | "adjustment";
    createdAt: string;
    productId: string;
    quantity: number;
    userId: string;
    reason?: string | undefined;
    reference?: string | undefined;
}>;
export declare const stocktakeSchema: z.ZodObject<{
    id: z.ZodString;
    startedAt: z.ZodString;
    completedAt: z.ZodOptional<z.ZodString>;
    userId: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    userId: string;
    startedAt: string;
    completedAt?: string | undefined;
    notes?: string | undefined;
}, {
    id: string;
    userId: string;
    startedAt: string;
    completedAt?: string | undefined;
    notes?: string | undefined;
}>;
export declare const stocktakeLineSchema: z.ZodObject<{
    id: z.ZodString;
    stocktakeId: z.ZodString;
    productId: z.ZodString;
    countedQuantity: z.ZodNumber;
    varianceQuantity: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: string;
    productId: string;
    stocktakeId: string;
    countedQuantity: number;
    varianceQuantity: number;
}, {
    id: string;
    productId: string;
    stocktakeId: string;
    countedQuantity: number;
    varianceQuantity: number;
}>;
export declare const customerSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    createdAt: string;
    phone?: string | undefined;
    email?: string | undefined;
}, {
    id: string;
    name: string;
    createdAt: string;
    phone?: string | undefined;
    email?: string | undefined;
}>;
export declare const saleSchema: z.ZodObject<{
    id: z.ZodString;
    number: z.ZodString;
    createdAt: z.ZodString;
    userId: z.ZodString;
    customerId: z.ZodOptional<z.ZodString>;
    totalAmount: z.ZodNumber;
    currency: z.ZodEnum<["ZMW", "USD"]>;
    paymentMethod: z.ZodEnum<["cash", "mobile_money", "card", "tab"]>;
}, "strip", z.ZodTypeAny, {
    number: string;
    id: string;
    createdAt: string;
    userId: string;
    totalAmount: number;
    currency: "ZMW" | "USD";
    paymentMethod: "cash" | "mobile_money" | "card" | "tab";
    customerId?: string | undefined;
}, {
    number: string;
    id: string;
    createdAt: string;
    userId: string;
    totalAmount: number;
    currency: "ZMW" | "USD";
    paymentMethod: "cash" | "mobile_money" | "card" | "tab";
    customerId?: string | undefined;
}>;
export declare const saleLineSchema: z.ZodObject<{
    id: z.ZodString;
    saleId: z.ZodString;
    productId: z.ZodString;
    quantity: z.ZodNumber;
    unitPrice: z.ZodNumber;
    lineTotal: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: string;
    productId: string;
    quantity: number;
    saleId: string;
    unitPrice: number;
    lineTotal: number;
}, {
    id: string;
    productId: string;
    quantity: number;
    saleId: string;
    unitPrice: number;
    lineTotal: number;
}>;
