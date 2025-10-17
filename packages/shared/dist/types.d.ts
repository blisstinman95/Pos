export type UUID = string;
export type CurrencyCode = "ZMW" | "USD";
export interface Product {
    id: UUID;
    sku: string;
    name: string;
    unit: "bottle" | "ml" | "can" | "shot" | "glass" | "crate" | "pack";
    category?: string;
    costPrice: number;
    salePrice: number;
    taxRate: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface StockLevel {
    id: UUID;
    productId: UUID;
    quantity: number;
    location: "main" | "store" | "other";
    updatedAt: string;
}
export interface StockMovement {
    id: UUID;
    productId: UUID;
    type: "in" | "out" | "adjustment";
    quantity: number;
    reason?: string;
    reference?: string;
    createdAt: string;
    userId: UUID;
}
export interface Stocktake {
    id: UUID;
    startedAt: string;
    completedAt?: string;
    userId: UUID;
    notes?: string;
}
export interface StocktakeLine {
    id: UUID;
    stocktakeId: UUID;
    productId: UUID;
    countedQuantity: number;
    varianceQuantity: number;
}
export interface Customer {
    id: UUID;
    name: string;
    phone?: string;
    email?: string;
    createdAt: string;
}
export interface Sale {
    id: UUID;
    number: string;
    createdAt: string;
    userId: UUID;
    customerId?: UUID;
    totalAmount: number;
    currency: CurrencyCode;
    paymentMethod: "cash" | "mobile_money" | "card" | "tab";
}
export interface SaleLine {
    id: UUID;
    saleId: UUID;
    productId: UUID;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
}
export interface SyncEnvelope<T> {
    deviceId: string;
    since?: string;
    data: T[];
}
export interface SyncResponse<T> {
    serverTime: string;
    applied: number;
    conflicts: Array<{
        id: UUID;
        reason: string;
    }>;
    changes: T[];
}
