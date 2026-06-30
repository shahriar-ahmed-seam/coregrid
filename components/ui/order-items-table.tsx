"use client";

import { DataTable, Column } from "@/components/ui/data-table";
import { CurrencyCell } from "@/components/ui/data-table-cells";
import Link from "next/link";

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  total: number;
  product: {
    id: string;
    name: string;
    sku: string;
  };
}

interface OrderItemsTableProps {
  items: OrderItem[];
}

export function OrderItemsTable({ items }: OrderItemsTableProps) {
  const columns: Column<OrderItem>[] = [
    {
      key: "product",
      header: "Product",
      render: (item) => (
        <div>
          <Link 
            href={`/inventory/products/${item.product.id}`}
            className="font-medium hover:underline"
          >
            {item.product.name}
          </Link>
          <div className="text-sm text-muted-foreground font-mono">
            {item.product.sku}
          </div>
        </div>
      ),
    },
    {
      key: "quantity",
      header: "Quantity",
      render: (item) => item.quantity.toLocaleString(),
    },
    {
      key: "unitPrice",
      header: "Unit Price",
      render: (item) => <CurrencyCell value={item.unitPrice} />,
    },
    {
      key: "total",
      header: "Total",
      render: (item) => <CurrencyCell value={item.total} />,
    },
  ];

  return <DataTable columns={columns} data={items} />;
}
