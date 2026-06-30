"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Invoice, Customer } from "@prisma/client";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

const invoiceItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Unit price must be positive"),
});

const invoiceSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  status: z.enum(["DRAFT", "PENDING", "PAID", "OVERDUE", "CANCELLED"]),
  dueDate: z.string().min(1, "Due date is required"),
  taxRate: z.number().min(0).max(100),
  discount: z.number().min(0),
  notes: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface InvoiceFormProps {
  invoice?: Omit<Invoice, "subtotal" | "taxAmount" | "discount" | "total" | "taxRate"> & {
    subtotal: number;
    taxAmount: number;
    discount: number;
    total: number;
    taxRate: number;
    items?: {
      description: string;
      quantity: number;
      unitPrice: number;
    }[];
  };
  customers: Customer[];
}


export function InvoiceForm({ invoice, customers }: InvoiceFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: invoice
      ? {
        customerId: invoice.customerId,
        status: (() => {
          const allowed: ("PENDING" | "DRAFT" | "PAID" | "OVERDUE" | "CANCELLED")[] = [
            "PENDING", "DRAFT", "PAID", "OVERDUE", "CANCELLED",
          ];
          return allowed.includes(invoice.status as any)
            ? (invoice.status as "PENDING" | "DRAFT" | "PAID" | "OVERDUE" | "CANCELLED")
            : "DRAFT";
        })(),
        dueDate: new Date(invoice.dueDate).toISOString().split("T")[0],
        taxRate: invoice.taxRate,
        discount: invoice.discount,
        notes: invoice.notes || "",
        items:
          invoice.items?.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })) || [{ description: "", quantity: 1, unitPrice: 0 }],
      }
      : {
        status: "DRAFT",
        taxRate: 0,
        discount: 0,
        items: [{ description: "", quantity: 1, unitPrice: 0 }],
      },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const customerId = watch("customerId");
  const status = watch("status");
  const taxRate = watch("taxRate");
  const discount = watch("discount");
  const items = watch("items");

  // Calculate totals
  const subtotal = items.reduce((sum, item) => {
    return sum + (item.quantity || 0) * (item.unitPrice || 0);
  }, 0);
  const taxAmount = (subtotal * (taxRate || 0)) / 100;
  const total = subtotal + taxAmount - (discount || 0);

  const onSubmit = async (data: InvoiceFormData) => {
    setIsSubmitting(true);
    try {
      const url = invoice ? `/api/finance/invoices/${invoice.id}` : "/api/finance/invoices";
      const method = invoice ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          subtotal,
          taxAmount,
          total,
        }),
      });

      if (response.ok) {
        router.push("/finance/invoices");
        router.refresh();
      } else {
        const errorData = await response.json();
        alert(`Failed to save invoice: ${errorData.details || errorData.error}`);
      }
    } catch (error) {
      console.error("Failed to save invoice:", error);
      alert("Failed to save invoice. Check console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Invoice Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="customerId">Customer *</Label>
            <Select
              value={customerId}
              onValueChange={(value) => setValue("customerId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.companyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.customerId && (
              <p className="text-sm text-destructive mt-1">
                {errors.customerId.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="status">Status *</Label>
            <Select value={status} onValueChange={(value) => setValue("status", value as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="OVERDUE">Overdue</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="dueDate">Due Date *</Label>
            <Input id="dueDate" type="date" {...register("dueDate")} />
            {errors.dueDate && (
              <p className="text-sm text-destructive mt-1">
                {errors.dueDate.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="taxRate">Tax Rate (%)</Label>
            <Input
              id="taxRate"
              type="number"
              step="0.01"
              {...register("taxRate", { valueAsNumber: true })}
            />
          </div>

          <div>
            <Label htmlFor="discount">Discount ($)</Label>
            <Input
              id="discount"
              type="number"
              step="0.01"
              {...register("discount", { valueAsNumber: true })}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Invoice Items</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ description: "", quantity: 1, unitPrice: 0 })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-12 gap-4 items-start">
              <div className="col-span-5">
                <Label htmlFor={`items.${index}.description`}>Description</Label>
                <Input {...register(`items.${index}.description`)} />
                {errors.items?.[index]?.description && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.items[index]?.description?.message}
                  </p>
                )}
              </div>

              <div className="col-span-2">
                <Label htmlFor={`items.${index}.quantity`}>Quantity</Label>
                <Input
                  type="number"
                  {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor={`items.${index}.unitPrice`}>Unit Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                />
              </div>

              <div className="col-span-2">
                <Label>Total</Label>
                <div className="h-10 flex items-center font-medium">
                  ${((items[index]?.quantity || 0) * (items[index]?.unitPrice || 0)).toFixed(2)}
                </div>
              </div>

              <div className="col-span-1 flex items-end">
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal:</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax ({taxRate}%):</span>
            <span className="font-medium">${taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Discount:</span>
            <span className="font-medium">-${(discount || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" {...register("notes")} rows={4} />
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : invoice ? "Update Invoice" : "Create Invoice"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
