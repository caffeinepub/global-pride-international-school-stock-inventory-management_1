import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdateItem } from '../hooks/useQueries';
import type { InventoryItem } from '../backend';
import { toast } from 'sonner';

interface UpdateStockModalProps {
  item: InventoryItem | null;
  open: boolean;
  onClose: () => void;
}

export default function UpdateStockModal({ item, open, onClose }: UpdateStockModalProps) {
  const [additionalQty, setAdditionalQty] = useState('');
  const updateItem = useUpdateItem();

  const handleUpdate = async () => {
    if (!item) return;
    const add = parseInt(additionalQty, 10);
    if (isNaN(add) || add <= 0) {
      toast.error('Please enter a valid quantity greater than 0');
      return;
    }
    const newQty = Number(item.quantity) + add;
    try {
      await updateItem.mutateAsync({
        itemId: item.id,
        name: item.name,
        category: item.category,
        quantity: BigInt(newQty),
        pricePerItem: item.pricePerItem,
      });
      toast.success(`Stock updated! New quantity: ${newQty}`);
      setAdditionalQty('');
      onClose();
    } catch {
      toast.error('Failed to update stock');
    }
  };

  const handleClose = () => {
    setAdditionalQty('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Update Stock</DialogTitle>
          <DialogDescription>
            Add new stock for <strong>{item?.name}</strong>. Current quantity: <strong>{item ? Number(item.quantity) : 0}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label>Additional Quantity to Add</Label>
            <Input
              type="number"
              min="1"
              value={additionalQty}
              onChange={(e) => setAdditionalQty(e.target.value)}
              placeholder="Enter quantity to add"
              autoFocus
            />
          </div>
          {additionalQty && !isNaN(parseInt(additionalQty)) && parseInt(additionalQty) > 0 && (
            <p className="text-sm text-muted-foreground">
              New total: <strong className="text-foreground">{Number(item?.quantity ?? 0) + parseInt(additionalQty)}</strong> units
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={updateItem.isPending}>Cancel</Button>
          <Button onClick={handleUpdate} disabled={updateItem.isPending} className="bg-brand hover:bg-brand-hover text-white">
            {updateItem.isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Updating...
              </span>
            ) : 'Update Stock'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
