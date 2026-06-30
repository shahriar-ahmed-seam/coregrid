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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { createCategory, updateCategory } from "./actions";
import { useState } from "react";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  description: z.string().max(500, "Description is too long").optional(),
  parentId: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  category?: {
    id: string;
    name: string;
    description: string | null;
    parentId: string | null;
  };
  allCategories: { id: string; name: string }[];
}

export function CategoryForm({ category, allCategories }: CategoryFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = !!category;

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || "",
      description: category?.description || "",
      parentId: category?.parentId || "",
    },
  });

  async function onSubmit(data: CategoryFormData) {
    setIsSubmitting(true);
    try {
      const result = isEdit
        ? await updateCategory(category.id, {
            name: data.name,
            description: data.description,
            parentId: data.parentId,
          })
        : await createCategory({
            name: data.name,
            description: data.description,
            parentId: data.parentId,
          });

      if (result.success) {
        toast.success(isEdit ? "Category updated successfully" : "Category created successfully");
        router.push("/inventory/categories");
      } else {
        toast.error(result.error || "Failed to save category");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Filter out the current category from parent options (can't be its own parent)
  const parentOptions = allCategories.filter((c) => c.id !== category?.id);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Electronics, Furniture, etc." {...field} />
              </FormControl>
              <FormDescription>
                A unique name for this category
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe what products belong in this category..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Optional description for this category
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="parentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent Category</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                value={field.value || "none"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="No parent (top-level category)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">No parent (top-level category)</SelectItem>
                  {parentOptions.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Optional: Make this a subcategory of another category
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
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isEdit ? "Updating..." : "Creating..."}
              </>
            ) : (
              isEdit ? "Update Category" : "Create Category"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
