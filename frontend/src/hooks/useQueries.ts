import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import type { InventoryItem, BillItem, BillRecord } from "../backend";
import { PaymentMode } from "../backend";
import { getISTDateString } from "../lib/dateUtils";

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

export function useGetNextBillNumber() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ["nextBillNumber"],
    queryFn: async () => {
      if (!actor) return BigInt(1);
      return actor.getNextBillNumber();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateBill() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      studentName: string;
      studentClass: string;
      date: string;
      items: BillItem[];
      paymentMode: PaymentMode;
    }) => {
      if (!actor) throw new Error("Actor not ready. Please wait and try again.");
      // Always pass the IST date to the backend so bills are stored under the correct India calendar date
      const billNumber = await actor.createBill(
        data.studentName,
        data.studentClass,
        data.items,
        data.paymentMode,
        data.date
      );
      return billNumber;
    },
    onSuccess: () => {
      // Invalidate all bills queries (any date) so Dashboard's today-bills query is always refreshed
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      // Invalidate inventory items (stock quantities changed)
      queryClient.invalidateQueries({ queryKey: ["items"] });
      // Invalidate totals (totalItems, totalStockAvailable)
      queryClient.invalidateQueries({ queryKey: ["totals"] });
      // Invalidate next bill number
      queryClient.invalidateQueries({ queryKey: ["nextBillNumber"] });
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

/**
 * Fetches the static inventory totals (totalItems, totalStockAvailable) from the backend,
 * and computes today's sales totals (totalStockSoldToday, totalIncomeToday) by fetching
 * bills for today's IST date client-side.
 */
export function useGetTotals() {
  const { actor, isFetching } = useActor();
  const todayIST = getISTDateString();

  const totalsQuery = useQuery<{
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
    staleTime: 0,
    refetchInterval: 30000,
  });

  const todayBillsQuery = useQuery<BillRecord[]>({
    queryKey: ["bills", todayIST],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBillsByDate(todayIST);
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
    refetchInterval: 30000,
  });

  // Compute today's totals from bills fetched by IST date
  const todayBills = todayBillsQuery.data ?? [];
  let totalStockSoldToday = BigInt(0);
  let totalIncomeToday = 0;
  for (const bill of todayBills) {
    for (const item of bill.items) {
      totalStockSoldToday += item.quantity;
    }
    totalIncomeToday += bill.grandTotal;
  }

  const baseData = totalsQuery.data;

  return {
    data: baseData
      ? {
          totalItems: baseData.totalItems,
          totalStockAvailable: baseData.totalStockAvailable,
          totalStockSoldToday,
          totalIncomeToday,
        }
      : undefined,
    isLoading: totalsQuery.isLoading || todayBillsQuery.isLoading,
    isError: totalsQuery.isError || todayBillsQuery.isError,
  };
}
