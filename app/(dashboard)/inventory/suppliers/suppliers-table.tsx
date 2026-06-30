"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DataTable, Column, RowAction } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Truck, Package, ShoppingCart, Mail, Phone, Globe } from "lucide-react";
import { useDebouncedCallback } from "@/lib/hooks/use-table-state";
import { toast } from "sonner";
import { deleteSupplier, toggleSupplierStatus } from "./actions";
import { DeleteDialog } from "@/components/ui/form-dialog";

interface Supplier {
  id: string;
  name: string;
  code: string | null;
  email: string | null;
  phone: string | null;
  contactPerson: string | null;
  website: string | null;
  isActive: boolean;
  paymentTerms: string | null;
  _count: {
    products: number;
    purchaseOrders: number;
  };
}

interface SuppliersTableProps {
  suppliers: Supplier[];
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  search: string;
  statusFilter: string;
}

export function SuppliersTable({
  suppliers,
  page,
  totalPages,
  total,
  pageSize,
  search,
  statusFilter,
}: SuppliersTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(search);
  const [deleteId, setDeleteId] = useState<string | null>(null);
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
    router.push(`/inventory/suppliers?${newParams.toString()}`);
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

  const columns: Column<Supplier>[] = [
    {
      key: "name",
      header: "Supplier",
      sortable: true,
      render: (supplier) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Truck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="font-medium">{supplier.name}</div>
            <div className="text-sm text-muted-foreground">{supplier.code}</div>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      render: (supplier) => (
        <div className="space-y-1">
          {supplier.contactPerson && (
            <div className="text-sm font-medium">{supplier.contactPerson}</div>
          )}
          {supplier.email && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Mail className="h-3 w-3" />
              {supplier.email}
            </div>
          )}
          {supplier.phone && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Phone className="h-3 w-3" />
              {supplier.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (supplier) => (
        <Badge variant={supplier.isActive ? "default" : "secondary"}>
          {supplier.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "products",
      header: "Products",
      render: (supplier) => (
        <div className="flex items-center gap-1">
          <Package className="h-4 w-4 text-muted-foreground" />
          {supplier._count.products}
        </div>
      ),
    },
    {
      key: "orders",
      header: "Orders",
      render: (supplier) => (
        <div className="flex items-center gap-1">
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          {supplier._count.purchaseOrders}
        </div>
      ),
    },
    {
      key: "paymentTerms",
      header: "Payment Terms",
      render: (supplier) => (
        <span className="text-sm">{supplier.paymentTerms || "—"}</span>
      ),
    },
  ];

  const rowActions: RowAction<Supplier>[] = [
    {
      label: "View Details",
      onClick: (supplier) => router.push(`/inventory/suppliers/${supplier.id}`),
    },
    {
      label: "Edit",
      onClick: (supplier) => router.push(`/inventory/suppliers/${supplier.id}/edit`),
    },
    {
      label: "View Products",
      onClick: (supplier) => router.push(`/inventory/products?supplier=${supplier.id}`),
    },
    {
      label: (supplier) => (supplier.isActive ? "Deactivate" : "Activate"),
      onClick: async (supplier) => {
        const result = await toggleSupplierStatus(supplier.id);
        if (result.success) {
          toast.success(supplier.isActive ? "Supplier deactivated" : "Supplier activated");
        } else {
          toast.error(result.error || "Failed to update status");
        }
      },
    },
    {
      label: "Delete",
      onClick: (supplier) => setDeleteId(supplier.id),
      variant: "destructive",
    },
  ];

  const handleDelete = async () => {
    if (!deleteId) return;
    const result = await deleteSupplier(deleteId);

    if (result.success) {
      toast.success("Supplier deleted successfully");
      setDeleteId(null);
    } else {
      toast.error(result.error || "Failed to delete supplier");
    }
  };

  const supplierToDelete = suppliers.find((s) => s.id === deleteId);

  return (
    <>
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search suppliers..."
            value={searchValue}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter || "all"}
          onValueChange={(value) => updateUrl({ status: value === "all" ? undefined : value, page: "1" })}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        data={suppliers}
        columns={columns}
        rowActions={rowActions}
        onRowClick={(supplier) => router.push(`/inventory/suppliers/${supplier.id}`)}
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
          icon: <Truck className="h-8 w-8" />,
          title: "No suppliers found",
          description: search
            ? "Try adjusting your search"
            : "Get started by adding your first supplier",
          action: {
            label: "Add Supplier",
            onClick: () => router.push("/inventory/suppliers/new"),
          },
        }}
      />

      <DeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Supplier"
        description={
          supplierToDelete
            ? `Are you sure you want to delete "${supplierToDelete.name}"? This action cannot be undone.`
            : "Are you sure you want to delete this supplier?"
        }
      />
    </>
  );
}
