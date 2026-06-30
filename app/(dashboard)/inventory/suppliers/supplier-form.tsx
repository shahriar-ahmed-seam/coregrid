"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormGrid, FormSection, FormDivider } from "@/components/ui/form-fields";
import { Loader2 } from "lucide-react";
import { createSupplier, updateSupplier } from "./actions";
import { useState } from "react";

const supplierSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name is too long"),
  code: z.string().min(1, "Code is required").max(20, "Code is too long"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().max(30, "Phone is too long").optional(),
  address: z.string().max(500, "Address is too long").optional(),
  city: z.string().max(100, "City is too long").optional(),
  state: z.string().max(100, "State is too long").optional(),
  postalCode: z.string().max(20, "Postal code is too long").optional(),
  country: z.string().max(100, "Country is too long").optional(),
  contactPerson: z.string().max(200, "Contact person is too long").optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  notes: z.string().max(1000, "Notes are too long").optional(),
  paymentTerms: z.string().optional(),
  isActive: z.boolean(),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

interface SupplierFormProps {
  supplier?: {
    id: string;
    name: string;
    code: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    country: string | null;
    contactPerson: string | null;
    website: string | null;
    notes: string | null;
    paymentTerms: string | null;
    isActive: boolean;
  };
}

export function SupplierForm({ supplier }: SupplierFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = !!supplier;

  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: supplier?.name || "",
      code: supplier?.code || "",
      email: supplier?.email || "",
      phone: supplier?.phone || "",
      address: supplier?.address || "",
      city: supplier?.city || "",
      state: supplier?.state || "",
      postalCode: supplier?.postalCode || "",
      country: supplier?.country || "USA",
      contactPerson: supplier?.contactPerson || "",
      website: supplier?.website || "",
      notes: supplier?.notes || "",
      paymentTerms: supplier?.paymentTerms || "Net 30",
      isActive: supplier?.isActive ?? true,
    },
  });

  async function onSubmit(data: SupplierFormData) {
    setIsSubmitting(true);
    try {
      const result = isEdit
        ? await updateSupplier(supplier.id, {
            name: data.name,
            code: data.code,
            email: data.email || undefined,
            phone: data.phone || undefined,
            address: data.address || undefined,
            city: data.city || undefined,
            state: data.state || undefined,
            postalCode: data.postalCode || undefined,
            country: data.country || undefined,
            contactPerson: data.contactPerson || undefined,
            website: data.website || undefined,
            notes: data.notes || undefined,
            paymentTerms: data.paymentTerms || undefined,
            isActive: data.isActive,
          })
        : await createSupplier({
            name: data.name,
            code: data.code,
            email: data.email || undefined,
            phone: data.phone || undefined,
            address: data.address || undefined,
            city: data.city || undefined,
            state: data.state || undefined,
            postalCode: data.postalCode || undefined,
            country: data.country || undefined,
            contactPerson: data.contactPerson || undefined,
            website: data.website || undefined,
            notes: data.notes || undefined,
            paymentTerms: data.paymentTerms || undefined,
            isActive: data.isActive,
          });

      if (result.success) {
        toast.success(isEdit ? "Supplier updated successfully" : "Supplier created successfully");
        router.push("/inventory/suppliers");
      } else {
        toast.error(result.error || "Failed to save supplier");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormSection
          title="Basic Information"
          description="General supplier details"
        >
          <FormGrid>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter supplier name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier Code *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., SUP-001" {...field} />
                  </FormControl>
                  <FormDescription>Unique identifier for this supplier</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormGrid>

          <FormGrid>
            <FormField
              control={form.control}
              name="paymentTerms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Terms</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment terms" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Net 15">Net 15</SelectItem>
                      <SelectItem value="Net 30">Net 30</SelectItem>
                      <SelectItem value="Net 45">Net 45</SelectItem>
                      <SelectItem value="Net 60">Net 60</SelectItem>
                      <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
                      <SelectItem value="Prepaid">Prepaid</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <FormDescription>
                      Inactive suppliers won&apos;t appear in dropdowns
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </FormGrid>
        </FormSection>

        <FormDivider />

        <FormSection
          title="Contact Information"
          description="How to reach this supplier"
        >
          <FormGrid>
            <FormField
              control={form.control}
              name="contactPerson"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Person</FormLabel>
                  <FormControl>
                    <Input placeholder="Primary contact name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="supplier@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormGrid>

          <FormGrid>
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 (555) 000-0000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input placeholder="https://supplier.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormGrid>
        </FormSection>

        <FormDivider />

        <FormSection
          title="Address"
          description="Supplier location details"
        >
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street Address</FormLabel>
                <FormControl>
                  <Input placeholder="123 Main Street" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormGrid cols={4}>
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="City" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input placeholder="State" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postal Code</FormLabel>
                  <FormControl>
                    <Input placeholder="12345" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input placeholder="USA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormGrid>
        </FormSection>

        <FormDivider />

        <FormSection
          title="Additional Information"
          description="Notes and other details"
        >
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Any additional notes about this supplier..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormSection>

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
                {isEdit ? "Updating..." : "Creating..."}
              </>
            ) : (
              isEdit ? "Update Supplier" : "Create Supplier"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
