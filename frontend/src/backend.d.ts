import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface InventoryItem {
    id: ItemId;
    name: string;
    pricePerItem: number;
    quantity: bigint;
    category: ItemCategory;
}
export interface BillItem {
    itemId: ItemId;
    itemName: string;
    quantity: bigint;
    subtotal: number;
}
export type ItemId = bigint;
export type BillId = bigint;
export type ItemCategory = string;
export interface BillRecord {
    id: BillId;
    studentName: string;
    date: string;
    grandTotal: number;
    paymentMode: PaymentMode;
    items: Array<BillItem>;
}
export enum PaymentMode {
    upi = "upi",
    cash = "cash"
}
export interface backendInterface {
    addItem(name: string, category: ItemCategory, quantity: bigint, pricePerItem: number): Promise<ItemId>;
    createBill(studentName: string, items: Array<BillItem>, paymentMode: PaymentMode): Promise<BillId>;
    getBillsByDate(date: string): Promise<Array<BillRecord>>;
    getItems(): Promise<Array<InventoryItem>>;
    getTotals(): Promise<{
        totalStockAvailable: bigint;
        totalIncomeToday: number;
        totalStockSoldToday: bigint;
        totalItems: bigint;
    }>;
    updateItem(itemId: ItemId, name: string, category: ItemCategory, quantity: bigint, pricePerItem: number): Promise<void>;
}
