"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DataTable, Column, RowAction } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Folder, FolderOpen, Package } from "lucide-react";
import { useDebouncedCallback } from "@/lib/hooks/use-table-state";
import { toast } from "sonner";
import { deleteCategory, updateCategory } from "./actions";
import { FormDialog, DeleteDialog } from "@/components/ui/form-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Category {
  id: string;
  name: string;
  description: string | null;
  parent: { id: string; name: string } | null;
  _count: {
    products: number;
    children: number;
  };
}

interface CategoriesTableProps {
  categories: Category[];
  allCategories: { id: string; name: string }[];
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  search: string;
}

export function CategoriesTable({
  categories,
  allCategories,
  page,
  totalPages,
  total,
  pageSize,
  search,
}: CategoriesTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(search);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", description: "", parentId: "" });
  const sortBy = searchParams.get("sortBy") || undefined;
  const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || "asc";

  const updateUrl = (params: Record<string, string | undefined>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    router.push(`/inventory/categories?${newParams.toString()}`);
  };

  const handleSort = (column: string, order: "asc" | "desc") => {
    updateUrl({ sortBy: column, sortOrder: order });
  };

  const debouncedSearch = useDebouncedCallback((value: string) => {
    updateUrl({ search: value || undefined, page: "1" });
  }, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    debouncedSearch(e.target.value);
  };

  const columns: Column<Category>[] = [
    {
      key: "name",
      header: "Category",
      sortable: true,
      render: (category) => (
        <div className="flex items-center gap-2">
          {category._count.children > 0 ? (
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Folder className="h-4 w-4 text-muted-foreground" />
          )}
          <div>
            <div className="font-medium">{category.name}</div>
            {category.description && (
              <div className="text-sm text-muted-foreground truncate max-w-[300px]">
                {category.description}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "parent",
      header: "Parent Category",
      render: (category) =>
        category.parent ? (
          <Badge variant="outline">{category.parent.name}</Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "products",
      header: "Products",
      render: (category) => (
        <div className="flex items-center gap-1">
          <Package className="h-4 w-4 text-muted-foreground" />
          {category._count.products}
        </div>
      ),
    },
    {
      key: "children",
      header: "Subcategories",
      render: (category) => (
        <div className="flex items-center gap-1">
          <Folder className="h-4 w-4 text-muted-foreground" />
          {category._count.children}
        </div>
      ),
    },
  ];

  const rowActions: RowAction<Category>[] = [
    {
      label: "Edit",
      onClick: (category) => {
        setEditForm({
          name: category.name,
          description: category.description || "",
          parentId: category.parent?.id || "",
        });
        setEditCategory(category);
      },
    },
    {
      label: "View Products",
      onClick: (category) => router.push(`/inventory/products?category=${category.id}`),
    },
    {
      label: "Delete",
      onClick: (category) => setDeleteId(category.id),
      variant: "destructive",
    },
  ];

  const handleEdit = async () => {
    if (!editCategory) return;
    const result = await updateCategory(editCategory.id, {
      name: editForm.name,
      description: editForm.description || undefined,
      parentId: editForm.parentId || undefined,
    });

    if (result.success) {
      toast.success("Category updated successfully");
      setEditCategory(null);
    } else {
      toast.error(result.error || "Failed to update category");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const result = await deleteCategory(deleteId);

    if (result.success) {
      toast.success("Category deleted successfully");
      setDeleteId(null);
    } else {
      toast.error(result.error || "Failed to delete category");
    }
  };

  const categoryToDelete = categories.find((c) => c.id === deleteId);

  return (
    <>
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={searchValue}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </div>
      </div>

      <DataTable
        data={categories}
        columns={columns}
        rowActions={rowActions}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        pagination={{
          page,
          pageSize,
          total,
          totalPages,
          onPageChange: (newPage) => updateUrl({ page: newPage.toString() }),
        }}
        emptyState={{
          icon: <Folder className="h-8 w-8" />,
          title: "No categories found",
          description: search
            ? "Try adjusting your search"
            : "Get started by creating your first category",
          action: {
            label: "Add Category",
            onClick: () => router.push("/inventory/categories/new"),
          },
        }}
      />

      {/* Edit Dialog */}
      <FormDialog
        open={!!editCategory}
        onOpenChange={(open) => !open && setEditCategory(null)}
        title="Edit Category"
        description="Update category details"
        onSubmit={handleEdit}
        submitLabel="Save Changes"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              placeholder="Category name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              placeholder="Category description (optional)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-parent">Parent Category</Label>
            <Select
              value={editForm.parentId || "none"}
              onValueChange={(value) => setEditForm({ ...editForm, parentId: value === "none" ? "" : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="No parent (top-level)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No parent (top-level)</SelectItem>
                {allCategories
                  .filter((c) => c.id !== editCategory?.id)
                  .map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </FormDialog>

      {/* Delete Dialog */}
      <DeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        description={
          categoryToDelete
            ? `Are you sure you want to delete "${categoryToDelete.name}"? This action cannot be undone.`
            : "Are you sure you want to delete this category?"
        }
      />
    </>
  );
}
