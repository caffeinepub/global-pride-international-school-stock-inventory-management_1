import { Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { InventoryItem } from '../backend';

export interface LineItem {
  itemId: string;
  itemName: string;
  quantity: string;
  pricePerItem: number;
  subtotal: number;
  availableQty: number;
  error?: string;
}

interface BillLineItemProps {
  lineItem: LineItem;
  inventoryItems: InventoryItem[];
  index: number;
  onItemChange: (index: number, itemId: string) => void;
  onQuantityChange: (index: number, qty: string) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount);

export default function BillLineItem({
  lineItem,
  inventoryItems,
  index,
  onItemChange,
  onQuantityChange,
  onRemove,
  canRemove,
}: BillLineItemProps) {
  return (
    <div className="grid grid-cols-12 gap-2 items-start">
      {/* Item selector */}
      <div className="col-span-5">
        <Select value={lineItem.itemId} onValueChange={(val) => onItemChange(index, val)}>
          <SelectTrigger className={lineItem.error ? 'border-destructive' : ''}>
            <SelectValue placeholder="Select item..." />
          </SelectTrigger>
          <SelectContent>
            {inventoryItems.map((item) => (
              <SelectItem key={String(item.id)} value={String(item.id)}>
                {item.name} (Stock: {Number(item.quantity)})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Quantity */}
      <div className="col-span-2">
        <Input
          type="number"
          min="1"
          value={lineItem.quantity}
          onChange={(e) => onQuantityChange(index, e.target.value)}
          placeholder="Qty"
          className={lineItem.error ? 'border-destructive' : ''}
        />
        {lineItem.error && (
          <p className="text-xs text-destructive mt-1">{lineItem.error}</p>
        )}
      </div>

      {/* Price */}
      <div className="col-span-2 flex items-center h-10">
        <span className="text-sm text-muted-foreground">
          {lineItem.pricePerItem > 0 ? formatCurrency(lineItem.pricePerItem) : '—'}
        </span>
      </div>

      {/* Subtotal */}
      <div className="col-span-2 flex items-center h-10">
        <span className="text-sm font-semibold text-foreground">
          {lineItem.subtotal > 0 ? formatCurrency(lineItem.subtotal) : '—'}
        </span>
      </div>

      {/* Remove */}
      <div className="col-span-1 flex items-center h-10">
        {canRemove && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(index)}
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
