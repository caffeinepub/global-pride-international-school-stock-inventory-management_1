import { Pencil, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import type { InventoryItem } from '../backend';

interface InventoryTableProps {
  items: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onUpdateStock: (item: InventoryItem) => void;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount);

export default function InventoryTable({ items, onEdit, onUpdateStock }: InventoryTableProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-sm">No items in inventory yet. Add your first item above.</p>
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
            <TableHead className="font-semibold text-foreground text-right">Qty Available</TableHead>
            <TableHead className="font-semibold text-foreground text-right">Price / Item</TableHead>
            <TableHead className="font-semibold text-foreground text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={String(item.id)} className="hover:bg-muted/20 transition-colors">
              <TableCell className="font-medium text-foreground">{item.name}</TableCell>
              <TableCell>
                <Badge variant="secondary" className="text-xs">{item.category}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <span className={Number(item.quantity) === 0 ? 'text-destructive font-semibold' : Number(item.quantity) <= 5 ? 'text-amber font-semibold' : 'text-foreground'}>
                  {Number(item.quantity)}
                </span>
              </TableCell>
              <TableCell className="text-right font-medium">{formatCurrency(item.pricePerItem)}</TableCell>
              <TableCell>
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(item)}
                    className="h-8 px-2 text-brand hover:text-brand hover:bg-brand/10"
                  >
                    <Pencil className="w-3.5 h-3.5 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onUpdateStock(item)}
                    className="h-8 px-2 text-emerald hover:text-emerald hover:bg-emerald/10"
                  >
                    <PlusCircle className="w-3.5 h-3.5 mr-1" />
                    Add Stock
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
