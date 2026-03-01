import { Package, Layers, ShoppingCart, IndianRupee } from 'lucide-react';
import SummaryCard from '../components/SummaryCard';
import { useGetTotals } from '../hooks/useQueries';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Dashboard() {
  const { data: totals, isLoading, isError } = useGetTotals();

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of your stock and sales activity</p>
      </div>

      {isError && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>Failed to load dashboard data. Please refresh the page.</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <SummaryCard
          title="Total Items in Inventory"
          value={totals ? Number(totals.totalItems) : 0}
          icon={Package}
          iconColor="text-brand"
          iconBg="bg-brand/10"
          subtitle="Distinct product types"
          loading={isLoading}
        />
        <SummaryCard
          title="Total Stock Available"
          value={totals ? Number(totals.totalStockAvailable) : 0}
          icon={Layers}
          iconColor="text-emerald"
          iconBg="bg-emerald/10"
          subtitle="Units across all items"
          loading={isLoading}
        />
        <SummaryCard
          title="Stock Sold Today"
          value={totals ? Number(totals.totalStockSoldToday) : 0}
          icon={ShoppingCart}
          iconColor="text-amber"
          iconBg="bg-amber/10"
          subtitle="Units sold today (IST)"
          loading={isLoading}
        />
        <SummaryCard
          title="Income Today"
          value={totals ? formatCurrency(totals.totalIncomeToday) : '₹0.00'}
          icon={IndianRupee}
          iconColor="text-rose"
          iconBg="bg-rose/10"
          subtitle="Revenue earned today (IST)"
          loading={isLoading}
        />
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-card">
        <h2 className="text-base font-semibold text-foreground mb-2">Quick Guide</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-brand/10 text-brand flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
            <span>Go to <strong className="text-foreground">Inventory</strong> to add or manage stock items.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-brand/10 text-brand flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
            <span>Use <strong className="text-foreground">Billing</strong> to create bills and auto-deduct stock.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-brand/10 text-brand flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
            <span>View <strong className="text-foreground">Reports</strong> for date-wise sales and stock summaries.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-brand/10 text-brand flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
            <span>Dashboard refreshes automatically every 30 seconds.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
