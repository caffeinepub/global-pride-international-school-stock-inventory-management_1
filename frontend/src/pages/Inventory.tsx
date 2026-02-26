import { useState } from 'react';
import { useGetItems, useAddItem } from '../hooks/useQueries';
import InventoryTable from '../components/InventoryTable';
import EditItemModal from '../components/EditItemModal';
import UpdateStockModal from '../components/UpdateStockModal';
import type { InventoryItem } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PlusCircle, Package } from 'lucide-react';
import { toast } from 'sonner';
import { CATEGORIES } from '../lib/constants';

export default function Inventory() {
  const { data: items = [], isLoading, isError } = useGetItems();
  const addItem = useAddItem();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');

  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [updateStockItem, setUpdateStockItem] = useState<InventoryItem | null>(null);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !category || !quantity || !price) {
      toast.error('Please fill in all fields');
      return;
    }
    const qty = parseInt(quantity, 10);
    const prc = parseFloat(price);
    if (isNaN(qty) || qty < 0) { toast.error('Invalid quantity'); return; }
    if (isNaN(prc) || prc < 0) { toast.error('Invalid price'); return; }

    try {
      await addItem.mutateAsync({ name: name.trim(), category, quantity: BigInt(qty), pricePerItem: prc });
      toast.success(`"${name.trim()}" added to inventory`);
      setName('');
      setCategory('');
      setQuantity('');
      setPrice('');
    } catch {
      toast.error('Failed to add item');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your stock items</p>
      </div>

      {/* Add Item Form */}
      <Card className="shadow-card border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-brand" />
            Add New Item
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddItem}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="space-y-1.5">
                <Label htmlFor="item-name">Item Name <span className="text-destructive">*</span></Label>
                <Input
                  id="item-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Notebook"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="item-category">Category <span className="text-destructive">*</span></Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="item-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="item-qty">Quantity <span className="text-destructive">*</span></Label>
                <Input
                  id="item-qty"
                  type="number"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="item-price">Price per Item (₹) <span className="text-destructive">*</span></Label>
                <Input
                  id="item-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={addItem.isPending}
              className="bg-brand hover:bg-brand-hover text-white"
            >
              {addItem.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Adding...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <PlusCircle className="w-4 h-4" />
                  Add Item
                </span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card className="shadow-card border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Package className="w-4 h-4 text-brand" />
            Inventory Items
            {!isLoading && (
              <span className="ml-auto text-xs font-normal text-muted-foreground">{items.length} item{items.length !== 1 ? 's' : ''}</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isError && (
            <Alert variant="destructive" className="m-4">
              <AlertDescription>Failed to load inventory. Please refresh.</AlertDescription>
            </Alert>
          )}
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : (
            <InventoryTable
              items={items}
              onEdit={setEditItem}
              onUpdateStock={setUpdateStockItem}
            />
          )}
        </CardContent>
      </Card>

      <EditItemModal item={editItem} open={!!editItem} onClose={() => setEditItem(null)} />
      <UpdateStockModal item={updateStockItem} open={!!updateStockItem} onClose={() => setUpdateStockItem(null)} />
    </div>
  );
}
