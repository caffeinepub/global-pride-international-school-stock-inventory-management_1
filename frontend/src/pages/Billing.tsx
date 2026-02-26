import { useState } from 'react';
import { useGetItems, useCreateBill } from '../hooks/useQueries';
import BillLineItem, { type LineItem } from '../components/BillLineItem';
import PrintableBill from '../components/PrintableBill';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Printer, CheckCircle, Receipt, RotateCcw, Save } from 'lucide-react';
import { toast } from 'sonner';
import { PaymentMode } from '../backend';

const emptyLine = (): LineItem => ({
  itemId: '',
  itemName: '',
  quantity: '',
  pricePerItem: 0,
  subtotal: 0,
  availableQty: 0,
});

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount);

export default function Billing() {
  const { data: inventoryItems = [] } = useGetItems();
  const createBill = useCreateBill();

  const [studentName, setStudentName] = useState('');
  const [paymentMode, setPaymentMode] = useState<'cash' | 'upi'>('cash');
  const [lineItems, setLineItems] = useState<LineItem[]>([emptyLine()]);
  const [submitError, setSubmitError] = useState('');
  const [lastBill, setLastBill] = useState<{
    studentName: string;
    items: Array<{ itemName: string; quantity: number; pricePerItem: number; subtotal: number }>;
    grandTotal: number;
    paymentMode: string;
    billId: string;
  } | null>(null);

  const grandTotal = lineItems.reduce((sum, li) => sum + li.subtotal, 0);

  const handleItemChange = (index: number, itemId: string) => {
    const inv = inventoryItems.find((i) => String(i.id) === itemId);
    setLineItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        itemId,
        itemName: inv?.name ?? '',
        pricePerItem: inv?.pricePerItem ?? 0,
        availableQty: inv ? Number(inv.quantity) : 0,
        subtotal: 0,
        quantity: '',
        error: undefined,
      };
      return updated;
    });
  };

  const handleQuantityChange = (index: number, qty: string) => {
    setLineItems((prev) => {
      const updated = [...prev];
      const li = updated[index];
      const qtyNum = parseInt(qty, 10);
      let error: string | undefined;
      let subtotal = 0;

      if (qty && !isNaN(qtyNum)) {
        if (qtyNum > li.availableQty) {
          error = `Max available: ${li.availableQty}`;
        } else if (qtyNum <= 0) {
          error = 'Quantity must be > 0';
        } else {
          subtotal = qtyNum * li.pricePerItem;
        }
      }

      updated[index] = { ...li, quantity: qty, subtotal, error };
      return updated;
    });
  };

  const handleRemoveLine = (index: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddLine = () => {
    setLineItems((prev) => [...prev, emptyLine()]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!studentName.trim()) {
      setSubmitError('Student name is required');
      return;
    }

    const validLines = lineItems.filter((li) => li.itemId && li.quantity);
    if (validLines.length === 0) {
      setSubmitError('Please add at least one item');
      return;
    }

    const hasErrors = lineItems.some((li) => li.error);
    if (hasErrors) {
      setSubmitError('Please fix the errors in the item list');
      return;
    }

    const billItems = validLines.map((li) => ({
      itemId: BigInt(li.itemId),
      itemName: li.itemName,
      quantity: BigInt(parseInt(li.quantity, 10)),
      subtotal: li.subtotal,
    }));

    try {
      const billId = await createBill.mutateAsync({
        studentName: studentName.trim(),
        items: billItems,
        paymentMode: paymentMode === 'cash' ? PaymentMode.cash : PaymentMode.upi,
      });

      const billData = {
        studentName: studentName.trim(),
        items: validLines.map((li) => ({
          itemName: li.itemName,
          quantity: parseInt(li.quantity, 10),
          pricePerItem: li.pricePerItem,
          subtotal: li.subtotal,
        })),
        grandTotal,
        paymentMode,
        billId: String(billId),
      };

      setLastBill(billData);
      toast.success('Bill saved successfully! Stock has been updated.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save bill';
      setSubmitError(msg);
      toast.error(msg);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleNewBill = () => {
    setLastBill(null);
    setStudentName('');
    setPaymentMode('cash');
    setLineItems([emptyLine()]);
    setSubmitError('');
  };

  // ── Success State ──────────────────────────────────────────────────────────
  if (lastBill) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Billing</h1>
          <p className="text-muted-foreground text-sm mt-1">Bill saved successfully</p>
        </div>

        {/* Big success card */}
        <Card className="border-2 border-emerald/40 shadow-card bg-emerald/5">
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-emerald/15 flex items-center justify-center">
                <CheckCircle className="w-9 h-9 text-emerald" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Bill #{lastBill.billId} Saved!</h2>
                <p className="text-muted-foreground mt-1">
                  {lastBill.studentName} &mdash; {formatCurrency(lastBill.grandTotal)} via{' '}
                  <span className="font-semibold uppercase">{lastBill.paymentMode}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Inventory stock has been automatically updated.
                </p>
              </div>

              {/* Bill summary */}
              <div className="w-full max-w-sm bg-background border border-border rounded-lg overflow-hidden mt-2">
                <div className="px-4 py-2 bg-muted/50 border-b border-border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Bill Summary</p>
                </div>
                <div className="divide-y divide-border">
                  {lastBill.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between px-4 py-2 text-sm">
                      <span className="text-foreground">{item.itemName}</span>
                      <span className="text-muted-foreground">×{item.quantity}</span>
                      <span className="font-medium text-foreground">{formatCurrency(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between px-4 py-3 bg-brand/5 border-t-2 border-brand/20">
                  <span className="font-bold text-foreground">Grand Total</span>
                  <span className="font-bold text-brand text-lg">{formatCurrency(lastBill.grandTotal)}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm mt-2">
                <Button
                  onClick={handlePrint}
                  size="lg"
                  className="flex-1 bg-brand hover:bg-brand-hover text-white font-semibold gap-2 shadow-md text-base py-6"
                >
                  <Printer className="w-5 h-5" />
                  Proceed to Print
                </Button>
                <Button
                  onClick={handleNewBill}
                  size="lg"
                  variant="outline"
                  className="flex-1 border-brand/40 text-brand hover:bg-brand/5 font-semibold gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  New Bill
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Printable bill (hidden on screen, shown on print) */}
        <PrintableBill
          studentName={lastBill.studentName}
          items={lastBill.items}
          grandTotal={lastBill.grandTotal}
          paymentMode={lastBill.paymentMode}
          billId={lastBill.billId}
        />
      </div>
    );
  }

  // ── Billing Form ───────────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Billing</h1>
        <p className="text-muted-foreground text-sm mt-1">Create a new bill for a student</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="shadow-card border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Receipt className="w-4 h-4 text-brand" />
              Bill Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Student & Payment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="student-name">Student Name <span className="text-destructive">*</span></Label>
                <Input
                  id="student-name"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Enter student name"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="payment-mode">Payment Mode <span className="text-destructive">*</span></Label>
                <Select value={paymentMode} onValueChange={(v) => setPaymentMode(v as 'cash' | 'upi')}>
                  <SelectTrigger id="payment-mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Line items section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Items</p>
                {/* Prominent Add Item button at the top of the items section */}
                <Button
                  type="button"
                  onClick={handleAddLine}
                  size="sm"
                  className="bg-brand hover:bg-brand-hover text-white font-semibold gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </Button>
              </div>

              {/* Column headers */}
              <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                <div className="col-span-5">Item</div>
                <div className="col-span-2">Quantity</div>
                <div className="col-span-2">Unit Price</div>
                <div className="col-span-2">Subtotal</div>
                <div className="col-span-1"></div>
              </div>

              <div className="space-y-3">
                {lineItems.map((li, idx) => (
                  <BillLineItem
                    key={idx}
                    lineItem={li}
                    inventoryItems={inventoryItems}
                    index={idx}
                    onItemChange={handleItemChange}
                    onQuantityChange={handleQuantityChange}
                    onRemove={handleRemoveLine}
                    canRemove={lineItems.length > 1}
                  />
                ))}
              </div>

              {/* Secondary Add Item button below the list for convenience */}
              <button
                type="button"
                onClick={handleAddLine}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 border-dashed border-brand/30 text-brand text-sm font-medium hover:border-brand/60 hover:bg-brand/5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Another Item
              </button>
            </div>

            <Separator />

            {/* Grand Total */}
            <div className="flex items-center justify-between bg-muted/40 rounded-lg px-4 py-3">
              <span className="text-base font-semibold text-foreground">Grand Total</span>
              <span className="text-xl font-bold text-brand">{formatCurrency(grandTotal)}</span>
            </div>

            {submitError && (
              <Alert variant="destructive">
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3 pt-1">
              <Button
                type="submit"
                disabled={createBill.isPending}
                size="lg"
                className="bg-brand hover:bg-brand-hover text-white flex-1 sm:flex-none font-semibold"
              >
                {createBill.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving Bill...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Bill
                  </span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
