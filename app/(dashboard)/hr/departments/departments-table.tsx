"use client";

import { Department, Employee } from "@prisma/client";
import { DataTable, Column } from "@/components/ui/data-table";
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

type DepartmentWithRelations = Omit<Department, 'budget'> & {
  budget: number;
  manager: (Omit<Employee, 'salary'> & { salary: number }) | null;
  _count: {
    employees: number;
  };
};

interface DepartmentsTableProps {
  departments: DepartmentWithRelations[];
}

function ActionsCell({ department }: { department: DepartmentWithRelations }) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/hr/departments/${department.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete");
      }

      toast.success("Department deleted successfully");
      router.refresh();
      setDeleteOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete department");
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
            <Link href={`/hr/departments/${department.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/hr/departments/${department.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive"
            onSelect={() => setDeleteOpen(true)}
            disabled={department._count.employees > 0}
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
        title="Delete Department"
        description={`Are you sure you want to delete ${department.name}? This action cannot be undone.`}
      />
    </>
  );
}

export function DepartmentsTable({ departments }: DepartmentsTableProps) {
  const columns: Column<DepartmentWithRelations>[] = [
    {
      accessorKey: "code",
      header: "Code",
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: (row) => (
        <div className="font-medium">{row.name}</div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: (row) => (
        <div className="max-w-[300px] truncate">
          {row.description || "N/A"}
        </div>
      ),
    },
    {
      id: "manager",
      header: "Manager",
      cell: (row) => {
        const manager = row.manager;
        return manager ? `${manager.firstName} ${manager.lastName}` : "N/A";
      },
    },
    {
      id: "employees",
      header: "Employees",
      cell: (row) => row._count.employees,
    },
    {
      accessorKey: "budget",
      header: "Budget",
      cell: (row) => {
        const budget = row.budget;
        return budget ? `$${Number(budget).toLocaleString()}` : "N/A";
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: (row) => <ActionsCell department={row} />,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={departments}
      searchKey="name"
      searchPlaceholder="Search departments..."
    />
  );
}
