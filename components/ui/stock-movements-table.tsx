"use client";

import { DataTable, Column } from "@/components/ui/data-table";
import { DateCell } from "@/components/ui/data-table-cells";
import { Badge } from "@/components/ui/badge";

interface StockMovement {
  id: string;
  type: string;
  quantity: number;
  reference: string | null;
  notes: string | null;
  createdAt: Date;
}

interface StockMovementsTableProps {
  movements: StockMovement[];
}

export function StockMovementsTable({ movements }: StockMovementsTableProps) {
  const columns: Column<StockMovement>[] = [
    {
      id: "createdAt",
      header: "Date",
      cell: (row) => <DateCell date={row.createdAt} format="medium" showTime />,
    },
    {
      id: "type",
      header: "Type",
      cell: (row) => (
        <Badge variant={row.quantity > 0 ? "default" : "secondary"}>
          {row.type}
        </Badge>
      ),
    },
    {
      id: "quantity",
      header: "Quantity",
      cell: (row) => (
        <span className={row.quantity > 0 ? "text-green-600" : "text-red-600"}>
          {row.quantity > 0 ? `+${row.quantity}` : row.quantity}
        </span>
      ),
    },
    { id: "reference", header: "Reference", accessorKey: "reference" },
    { id: "notes", header: "Notes", accessorKey: "notes" },
  ];

  return <DataTable columns={columns} data={movements} />;
}
