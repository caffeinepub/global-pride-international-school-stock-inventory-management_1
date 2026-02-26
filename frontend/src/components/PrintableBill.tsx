import type { BillItem } from '../backend';

interface PrintableBillProps {
  studentName: string;
  items: Array<{ itemName: string; quantity: number; pricePerItem: number; subtotal: number }>;
  grandTotal: number;
  paymentMode: string;
  billId?: string;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount);

export default function PrintableBill({ studentName, items, grandTotal, paymentMode, billId }: PrintableBillProps) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div id="printable-bill" className="hidden print:block font-mono text-sm text-black bg-white p-6 max-w-sm mx-auto">
      <div className="text-center border-b-2 border-black pb-3 mb-3">
        <p className="font-bold text-base">RECEIPT</p>
        <p className="text-xs mt-1">Date: {dateStr} | Time: {timeStr}</p>
        {billId && <p className="text-xs">Bill #: {billId}</p>}
      </div>

      <div className="mb-3 border-b border-dashed border-black pb-3">
        <p><span className="font-bold">Student:</span> {studentName}</p>
        <p><span className="font-bold">Payment:</span> {paymentMode.toUpperCase()}</p>
      </div>

      <table className="w-full mb-3 border-b border-dashed border-black pb-3">
        <thead>
          <tr className="border-b border-black">
            <th className="text-left py-1 font-bold">Item</th>
            <th className="text-center py-1 font-bold">Qty</th>
            <th className="text-right py-1 font-bold">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx}>
              <td className="py-0.5 text-left">{item.itemName}</td>
              <td className="py-0.5 text-center">{item.quantity}</td>
              <td className="py-0.5 text-right">{formatCurrency(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between font-bold text-base border-t-2 border-black pt-2">
        <span>GRAND TOTAL</span>
        <span>{formatCurrency(grandTotal)}</span>
      </div>

      <div className="text-center mt-4 text-xs text-gray-600">
        <p>Thank you!</p>
      </div>
    </div>
  );
}
