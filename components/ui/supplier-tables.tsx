"use client";

import { DataTable, Column } from "@/components/ui/data-table";
import { CurrencyCell } from "@/components/ui/data-table-cells";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface SupplierProduct {
  id: string;
  sku: string;
  name: string;
  stockLevel: number;
  costPrice: number;
  sellingPrice: number;
  isActive: boolean;
}

interface SupplierOrder {
  id: string;
  poNumber: string;
  status: string;
  total: number;
  orderDate: Date;
}

interface SupplierTablesProps {
  products: SupplierProduct[];
  orders: SupplierOrder[];
}

export function SupplierProductsTable({ products }: { products: SupplierProduct[] }) {
  const columns: Column<SupplierProduct>[] = [
    {
      key: "sku",
      header: "SKU",
      render: (product) => (
        <span className="font-mono text-sm">{product.sku}</span>
      ),
    },
    {
      key: "name",
      header: "Product",
      render: (product) => (
        <Link 
          href={`/inventory/products/${product.id}`}
          className="font-medium hover:underline"
        >
          {product.name}
        </Link>
      ),
    },
    {
      key: "stockLevel",
      header: "Stock",
      render: (product) => product.stockLevel.toLocaleString(),
    },
    {
      key: "costPrice",
      header: "Cost",
      render: (product) => (
        <CurrencyCell value={product.costPrice} />
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (product) => (
        <Badge variant={product.isActive ? "default" : "secondary"}>
          {product.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  return <DataTable columns={columns} data={products} />;
}

export function SupplierOrdersTable({ orders }: { orders: SupplierOrder[] }) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "RECEIVED": return "default";
      case "ORDERED": return "secondary";
      case "DRAFT": return "outline";
      case "CANCELLED": return "destructive";
      default: return "outline";
    }
  };

  const columns: Column<SupplierOrder>[] = [
    {
      key: "poNumber",
      header: "Order #",
      render: (order) => (
        <Link 
          href={`/inventory/orders/${order.id}`}
          className="font-medium hover:underline"
        >
          {order.poNumber}
        </Link>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (order) => (
        <Badge variant={getStatusVariant(order.status)}>
          {order.status}
        </Badge>
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
      header: "Date",
      render: (order) => new Date(order.orderDate).toLocaleDateString(),
    },
  ];

  return <DataTable columns={columns} data={orders} />;
}
