"use client";

import { Expense, Employee } from "@prisma/client";
import { DataTable, Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ExpenseWithEmployee = Omit<Expense, "amount"> & {
  amount: number;
  employee: Employee;
};

interface ExpensesTableProps {
  expenses: ExpenseWithEmployee[];
}

const statusColors = {
  PENDING: "default",
  APPROVED: "default",
  REJECTED: "destructive",
} as const;

const categoryColors = {
  TRAVEL: "default",
  MEALS: "secondary",
  SUPPLIES: "default",
  EQUIPMENT: "secondary",
  SOFTWARE: "default",
  OTHER: "secondary",
} as const;

export function ExpensesTable({ expenses }: ExpensesTableProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/finance/expenses/${deleteId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        router.refresh();
        setDeleteId(null);
      }
    } catch (error) {
      console.error("Failed to delete expense:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<ExpenseWithEmployee>[] = [
    {
      accessorKey: "employee",
      header: "Employee",
      cell: (row) => `${row.employee.firstName} ${row.employee.lastName}`,
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: (row) => (
        <Badge variant={categoryColors[row.category as keyof typeof categoryColors]}>
          {row.category}
        </Badge>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: (row) => (
        <span className="max-w-xs truncate">{row.description}</span>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: (row) => `$${row.amount.toLocaleString()}`,
    },
    {
      accessorKey: "expenseDate",
      header: "Date",
      cell: (row) => new Date(row.expenseDate).toLocaleDateString(),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (row) => (
        <Badge variant={statusColors[row.status as keyof typeof statusColors]}>
          {row.status}
        </Badge>
      ),
    },
    {
      header: "Actions",
      cell: (row) => <ActionsCell expense={row} onDelete={setDeleteId} />,
    },
  ];

  return (
    <>
      <DataTable data={expenses} columns={columns} />

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this expense? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ActionsCell({
  expense,
  onDelete,
}: {
  expense: ExpenseWithEmployee;
  onDelete: (id: string) => void;
}) {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => router.push(`/finance/expenses/${expense.id}`)}>
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(`/finance/expenses/${expense.id}/edit`)}>
          Edit
        </DropdownMenuItem>
        {expense.status === "PENDING" && (
          <>
            <DropdownMenuItem onClick={() => alert("Approve functionality coming soon")}>
              Approve
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => alert("Reject functionality coming soon")}>
              Reject
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuItem onClick={() => onDelete(expense.id)} className="text-destructive">
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
