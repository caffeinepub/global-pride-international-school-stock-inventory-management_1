import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import type { InventoryItem } from '../backend';

interface RemainingStockTableProps {
  items: InventoryItem[];
}

export default function RemainingStockTable({ items }: RemainingStockTableProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No inventory items found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead className="font-semibold text-foreground">Item Name</TableHead>
            <TableHead className="font-semibold text-foreground">Category</TableHead>
            <TableHead className="font-semibold text-foreground text-right">Remaining Stock</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={String(item.id)} className="hover:bg-muted/20">
              <TableCell className="font-medium text-foreground">{item.name}</TableCell>
              <TableCell className="text-muted-foreground">{item.category}</TableCell>
              <TableCell className="text-right">
                <span className={Number(item.quantity) === 0 ? 'text-destructive font-semibold' : Number(item.quantity) <= 5 ? 'text-amber font-semibold' : 'text-foreground'}>
                  {Number(item.quantity)}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
