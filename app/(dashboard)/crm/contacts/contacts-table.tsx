"use client";

import { Contact, Customer } from "@prisma/client";
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

type ContactWithCustomer = Contact & {
  customer: Customer;
};

interface ContactsTableProps {
  contacts: ContactWithCustomer[];
}

export function ContactsTable({ contacts }: ContactsTableProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/crm/contacts/${deleteId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        router.refresh();
        setDeleteId(null);
      }
    } catch (error) {
      console.error("Failed to delete contact:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<ContactWithCustomer>[] = [
    {
      accessorKey: "firstName",
      header: "Name",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">
            {row.firstName} {row.lastName}
          </span>
          {row.isPrimary && <Badge variant="secondary">Primary</Badge>}
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: (row) => row.email || "-",
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: (row) => row.phone || "-",
    },
    {
      accessorKey: "jobTitle",
      header: "Job Title",
      cell: (row) => row.jobTitle || "-",
    },
    {
      accessorKey: "customer",
      header: "Company",
      cell: (row) => row.customer.companyName,
    },
    {
      header: "Actions",
      cell: (row) => <ActionsCell contact={row} onDelete={setDeleteId} />,
    },
  ];

  return (
    <>
      <DataTable data={contacts} columns={columns} />

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this contact? This action cannot be undone.
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
  contact,
  onDelete,
}: {
  contact: ContactWithCustomer;
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
        <DropdownMenuItem onClick={() => router.push(`/crm/contacts/${contact.id}`)}>
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(`/crm/contacts/${contact.id}/edit`)}>
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDelete(contact.id)} className="text-destructive">
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
