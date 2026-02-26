import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { BillItem, PaymentMode } from '../backend';

// ─── Inventory ───────────────────────────────────────────────────────────────

export function useGetItems() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['items'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getItems();
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
      quantity: bigint;
      pricePerItem: number;
    }) => {
      if (!actor) throw new Error('Actor not ready');
      return actor.addItem(data.name, data.category, data.quantity, data.pricePerItem);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['totals'] });
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
      quantity: bigint;
      pricePerItem: number;
    }) => {
      if (!actor) throw new Error('Actor not ready');
      return actor.updateItem(data.itemId, data.name, data.category, data.quantity, data.pricePerItem);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['totals'] });
    },
  });
}

// ─── Billing ─────────────────────────────────────────────────────────────────

export function useCreateBill() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      studentName: string;
      items: BillItem[];
      paymentMode: PaymentMode;
    }) => {
      if (!actor) throw new Error('Actor not ready');
      return actor.createBill(data.studentName, data.items, data.paymentMode);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['totals'] });
      queryClient.invalidateQueries({ queryKey: ['bills'] });
    },
  });
}

export function useGetBillsByDate(date: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['bills', date],
    queryFn: async () => {
      if (!actor || !date) return [];
      return actor.getBillsByDate(date);
    },
    enabled: !!actor && !isFetching && !!date,
  });
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export function useGetTotals() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['totals'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getTotals();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}
