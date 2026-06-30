"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
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
import { Package, ArrowUpCircle, ArrowDownCircle, RefreshCw, Loader2 } from "lucide-react";
import { adjustStock } from "../../actions";
import { use, useEffect, useState } from "react";

const adjustmentSchema = z.object({
  type: z.enum(["PURCHASE", "SALE", "ADJUSTMENT", "RETURN"]),
  quantity: z.number().int().positive("Quantity must be a positive number"),
  notes: z.string().min(1, "Notes are required"),
  reference: z.string().optional(),
});

type AdjustmentFormData = z.infer<typeof adjustmentSchema>;

interface AdjustStockPageProps {
  params: Promise<{ id: string }>;
}

export default function AdjustStockPage({ params }: AdjustStockPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<{
    id: string;
    name: string;
    sku: string;
    stockLevel: number;
    unit: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AdjustmentFormData>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: {
      type: "ADJUSTMENT",
      quantity: 1,
      notes: "",
      reference: "",
    },
  });

  const adjustmentType = form.watch("type");
  const quantity = form.watch("quantity") || 0;

  const projectedStock = product
    ? adjustmentType === "SALE"
      ? product.stockLevel - quantity
      : product.stockLevel + quantity
    : 0;

  useEffect(() => {
    fetch(`/api/inventory/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setIsLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load product");
        router.push("/inventory/products");
      });
  }, [id, router]);

  async function onSubmit(data: AdjustmentFormData) {
    if (data.type === "SALE" && projectedStock < 0) {
      toast.error("Cannot reduce stock below zero");
      return;
    }

    setIsSubmitting(true);
    try {
      // Calculate the actual quantity change based on type
      const actualQuantity = data.type === "SALE" ? -data.quantity : data.quantity;
      
      const result = await adjustStock(
        id, 
        actualQuantity, 
        data.type, 
        data.reference || undefined, 
        data.notes
      );

      if (result.success) {
        toast.success("Stock adjusted successfully");
        router.push(`/inventory/products/${id}`);
      } else {
        toast.error(result.error || "Failed to adjust stock");
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

  if (!product) {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Adjust Stock"
        description={`Adjust stock levels for ${product.name}`}
        backHref={`/inventory/products/${id}`}
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Stock Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Current Stock
            </CardTitle>
            <CardDescription>
              {product.sku} - {product.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {product.stockLevel.toLocaleString()}
              <span className="text-lg font-normal text-muted-foreground ml-2">
                {product.unit}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Projected Stock Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {adjustmentType === "SALE" ? (
                <ArrowDownCircle className="h-5 w-5 text-red-500" />
              ) : adjustmentType === "PURCHASE" || adjustmentType === "RETURN" ? (
                <ArrowUpCircle className="h-5 w-5 text-green-500" />
              ) : (
                <RefreshCw className="h-5 w-5 text-blue-500" />
              )}
              Projected Stock
            </CardTitle>
            <CardDescription>After this adjustment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-4xl font-bold ${projectedStock < 0 ? "text-red-500" : ""}`}>
              {projectedStock.toLocaleString()}
              <span className="text-lg font-normal text-muted-foreground ml-2">
                {product.unit}
              </span>
            </div>
            {projectedStock < 0 && (
              <p className="text-sm text-red-500 mt-2">
                Warning: Stock cannot go below zero
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Adjustment Form */}
      <Card>
        <CardHeader>
          <CardTitle>Adjustment Details</CardTitle>
          <CardDescription>
            Enter the details for this stock adjustment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adjustment Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PURCHASE">
                            <span className="flex items-center gap-2">
                              <ArrowUpCircle className="h-4 w-4 text-green-500" />
                              Purchase (Add)
                            </span>
                          </SelectItem>
                          <SelectItem value="SALE">
                            <span className="flex items-center gap-2">
                              <ArrowDownCircle className="h-4 w-4 text-red-500" />
                              Sale (Remove)
                            </span>
                          </SelectItem>
                          <SelectItem value="ADJUSTMENT">
                            <span className="flex items-center gap-2">
                              <RefreshCw className="h-4 w-4 text-blue-500" />
                              Adjustment (Correction)
                            </span>
                          </SelectItem>
                          <SelectItem value="RETURN">
                            <span className="flex items-center gap-2">
                              <ArrowUpCircle className="h-4 w-4 text-orange-500" />
                              Return (Add back)
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {adjustmentType === "PURCHASE" && "Adding stock from a purchase"}
                        {adjustmentType === "SALE" && "Removing stock for a sale"}
                        {adjustmentType === "ADJUSTMENT" && "Correcting stock count (adds to current)"}
                        {adjustmentType === "RETURN" && "Adding stock from a return"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          placeholder="Enter quantity"
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormDescription>
                        Number of {product.unit} to {adjustmentType === "SALE" ? "remove" : "add"}
                      </FormDescription>
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
                        placeholder="Enter notes for this adjustment..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Describe why this adjustment is being made
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., PO-2024-001, INV-001, etc."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional reference number (purchase order, invoice, etc.)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || (adjustmentType === "SALE" && projectedStock < 0)}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adjusting...
                    </>
                  ) : (
                    "Confirm Adjustment"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
