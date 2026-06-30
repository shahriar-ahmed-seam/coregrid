"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DataTable, Column, RowAction } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ShoppingCart, Package } from "lucide-react";
import { useDebouncedCallback } from "@/lib/hooks/use-table-state";
import { toast } from "sonner";
import { updatePurchaseOrderStatus, deletePurchaseOrder } from "./actions";
import { DeleteDialog } from "@/components/ui/form-dialog";
import { CurrencyCell, DateCell } from "@/components/ui/data-table-cells";

interface Order {
  id: string;
  poNumber: string;
  status: string;
  total: number;
  orderDate: Date;
  expectedDate: Date | null;
  receivedDate: Date | null;
  supplier: { id: string; name: string };
  _count: { items: number };
}

interface OrdersTableProps {
  orders: Order[];
  suppliers: { id: string; name: string }[];
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  search: string;
  statusFilter: string;
  supplierFilter: string;
}

export function OrdersTable({
  orders,
  suppliers,
  page,
  totalPages,
  total,
  pageSize,
  search,
  statusFilter,
  supplierFilter,
}: OrdersTableProps) {
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
    router.push(`/inventory/orders?${newParams.toString()}`);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "secondary";
      case "ORDERED":
        return "default";
      case "RECEIVED":
        return "default";
      case "CANCELLED":
        return "destructive";
      default:
        return "outline";
    }
  };

  const columns: Column<Order>[] = [
    {
      key: "poNumber",
      header: "Order #",
      sortable: true,
      render: (order) => (
        <span className="font-mono font-medium">{order.poNumber}</span>
      ),
    },
    {
      key: "supplier",
      header: "Supplier",
      render: (order) => order.supplier.name,
    },
    {
      key: "status",
      header: "Status",
      render: (order) => (
        <Badge variant={getStatusColor(order.status) as "default" | "secondary" | "destructive" | "outline"}>
          {order.status}
        </Badge>
      ),
    },
    {
      key: "items",
      header: "Items",
      render: (order) => (
        <div className="flex items-center gap-1">
          <Package className="h-4 w-4 text-muted-foreground" />
          {order._count.items}
        </div>
      ),
    },
    {
      key: "total",
      header: "Total",
      render: (order) => (
        <CurrencyCell value={order.total} />
      ),
    },
    {
      key: "orderDate",
      header: "Order Date",
      render: (order) => <DateCell value={order.orderDate} />,
    },
    {
      key: "expectedDate",
      header: "Expected",
      render: (order) => 
        order.expectedDate ? <DateCell value={order.expectedDate} /> : <span className="text-muted-foreground">—</span>,
    },
  ];

  const rowActions: RowAction<Order>[] = [
    {
      label: "View Details",
      onClick: (order) => router.push(`/inventory/orders/${order.id}`),
    },
    {
      label: "Mark as Ordered",
      onClick: async (order) => {
        const result = await updatePurchaseOrderStatus(order.id, "ORDERED");
        if (result.success) {
          toast.success("Order marked as ordered");
        } else {
          toast.error(result.error || "Failed to update order");
        }
      },
      hidden: (order) => order.status !== "DRAFT",
    },
    {
      label: "Mark as Received",
      onClick: async (order) => {
        const result = await updatePurchaseOrderStatus(order.id, "RECEIVED");
        if (result.success) {
          toast.success("Order received, stock updated");
        } else {
          toast.error(result.error || "Failed to update order");
        }
      },
      hidden: (order) => order.status !== "ORDERED",
    },
    {
      label: "Cancel Order",
      onClick: async (order) => {
        const result = await updatePurchaseOrderStatus(order.id, "CANCELLED");
        if (result.success) {
          toast.success("Order cancelled");
        } else {
          toast.error(result.error || "Failed to cancel order");
        }
      },
      hidden: (order) => order.status === "RECEIVED" || order.status === "CANCELLED",
      variant: "destructive",
    },
    {
      label: "Delete",
      onClick: (order) => setDeleteId(order.id),
      hidden: (order) => order.status === "RECEIVED",
      variant: "destructive",
    },
  ];

  const handleDelete = async () => {
    if (!deleteId) return;
    const result = await deletePurchaseOrder(deleteId);

    if (result.success) {
      toast.success("Order deleted successfully");
      setDeleteId(null);
    } else {
      toast.error(result.error || "Failed to delete order");
    }
  };

  const orderToDelete = orders.find((o) => o.id === deleteId);

  return (
    <>
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
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
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="ORDERED">Ordered</SelectItem>
            <SelectItem value="RECEIVED">Received</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={supplierFilter || "all"}
          onValueChange={(value) => updateUrl({ supplier: value === "all" ? undefined : value, page: "1" })}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Suppliers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Suppliers</SelectItem>
            {suppliers.map((supplier) => (
              <SelectItem key={supplier.id} value={supplier.id}>
                {supplier.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        data={orders}
        columns={columns}
        rowActions={rowActions}
        onRowClick={(order) => router.push(`/inventory/orders/${order.id}`)}
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
          icon: <ShoppingCart className="h-8 w-8" />,
          title: "No purchase orders found",
          description: search || statusFilter
            ? "Try adjusting your filters"
            : "Get started by creating your first purchase order",
          action: {
            label: "New Order",
            onClick: () => router.push("/inventory/orders/new"),
          },
        }}
      />

      <DeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Purchase Order"
        description={
          orderToDelete
            ? `Are you sure you want to delete order "${orderToDelete.poNumber}"? This action cannot be undone.`
            : "Are you sure you want to delete this order?"
        }
      />
    </>
  );
}
