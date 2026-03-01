# Specification

## Summary
**Goal:** Ensure the Dashboard totals refresh automatically after a new bill is created, without requiring a manual page refresh.

**Planned changes:**
- Invalidate and refetch the `useGetTotals` query cache as part of the `createBill` mutation's `onSuccess` callback so the Dashboard immediately reflects the latest data.

**User-visible outcome:** After creating a new bill, the Dashboard's "units sold today" and "income today" cards update their values instantly without needing a manual page refresh.
