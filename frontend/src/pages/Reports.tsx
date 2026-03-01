import { useState } from 'react';
import { useGetBillsByDate, useGetItems } from '../hooks/useQueries';
import ReportSummary from '../components/ReportSummary';
import SalesTable from '../components/SalesTable';
import RemainingStockTable from '../components/RemainingStockTable';
import type { SalesRow } from '../components/SalesTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarChart3, Calendar, Package } from 'lucide-react';
import { getISTDateString } from '../lib/dateUtils';

export default function Reports() {
  // Default to today's IST date
  const todayIST = getISTDateString();
  const [selectedDate, setSelectedDate] = useState(todayIST);

  const { data: bills = [], isLoading: billsLoading, isError: billsError } = useGetBillsByDate(selectedDate);
  const { data: inventoryItems = [], isLoading: invLoading } = useGetItems();

  // Aggregate sales data
  const salesMap = new Map<string, SalesRow>();
  let totalUnitsSold = 0;
  let totalIncome = 0;

  for (const bill of bills) {
    for (const item of bill.items) {
      const key = item.itemName;
      const qty = Number(item.quantity);
      const existing = salesMap.get(key);
      if (existing) {
        existing.quantitySold += qty;
        existing.amountEarned += item.subtotal;
      } else {
        salesMap.set(key, {
          itemName: item.itemName,
          quantitySold: qty,
          amountEarned: item.subtotal,
        });
      }
      totalUnitsSold += qty;
      totalIncome += item.subtotal;
    }
  }

  const salesRows = Array.from(salesMap.values());
  const grandTotal = bills.reduce((sum, b) => sum + b.grandTotal, 0);

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground text-sm mt-1">Date-wise sales and stock summary</p>
      </div>

      {/* Date picker */}
      <Card className="shadow-card border-border/60">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-end gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="report-date" className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand" />
                Select Date
              </Label>
              <Input
                id="report-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-48"
                max={todayIST}
              />
            </div>
            {selectedDate && (
              <p className="text-sm text-muted-foreground pb-2">{formatDate(selectedDate)}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {billsError && (
        <Alert variant="destructive">
          <AlertDescription>Failed to load report data. Please try again.</AlertDescription>
        </Alert>
      )}

      {/* Sales Summary */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Sales Summary
        </h2>
        {billsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
          </div>
        ) : (
          <ReportSummary grandTotal={grandTotal} totalUnitsSold={totalUnitsSold} totalIncome={totalIncome} />
        )}
      </div>

      {/* Items Sold Table */}
      <Card className="shadow-card border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-brand" />
            Items Sold
            {!billsLoading && bills.length > 0 && (
              <span className="ml-auto text-xs font-normal text-muted-foreground">{bills.length} bill{bills.length !== 1 ? 's' : ''}</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {billsLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : (
            <SalesTable rows={salesRows} />
          )}
        </CardContent>
      </Card>

      {/* Remaining Stock */}
      <Card className="shadow-card border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Package className="w-4 h-4 text-brand" />
            Remaining Stock
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {invLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : (
            <RemainingStockTable items={inventoryItems} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
