import { IndianRupee, ShoppingCart, TrendingUp } from 'lucide-react';

interface ReportSummaryProps {
  grandTotal: number;
  totalUnitsSold: number;
  totalIncome: number;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount);

export default function ReportSummary({ grandTotal, totalUnitsSold, totalIncome }: ReportSummaryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-card border border-border rounded-xl p-4 shadow-card">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-brand" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Grand Total</p>
            <p className="text-lg font-bold text-foreground">{formatCurrency(grandTotal)}</p>
          </div>
        </div>
      </div>
      <div className="bg-card border border-border rounded-xl p-4 shadow-card">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber/10 flex items-center justify-center">
            <ShoppingCart className="w-4 h-4 text-amber" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Total Units Sold</p>
            <p className="text-lg font-bold text-foreground">{totalUnitsSold}</p>
          </div>
        </div>
      </div>
      <div className="bg-card border border-border rounded-xl p-4 shadow-card">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald/10 flex items-center justify-center">
            <IndianRupee className="w-4 h-4 text-emerald" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Total Income</p>
            <p className="text-lg font-bold text-foreground">{formatCurrency(totalIncome)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
