import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUpdateItem } from '../hooks/useQueries';
import type { InventoryItem } from '../backend';
import { toast } from 'sonner';
import { CATEGORIES } from '../lib/constants';

interface EditItemModalProps {
  item: InventoryItem | null;
  open: boolean;
  onClose: () => void;
}

export default function EditItemModal({ item, open, onClose }: EditItemModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const updateItem = useUpdateItem();

  useEffect(() => {
    if (item) {
      setName(item.name);
      setCategory(item.category);
      setQuantity(String(Number(item.quantity)));
      setPrice(String(item.pricePerItem));
    }
  }, [item]);

  const handleSave = async () => {
    if (!item) return;
    if (!name.trim() || !category || !quantity || !price) {
      toast.error('Please fill in all fields');
      return;
    }
    const qty = parseInt(quantity, 10);
    const prc = parseFloat(price);
    if (isNaN(qty) || qty < 0) { toast.error('Invalid quantity'); return; }
    if (isNaN(prc) || prc < 0) { toast.error('Invalid price'); return; }

    try {
      await updateItem.mutateAsync({
        itemId: item.id,
        name: name.trim(),
        category,
        quantity: qty,
        pricePerItem: prc,
      });
      toast.success('Item updated successfully');
      onClose();
    } catch {
      toast.error('Failed to update item');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Item Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter item name" />
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Quantity</Label>
              <Input type="number" min="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <Label>Price per Item (₹)</Label>
              <Input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={updateItem.isPending}>Cancel</Button>
          <Button onClick={handleSave} disabled={updateItem.isPending} className="bg-brand hover:bg-brand/90 text-white">
            {updateItem.isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
