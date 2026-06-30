"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DataTable, Column } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ArrowUpCircle, ArrowDownCircle, RefreshCw, Activity, Package } from "lucide-react";
import { useDebouncedCallback } from "@/lib/hooks/use-table-state";
import { DateCell } from "@/components/ui/data-table-cells";
import Link from "next/link";

interface StockMovement {
  id: string;
  type: string;
  quantity: number;
  notes: string | null;
  reference: string | null;
  createdAt: Date;
  product: {
    id: string;
    name: string;
    sku: string;
    unit: string;
  };
}

interface StockMovementsTableProps {
  movements: StockMovement[];
  products: { id: string; name: string; sku: string }[];
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  search: string;
  typeFilter: string;
  productFilter: string;
}

export function StockMovementsTable({
  movements,
  products,
  page,
  totalPages,
  total,
  pageSize,
  search,
  typeFilter,
  productFilter,
}: StockMovementsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(search);
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
    router.push(`/inventory/stock-movements?${newParams.toString()}`);
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "PURCHASE":
      case "RETURN":
        return <ArrowUpCircle className="h-4 w-4 text-green-500" />;
      case "SALE":
        return <ArrowDownCircle className="h-4 w-4 text-red-500" />;
      case "ADJUSTMENT":
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "PURCHASE":
      case "RETURN":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "SALE":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "ADJUSTMENT":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      default:
        return "";
    }
  };

  const columns: Column<StockMovement>[] = [
    {
      key: "type",
      header: "Type",
      sortable: true,
      render: (movement) => (
        <div className="flex items-center gap-2">
          {getTypeIcon(movement.type)}
          <Badge className={getTypeColor(movement.type)} variant="outline">
            {movement.type}
          </Badge>
        </div>
      ),
    },
    {
      key: "product",
      header: "Product",
      render: (movement) => (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <div>
            <Link
              href={`/inventory/products/${movement.product.id}`}
              className="font-medium hover:underline"
            >
              {movement.product.name}
            </Link>
            <div className="text-sm text-muted-foreground font-mono">
              {movement.product.sku}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "quantity",
      header: "Quantity",
      sortable: true,
      render: (movement) => (
        <span className={`font-medium ${
          movement.type === "SALE" 
            ? "text-red-600" 
            : movement.type === "PURCHASE" || movement.type === "RETURN"
              ? "text-green-600" 
              : "text-blue-600"
        }`}>
          {movement.quantity < 0 ? "" : "+"}{movement.quantity.toLocaleString()} {movement.product.unit}
        </span>
      ),
    },
    {
      key: "notes",
      header: "Notes",
      render: (movement) => (
        <span className="text-sm max-w-[300px] truncate block">
          {movement.notes || "—"}
        </span>
      ),
    },
    {
      key: "reference",
      header: "Reference",
      render: (movement) => (
        movement.reference ? (
          <span className="font-mono text-sm">{movement.reference}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )
      ),
    },
    {
      key: "createdAt",
      header: "Date",
      sortable: true,
      render: (movement) => <DateCell value={movement.createdAt} format="PPp" />,
    },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search movements..."
            value={searchValue}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </div>
        <Select
          value={typeFilter}
          onValueChange={(value) => updateUrl({ type: value || undefined, page: "1" })}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            <SelectItem value="PURCHASE">Purchase</SelectItem>
            <SelectItem value="SALE">Sale</SelectItem>
            <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
            <SelectItem value="RETURN">Return</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={productFilter}
          onValueChange={(value) => updateUrl({ product: value || undefined, page: "1" })}
        >
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="All Products" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Products</SelectItem>
            {products.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.sku} - {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        data={movements}
        columns={columns}
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
          icon: <Activity className="h-8 w-8" />,
          title: "No stock movements found",
          description: search || typeFilter || productFilter
            ? "Try adjusting your filters"
            : "Stock movements will appear here when inventory changes occur",
        }}
      />
    </>
  );
};
