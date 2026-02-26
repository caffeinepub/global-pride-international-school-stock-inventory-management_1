import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetItems, useAddItem } from "../hooks/useQueries";
import { useActor } from "../hooks/useActor";
import InventoryTable from "../components/InventoryTable";
import EditItemModal from "../components/EditItemModal";
import UpdateStockModal from "../components/UpdateStockModal";
import type { InventoryItem } from "../backend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, AlertCircle, Loader2, Package } from "lucide-react";
import { CATEGORIES } from "../lib/constants";
import { toast } from "sonner";

export default function Inventory() {
  const { actor, isFetching: actorLoading } = useActor();
  const { data: items = [], isLoading, isError } = useGetItems();
  const addItemMutation = useAddItem();
  const queryClient = useQueryClient();

  // Form state — all controlled inputs
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");

  // Validation errors per field
  const [nameError, setNameError] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [quantityError, setQuantityError] = useState("");
  const [priceError, setPriceError] = useState("");
  const [submitError, setSubmitError] = useState("");

  // Modal state
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [stockItem, setStockItem] = useState<InventoryItem | null>(null);

  // Track if form was submitted to show errors
  const formSubmittedRef = useRef(false);

  function clearFieldErrors() {
    setNameError("");
    setCategoryError("");
    setQuantityError("");
    setPriceError("");
    setSubmitError("");
  }

  function validateForm(): boolean {
    let valid = true;

    if (!name.trim()) {
      setNameError("Item name is required.");
      valid = false;
    } else {
      setNameError("");
    }

    if (!category) {
      setCategoryError("Category is required.");
      valid = false;
    } else {
      setCategoryError("");
    }

    const qtyNum = Number(quantity);
    if (!quantity.trim()) {
      setQuantityError("Quantity is required.");
      valid = false;
    } else if (isNaN(qtyNum) || !Number.isInteger(qtyNum) || qtyNum < 1) {
      setQuantityError("Quantity must be a positive whole number.");
      valid = false;
    } else {
      setQuantityError("");
    }

    const priceNum = Number(price);
    if (!price.trim()) {
      setPriceError("Price is required.");
      valid = false;
    } else if (isNaN(priceNum) || priceNum < 0) {
      setPriceError("Price must be a non-negative number.");
      valid = false;
    } else {
      setPriceError("");
    }

    return valid;
  }

  function resetForm() {
    setName("");
    setCategory("");
    setQuantity("");
    setPrice("");
    clearFieldErrors();
    formSubmittedRef.current = false;
  }

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    formSubmittedRef.current = true;
    setSubmitError("");

    // Validate all fields first — do not call backend if invalid
    const isValid = validateForm();
    if (!isValid) return;

    // Check actor readiness
    if (!actor) {
      setSubmitError(
        "System is still initializing. Please wait a moment and try again."
      );
      return;
    }

    const qtyNum = parseInt(quantity, 10);
    const priceNum = parseFloat(price);

    try {
      await addItemMutation.mutateAsync({
        name: name.trim(),
        category: category,
        quantity: qtyNum,
        pricePerItem: priceNum,
      });

      // Explicitly invalidate the items query to force a re-fetch
      await queryClient.invalidateQueries({ queryKey: ["items"] });

      // Show success notification
      toast.success(`"${name.trim()}" added to inventory successfully!`);

      // Reset form to empty state
      resetForm();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to add item. Please try again.";
      setSubmitError(message);
      toast.error("Failed to add item. Please try again.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground">
          Inventory
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your store's product inventory.
        </p>
      </div>

      {/* Add Item Form */}
      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-brand" />
            Add New Item
          </CardTitle>
        </CardHeader>
        <CardContent>
          {actorLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              Connecting to backend…
            </div>
          )}

          {submitError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleAddItem} noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Item Name */}
              <div className="space-y-1">
                <Label htmlFor="item-name">
                  Item Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="item-name"
                  type="text"
                  placeholder="e.g. Notebook"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (nameError) setNameError("");
                  }}
                  disabled={addItemMutation.isPending}
                  className={nameError ? "border-destructive" : ""}
                  autoComplete="off"
                />
                {nameError && (
                  <p className="text-xs text-destructive">{nameError}</p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-1">
                <Label htmlFor="item-category">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={category}
                  onValueChange={(val) => {
                    setCategory(val);
                    if (categoryError) setCategoryError("");
                  }}
                  disabled={addItemMutation.isPending}
                >
                  <SelectTrigger
                    id="item-category"
                    className={categoryError ? "border-destructive" : ""}
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {categoryError && (
                  <p className="text-xs text-destructive">{categoryError}</p>
                )}
              </div>

              {/* Quantity */}
              <div className="space-y-1">
                <Label htmlFor="item-quantity">
                  Quantity <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="item-quantity"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="e.g. 50"
                  value={quantity}
                  onChange={(e) => {
                    setQuantity(e.target.value);
                    if (quantityError) setQuantityError("");
                  }}
                  disabled={addItemMutation.isPending}
                  className={quantityError ? "border-destructive" : ""}
                />
                {quantityError && (
                  <p className="text-xs text-destructive">{quantityError}</p>
                )}
              </div>

              {/* Price */}
              <div className="space-y-1">
                <Label htmlFor="item-price">
                  Price per Item (₹) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="item-price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 25.00"
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);
                    if (priceError) setPriceError("");
                  }}
                  disabled={addItemMutation.isPending}
                  className={priceError ? "border-destructive" : ""}
                />
                {priceError && (
                  <p className="text-xs text-destructive">{priceError}</p>
                )}
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                type="submit"
                className="bg-brand hover:bg-brand/90 text-white"
                disabled={addItemMutation.isPending || actorLoading}
              >
                {addItemMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding…
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add Item
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Package className="w-4 h-4 text-brand" />
            Inventory Items
            {!isLoading && (
              <span className="ml-auto text-xs font-normal text-muted-foreground">
                {items.length} item{items.length !== 1 ? "s" : ""}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isError && (
            <Alert variant="destructive" className="m-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load inventory. Please refresh.
              </AlertDescription>
            </Alert>
          )}
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <InventoryTable
              items={items}
              onEdit={(item) => setEditItem(item)}
              onUpdateStock={(item) => setStockItem(item)}
            />
          )}
        </CardContent>
      </Card>

      {/* Edit Item Modal */}
      {editItem && (
        <EditItemModal
          item={editItem}
          open={!!editItem}
          onClose={() => setEditItem(null)}
        />
      )}

      {/* Update Stock Modal */}
      {stockItem && (
        <UpdateStockModal
          item={stockItem}
          open={!!stockItem}
          onClose={() => setStockItem(null)}
        />
      )}
    </div>
  );
}
