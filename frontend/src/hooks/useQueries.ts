import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import type { InventoryItem, BillItem, BillRecord } from "../backend";
import { PaymentMode } from "../backend";

export type { InventoryItem, BillItem, BillRecord, PaymentMode };

// ── Inventory ──────────────────────────────────────────────────────────────

export function useGetItems() {
  const { actor, isFetching } = useActor();

  return useQuery<InventoryItem[]>({
    queryKey: ["items"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getItems();
      return result;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      category: string;
      quantity: number;
      pricePerItem: number;
    }) => {
      if (!actor) throw new Error("Actor not ready. Please wait and try again.");
      const itemId = await actor.addItem(
        data.name,
        data.category,
        BigInt(data.quantity),
        data.pricePerItem
      );
      return itemId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
}

export function useUpdateItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      itemId: bigint;
      name: string;
      category: string;
      quantity: number;
      pricePerItem: number;
    }) => {
      if (!actor) throw new Error("Actor not ready. Please wait and try again.");
      await actor.updateItem(
        data.itemId,
        data.name,
        data.category,
        BigInt(data.quantity),
        data.pricePerItem
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
}

// ── Billing ────────────────────────────────────────────────────────────────

export function useCreateBill() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      studentName: string;
      items: BillItem[];
      paymentMode: PaymentMode;
    }) => {
      if (!actor) throw new Error("Actor not ready. Please wait and try again.");
      const billId = await actor.createBill(
        data.studentName,
        data.items,
        data.paymentMode
      );
      return billId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["totals"] });
    },
  });
}

export function useGetBillsByDate(date: string) {
  const { actor, isFetching } = useActor();

  return useQuery<BillRecord[]>({
    queryKey: ["bills", date],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBillsByDate(date);
    },
    enabled: !!actor && !isFetching && !!date,
  });
}

// ── Totals ─────────────────────────────────────────────────────────────────

export function useGetTotals() {
  const { actor, isFetching } = useActor();

  return useQuery<{
    totalItems: bigint;
    totalStockAvailable: bigint;
    totalStockSoldToday: bigint;
    totalIncomeToday: number;
  }>({
    queryKey: ["totals"],
    queryFn: async () => {
      if (!actor) {
        return {
          totalItems: BigInt(0),
          totalStockAvailable: BigInt(0),
          totalStockSoldToday: BigInt(0),
          totalIncomeToday: 0,
        };
      }
      return actor.getTotals();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}
