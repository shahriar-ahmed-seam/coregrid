"use client";

import { Customer } from "@prisma/client";
import { DataTable, Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteDialog } from "@/components/ui/form-dialog";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type CustomerWithRelations = Customer & {
  _count: {
    contacts: number;
    deals: number;
  };
};

interface CustomersTableProps {
  customers: CustomerWithRelations[];
}

function ActionsCell({ customer }: { customer: CustomerWithRelations }) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/crm/customers/${customer.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      toast.success("Customer deleted successfully");
      router.refresh();
      setDeleteOpen(false);
    } catch (error) {
      toast.error("Failed to delete customer");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={`/crm/customers/${customer.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/crm/customers/${customer.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive"
            onSelect={() => setDeleteOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        title="Delete Customer"
        description={`Are you sure you want to delete ${customer.companyName}? This action cannot be undone.`}
      />
    </>
  );
}

export function CustomersTable({ customers }: CustomersTableProps) {
  const columns: Column<CustomerWithRelations>[] = [
    {
      accessorKey: "companyName",
      header: "Company Name",
      cell: (row) => (
        <div className="font-medium">{row.companyName}</div>
      ),
    },
    {
      accessorKey: "industry",
      header: "Industry",
      cell: (row) => row.industry || "N/A",
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: (row) => row.email || "N/A",
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: (row) => row.phone || "N/A",
    },
    {
      id: "location",
      header: "Location",
      cell: (row) => {
        const parts = [row.city, row.state, row.country].filter(Boolean);
        return parts.length > 0 ? parts.join(", ") : "N/A";
      },
    },
    {
      id: "contacts",
      header: "Contacts",
      cell: (row) => row._count.contacts,
    },
    {
      id: "deals",
      header: "Deals",
      cell: (row) => row._count.deals,
    },
    {
      id: "actions",
      header: "Actions",
      cell: (row) => <ActionsCell customer={row} />,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={customers}
      searchKey="companyName"
      searchPlaceholder="Search customers..."
    />
  );
}
