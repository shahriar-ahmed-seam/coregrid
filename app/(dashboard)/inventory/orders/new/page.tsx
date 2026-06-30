"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, CalendarIcon, Plus, Trash2, Package } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { createPurchaseOrder } from "../actions";
import { use, useEffect } from "react";

const orderSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  expectedDate: z.date().optional(),
  notes: z.string().max(1000).optional(),
  items: z.array(z.object({
    productId: z.string().min(1, "Product is required"),
    quantity: z.number().int().positive("Quantity must be positive"),
    unitPrice: z.number().positive("Price must be positive"),
  })).min(1, "At least one item is required"),
});

type OrderFormData = z.infer<typeof orderSchema>;

interface NewOrderPageProps {
  searchParams: Promise<{ supplier?: string }>;
}

export default function NewOrderPage({ searchParams }: NewOrderPageProps) {
  const params = use(searchParams);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string; sku: string; costPrice: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      supplierId: params.supplier || undefined,
      expectedDate: undefined,
      notes: "",
      items: [{ productId: undefined, quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const selectedSupplierId = form.watch("supplierId");
  const items = form.watch("items");

  const subtotal = items.reduce((sum, item) => {
    const qty = item.quantity || 0;
    const price = item.unitPrice || 0;
    return sum + qty * price;
  }, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  useEffect(() => {
    // Load suppliers
    fetch("/api/inventory/suppliers")
      .then((res) => res.json())
      .then((data) => setSuppliers(data))
      .catch(() => toast.error("Failed to load suppliers"));
  }, []);

  useEffect(() => {
    if (selectedSupplierId) {
      // Load products from selected supplier
      fetch(`/api/inventory/products?supplier=${selectedSupplierId}`)
        .then((res) => res.json())
        .then((data) => {
          setProducts(data);
          setIsLoading(false);
        })
        .catch(() => toast.error("Failed to load products"));
    } else {
      // Load all products
      fetch("/api/inventory/products")
        .then((res) => res.json())
        .then((data) => {
          setProducts(data);
          setIsLoading(false);
        })
        .catch(() => toast.error("Failed to load products"));
    }
  }, [selectedSupplierId]);

  const handleProductChange = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      form.setValue(`items.${index}.productId`, productId);
      form.setValue(`items.${index}.unitPrice`, product.costPrice);
    }
  };

  async function onSubmit(data: OrderFormData) {
    setIsSubmitting(true);
    try {
      const result = await createPurchaseOrder({
        supplierId: data.supplierId,
        expectedDate: data.expectedDate,
        notes: data.notes,
        items: data.items,
      });

      if (result.success) {
        toast.success("Purchase order created successfully");
        router.push("/inventory/orders");
      } else {
        toast.error(result.error || "Failed to create order");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Purchase Order"
        description="Create a new order for inventory replenishment"
        backHref="/inventory/orders"
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
              <CardDescription>Basic information about this purchase order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="supplierId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || "none"}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a supplier" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none" disabled>Select a supplier</SelectItem>
                          {suppliers.map((supplier) => (
                            <SelectItem key={supplier.id} value={supplier.id}>
                              {supplier.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expectedDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Expected Delivery Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? format(field.value, "PPP") : "Pick a date"}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => {
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              return date < today;
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional notes for this order..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
              <CardDescription>Products to include in this purchase order</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => {
                    const itemQty = items[index]?.quantity || 0;
                    const itemPrice = items[index]?.unitPrice || 0;
                    const itemTotal = itemQty * itemPrice;

                    return (
                      <TableRow key={field.id}>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`items.${index}.productId`}
                            render={({ field: f }) => (
                              <FormItem>
                                <Select
                                  onValueChange={(value) => handleProductChange(index, value === "none" ? "" : value)}
                                  value={f.value || "none"}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select product" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="none">Select product</SelectItem>
                                    {products.map((product) => (
                                      <SelectItem key={product.id} value={product.id}>
                                        <span className="flex items-center gap-2">
                                          <Package className="h-4 w-4" />
                                          {product.sku} - {product.name}
                                        </span>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`items.${index}.quantity`}
                            render={({ field: f }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={1}
                                    className="w-24"
                                    value={f.value}
                                    onChange={(e) => f.onChange(e.target.valueAsNumber || 0)}
                                    onBlur={f.onBlur}
                                    name={f.name}
                                    ref={f.ref}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`items.${index}.unitPrice`}
                            render={({ field: f }) => (
                              <FormItem>
                                <FormControl>
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                      $
                                    </span>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      min={0}
                                      className="w-28 pl-7"
                                      value={f.value}
                                      onChange={(e) => f.onChange(e.target.valueAsNumber || 0)}
                                      onBlur={f.onBlur}
                                      name={f.name}
                                      ref={f.ref}
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          ${itemTotal.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => fields.length > 1 && remove(index)}
                            disabled={fields.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => append({ productId: "", quantity: 1, unitPrice: 0 })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>

              {/* Totals */}
              <div className="mt-6 border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (10%):</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Order"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
