"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { 
  TextField, 
  TextAreaField, 
  NumberField, 
  SelectField,
  FormGrid,
  FormSection,
  FormDivider,
} from "@/components/ui/form-fields";
import { Loader2 } from "lucide-react";
import { createProduct, updateProduct, ProductFormData } from "./actions";
import { toast } from "sonner";

// ==========================================
// SCHEMA
// ==========================================

const productFormSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  supplierId: z.string().optional(),
  costPrice: z.number().min(0, "Cost price must be positive"),
  sellingPrice: z.number().min(0, "Selling price must be positive"),
  stockLevel: z.number().int().min(0, "Stock level must be non-negative"),
  reorderPoint: z.number().int().min(0, "Reorder point must be non-negative"),
  reorderQty: z.number().int().min(1, "Reorder quantity must be at least 1"),
  unit: z.string().min(1, "Unit is required"),
});

type FormValues = z.infer<typeof productFormSchema>;

// ==========================================
// COMPONENT
// ==========================================

interface ProductFormProps {
  product?: {
    id: string;
    sku: string;
    name: string;
    description: string | null;
    categoryId: string | null;
    supplierId: string | null;
    costPrice: number;
    sellingPrice: number;
    stockLevel: number;
    reorderPoint: number;
    reorderQty: number;
    unit: string;
  };
  categories: { id: string; name: string }[];
  suppliers: { id: string; name: string }[];
}

export function ProductForm({ product, categories, suppliers }: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!product;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      sku: product?.sku || "",
      name: product?.name || "",
      description: product?.description || "",
      categoryId: product?.categoryId || undefined,
      supplierId: product?.supplierId || undefined,
      costPrice: product?.costPrice || 0,
      sellingPrice: product?.sellingPrice || 0,
      stockLevel: product?.stockLevel || 0,
      reorderPoint: product?.reorderPoint || 10,
      reorderQty: product?.reorderQty || 50,
      unit: product?.unit || "pcs",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    try {
      const formData: ProductFormData = {
        ...data,
        isActive: true,
      };

      const result = isEditing
        ? await updateProduct(product.id, formData)
        : await createProduct(formData);

      if (result.success) {
        toast.success(isEditing ? "Product updated successfully" : "Product created successfully");
        router.push("/inventory/products");
      } else {
        toast.error(result.error || "An error occurred");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = [
    { value: "none", label: "No Category" },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  const supplierOptions = [
    { value: "none", label: "No Supplier" },
    ...suppliers.map((s) => ({ value: s.id, label: s.name })),
  ];

  const unitOptions = [
    { value: "pcs", label: "Pieces (pcs)" },
    { value: "kg", label: "Kilograms (kg)" },
    { value: "ltr", label: "Liters (ltr)" },
    { value: "m", label: "Meters (m)" },
    { value: "box", label: "Boxes" },
    { value: "set", label: "Sets" },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormSection title="Basic Information" description="Enter the product details">
        <FormGrid columns={2}>
          <TextField
            label="SKU"
            {...register("sku")}
            error={errors.sku?.message}
            required
            placeholder="e.g., PROD-001"
          />
          <TextField
            label="Product Name"
            {...register("name")}
            error={errors.name?.message}
            required
            placeholder="e.g., Widget Pro"
          />
        </FormGrid>
        
        <TextAreaField
          label="Description"
          {...register("description")}
          error={errors.description?.message}
          placeholder="Enter product description..."
          rows={3}
        />

        <FormGrid columns={2}>
          <SelectField
            label="Category"
            options={categoryOptions}
            value={watch("categoryId") || "none"}
            onValueChange={(value) => setValue("categoryId", value === "none" ? undefined : value)}
          />
          <SelectField
            label="Supplier"
            options={supplierOptions}
            value={watch("supplierId") || "none"}
            onValueChange={(value) => setValue("supplierId", value === "none" ? undefined : value)}
          />
        </FormGrid>
      </FormSection>

      <FormDivider label="Pricing" />

      <FormSection title="Pricing" description="Set cost and selling prices">
        <FormGrid columns={3}>
          <NumberField
            label="Cost Price"
            value={watch("costPrice")}
            onChange={(val) => setValue("costPrice", val ?? 0)}
            error={errors.costPrice?.message}
            required
            min={0}
            step={0.01}
          />
          <NumberField
            label="Selling Price"
            value={watch("sellingPrice")}
            onChange={(val) => setValue("sellingPrice", val ?? 0)}
            error={errors.sellingPrice?.message}
            required
            min={0}
            step={0.01}
          />
          <SelectField
            label="Unit"
            options={unitOptions}
            value={watch("unit")}
            onValueChange={(value) => setValue("unit", value)}
            required
          />
        </FormGrid>
      </FormSection>

      <FormDivider label="Inventory" />

      <FormSection title="Inventory Settings" description="Configure stock levels and reorder points">
        <FormGrid columns={3}>
          <NumberField
            label="Current Stock"
            value={watch("stockLevel")}
            onChange={(val) => setValue("stockLevel", val ?? 0)}
            error={errors.stockLevel?.message}
            required
            min={0}
            allowDecimals={false}
            description={isEditing ? "Stock adjustments are tracked automatically" : undefined}
          />
          <NumberField
            label="Reorder Point"
            value={watch("reorderPoint")}
            onChange={(val) => setValue("reorderPoint", val ?? 10)}
            error={errors.reorderPoint?.message}
            required
            min={0}
            allowDecimals={false}
            description="Alert when stock falls below this level"
          />
          <NumberField
            label="Reorder Quantity"
            value={watch("reorderQty")}
            onChange={(val) => setValue("reorderQty", val ?? 50)}
            error={errors.reorderQty?.message}
            required
            min={1}
            allowDecimals={false}
            description="Default quantity to reorder"
          />
        </FormGrid>
      </FormSection>

      {/* Form Actions */}
      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
