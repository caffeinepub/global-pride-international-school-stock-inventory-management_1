interface PrintableBillProps {
  billNumber: string;
  date: string;
  studentName: string;
  studentClass: string;
  items: Array<{ itemName: string; quantity: number; pricePerItem: number; subtotal: number }>;
  grandTotal: number;
  paymentMode: string;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount);

const formatDisplayDate = (dateStr: string) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

export default function PrintableBill({
  billNumber,
  date,
  studentName,
  studentClass,
  items,
  grandTotal,
  paymentMode,
}: PrintableBillProps) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div id="printable-bill" className="hidden print:block font-mono text-sm text-black bg-white p-6 max-w-sm mx-auto">
      {/* Header */}
      <div className="text-center border-b-2 border-black pb-3 mb-3">
        <p className="font-bold text-lg tracking-widest">RECEIPT</p>
        <p className="font-bold text-base mt-0.5">Global Pride International School</p>
        <p className="text-xs mt-1">Stationery &amp; Inventory Store</p>
      </div>

      {/* Bill meta */}
      <div className="mb-3 border-b border-dashed border-black pb-3 space-y-0.5">
        <div className="flex justify-between">
          <span className="font-bold">Bill No:</span>
          <span className="font-bold">#{billNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold">Date:</span>
          <span>{formatDisplayDate(date)}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold">Time:</span>
          <span>{timeStr}</span>
        </div>
      </div>

      {/* Student info */}
      <div className="mb-3 border-b border-dashed border-black pb-3 space-y-0.5">
        <div className="flex justify-between">
          <span className="font-bold">Student:</span>
          <span>{studentName}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold">Class:</span>
          <span>{studentClass}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold">Payment:</span>
          <span>{paymentMode.toUpperCase()}</span>
        </div>
      </div>

      {/* Items table */}
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

      {/* Grand total */}
      <div className="flex justify-between font-bold text-base border-t-2 border-black pt-2">
        <span>GRAND TOTAL</span>
        <span>{formatCurrency(grandTotal)}</span>
      </div>

      <div className="text-center mt-4 text-xs">
        <p>Thank you for your purchase!</p>
        <p className="mt-0.5">Please keep this receipt for your records.</p>
      </div>
    </div>
  );
}
