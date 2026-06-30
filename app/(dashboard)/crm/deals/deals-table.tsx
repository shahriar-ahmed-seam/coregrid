"use client";

import { Deal, Customer, Contact, User } from "@prisma/client";
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

type DealWithRelations = Omit<Deal, "value"> & {
  value: number;
  customer: Customer;
  contact: Contact | null;
  salesRep: User;
};

interface DealsTableProps {
  deals: DealWithRelations[];
}

const stageColors = {
  LEAD: "secondary",
  QUALIFIED: "default",
  PROPOSAL: "default",
  NEGOTIATION: "default",
  CLOSED_WON: "default",
  CLOSED_LOST: "destructive",
} as const;

const priorityColors = {
  LOW: "secondary",
  MEDIUM: "default",
  HIGH: "destructive",
} as const;

export function DealsTable({ deals }: DealsTableProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/crm/deals/${deleteId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        router.refresh();
        setDeleteId(null);
      }
    } catch (error) {
      console.error("Failed to delete deal:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<DealWithRelations>[] = [
    {
      accessorKey: "title",
      header: "Deal Title",
      cell: (row) => <span className="font-medium">{row.title}</span>,
    },
    {
      accessorKey: "customer",
      header: "Company",
      cell: (row) => row.customer.companyName,
    },
    {
      accessorKey: "contact",
      header: "Contact",
      cell: (row) =>
        row.contact
          ? `${row.contact.firstName} ${row.contact.lastName}`
          : "-",
    },
    {
      accessorKey: "value",
      header: "Value",
      cell: (row) => `$${row.value.toLocaleString()}`,
    },
    {
      accessorKey: "stage",
      header: "Stage",
      cell: (row) => (
        <Badge variant={stageColors[row.stage as keyof typeof stageColors]}>
          {row.stage.replace("_", " ")}
        </Badge>
      ),
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: (row) => (
        <Badge variant={priorityColors[row.priority as keyof typeof priorityColors]}>{row.priority}</Badge>
      ),
    },
    {
      accessorKey: "salesRep",
      header: "Sales Rep",
      cell: (row) => row.salesRep.name || row.salesRep.email,
    },
    {
      accessorKey: "expectedCloseDate",
      header: "Expected Close",
      cell: (row) =>
        row.expectedCloseDate
          ? new Date(row.expectedCloseDate).toLocaleDateString()
          : "-",
    },
    {
      header: "Actions",
      cell: (row) => <ActionsCell deal={row} onDelete={setDeleteId} />,
    },
  ];

  return (
    <>
      <DataTable data={deals} columns={columns} />

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this deal? This action cannot be undone.
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
  deal,
  onDelete,
}: {
  deal: DealWithRelations;
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
        <DropdownMenuItem onClick={() => router.push(`/crm/deals/${deal.id}`)}>
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(`/crm/deals/${deal.id}/edit`)}>
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDelete(deal.id)} className="text-destructive">
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
