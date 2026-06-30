"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { DataTable, Column, RowAction } from "@/components/ui/data-table";
import { CurrencyCell, StockLevelCell } from "@/components/ui/data-table-cells";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Trash2, Eye, Package } from "lucide-react";
import { useState, useTransition } from "react";
import { DeleteDialog } from "@/components/ui/form-dialog";
import { deleteProduct } from "./actions";
import { toast } from "sonner";
import Link from "next/link";

interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  stockLevel: number;
  reorderPoint: number;
  costPrice: number;
  sellingPrice: number;
  unit: string;
  isActive: boolean;
  category: { id: string; name: string } | null;
  supplier: { id: string; name: string } | null;
}

interface ProductsTableProps {
  products: Product[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  categories: { id: string; name: string }[];
  suppliers: { id: string; name: string }[];
}

export function ProductsTable({
  products,
  totalCount,
  pageIndex,
  pageSize,
  categories,
  suppliers,
}: ProductsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Update URL params
  const updateParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handlePageChange = (page: number) => {
    updateParams({ page: page === 0 ? undefined : String(page) });
  };

  const handlePageSizeChange = (size: number) => {
    updateParams({ size: size === 10 ? undefined : String(size), page: undefined });
  };

  const handleSort = (column: string, order: "asc" | "desc") => {
    updateParams({ sortBy: column, sortOrder: order });
  };

  const handleSearch = (query: string) => {
    updateParams({ search: query || undefined, page: undefined });
  };

  const handleCategoryFilter = (categoryId: string) => {
    updateParams({ 
      category: categoryId === "all" ? undefined : categoryId,
      page: undefined 
    });
  };

  const handleSupplierFilter = (supplierId: string) => {
    updateParams({ 
      supplier: supplierId === "all" ? undefined : supplierId,
      page: undefined 
    });
  };

  const handleDelete = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteProduct(productToDelete.id);
      if (result.success) {
        toast.success("Product deleted successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete product");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const getStockStatus = (stock: number, reorder: number) => {
    if (stock === 0) return { label: "Out of Stock", variant: "destructive" as const };
    if (stock <= reorder) return { label: "Low Stock", variant: "secondary" as const };
    return { label: "In Stock", variant: "default" as const };
  };

  const columns: Column<Product>[] = [
    { 
      id: "sku", 
      header: "SKU", 
      accessorKey: "sku", 
      sortable: true,
      className: "font-mono text-sm",
    },
    { 
      id: "name", 
      header: "Product Name", 
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="font-medium">{row.name}</p>
            {row.description && (
              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                {row.description}
              </p>
            )}
          </div>
        </div>
      ),
      sortable: true,
    },
    { 
      id: "category", 
      header: "Category", 
      cell: (row) => row.category?.name || "—"
    },
    { 
      id: "supplier", 
      header: "Supplier", 
      cell: (row) => row.supplier?.name || "—"
    },
    {
      id: "stockLevel",
      header: "Stock",
      cell: (row) => (
        <StockLevelCell 
          current={row.stockLevel} 
          minimum={row.reorderPoint} 
        />
      ),
      sortable: true,
    },
    {
      id: "costPrice",
      header: "Cost",
      cell: (row) => <CurrencyCell value={Number(row.costPrice)} />,
      sortable: true,
    },
    {
      id: "sellingPrice",
      header: "Price",
      cell: (row) => <CurrencyCell value={Number(row.sellingPrice)} />,
      sortable: true,
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => {
        const status = getStockStatus(row.stockLevel, row.reorderPoint);
        return <Badge variant={status.variant}>{status.label}</Badge>;
      },
    },
  ];

  const rowActions: RowAction<Product>[] = [
    {
      label: "View Details",
      icon: <Eye className="h-4 w-4" />,
      onClick: (row) => router.push(`/inventory/products/${row.id}`),
    },
    {
      label: "Edit",
      icon: <Edit className="h-4 w-4" />,
      onClick: (row) => router.push(`/inventory/products/${row.id}/edit`),
    },
    {
      label: "Delete",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (row) => {
        setProductToDelete(row);
        setDeleteDialogOpen(true);
      },
      variant: "destructive",
      separator: true,
    },
  ];

  const currentCategory = searchParams.get("category") || "all";
  const currentSupplier = searchParams.get("supplier") || "all";
  const currentSearch = searchParams.get("search") || "";
  const currentSortBy = searchParams.get("sortBy") || "createdAt";
  const currentSortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || "desc";

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Select value={currentCategory} onValueChange={handleCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={currentSupplier} onValueChange={handleSupplierFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Suppliers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Suppliers</SelectItem>
            {suppliers.map((sup) => (
              <SelectItem key={sup.id} value={sup.id}>
                {sup.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" asChild>
          <Link href="/inventory/stock-movements">Stock Movements</Link>
        </Button>
      </div>

      {/* Data Table */}
      <DataTable
        data={products}
        columns={columns}
        rowActions={rowActions}
        searchPlaceholder="Search products by name, SKU, or description..."
        searchValue={currentSearch}
        onSearch={handleSearch}
        pageIndex={pageIndex}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        sortBy={currentSortBy}
        sortOrder={currentSortOrder}
        onSort={handleSort}
        isLoading={isPending}
        emptyMessage="No products found. Add your first product to get started."
      />

      {/* Delete Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        itemName={productToDelete?.name || ""}
        itemType="product"
        onDelete={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
