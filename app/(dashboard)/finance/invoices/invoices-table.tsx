"use client";

import { Invoice, Customer } from "@prisma/client";
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

export type InvoiceWithCustomer = Omit<
  Invoice,
  "subtotal" | "taxAmount" | "discount" | "total" | "taxRate"
> & {
  subtotal: number;
  taxAmount: number;
  discount: number;
  total: number;
  taxRate: number;
  customer: Customer;
};

interface InvoicesTableProps {
  invoices: InvoiceWithCustomer[];
}

const statusColors = {
  DRAFT: "secondary",
  PENDING: "default",
  PAID: "default",
  OVERDUE: "destructive",
  CANCELLED: "secondary",
} as const;

export function InvoicesTable({ invoices }: InvoicesTableProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/finance/invoices/${deleteId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        router.refresh();
        setDeleteId(null);
      }
    } catch (error) {
      console.error("Failed to delete invoice:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<InvoiceWithCustomer>[] = [
    {
      accessorKey: "invoiceNumber",
      header: "Invoice #",
      cell: (row) => <span className="font-medium">{row.invoiceNumber}</span>,
    },
    {
      accessorKey: "customer",
      header: "Customer",
      cell: (row) => row.customer.companyName,
    },
    {
      accessorKey: "issueDate",
      header: "Issue Date",
      cell: (row) => new Date(row.issueDate).toLocaleDateString(),
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: (row) => new Date(row.dueDate).toLocaleDateString(),
    },
    {
      accessorKey: "total",
      header: "Amount",
      cell: (row) => `$${row.total.toLocaleString()}`,
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
      cell: (row) => <ActionsCell invoice={row} onDelete={setDeleteId} />,
    },
  ];

  return (
    <>
      <DataTable data={invoices} columns={columns} />

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this invoice? This action cannot be undone.
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
  invoice,
  onDelete,
}: {
  invoice: InvoiceWithCustomer;
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
        <DropdownMenuItem onClick={() => router.push(`/finance/invoices/${invoice.id}`)}>
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(`/finance/invoices/${invoice.id}/edit`)}>
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDelete(invoice.id)} className="text-destructive">
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
