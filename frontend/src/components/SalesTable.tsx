import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

export interface SalesRow {
  itemName: string;
  quantitySold: number;
  amountEarned: number;
}

interface SalesTableProps {
  rows: SalesRow[];
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount);

export default function SalesTable({ rows }: SalesTableProps) {
  if (rows.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground text-sm">
        No sales records found for this date.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead className="font-semibold text-foreground">Item Name</TableHead>
            <TableHead className="font-semibold text-foreground text-right">Quantity Sold</TableHead>
            <TableHead className="font-semibold text-foreground text-right">Amount Earned</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, idx) => (
            <TableRow key={idx} className="hover:bg-muted/20">
              <TableCell className="font-medium text-foreground">{row.itemName}</TableCell>
              <TableCell className="text-right">{row.quantitySold}</TableCell>
              <TableCell className="text-right font-medium">{formatCurrency(row.amountEarned)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
