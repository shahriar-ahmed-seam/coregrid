"use client";

import { Employee, Department, User } from "@prisma/client";
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

type EmployeeWithRelations = Omit<Employee, 'salary'> & {
  salary: number;
  department: (Omit<Department, 'budget'> & { budget: number }) | null;
  user: Pick<User, "id" | "name" | "email"> | null;
};

interface EmployeesTableProps {
  employees: EmployeeWithRelations[];
}

function ActionsCell({ employee }: { employee: EmployeeWithRelations }) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/hr/employees/${employee.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      toast.success("Employee deleted successfully");
      router.refresh();
      setDeleteOpen(false);
    } catch (error) {
      toast.error("Failed to delete employee");
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
            <Link href={`/hr/employees/${employee.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/hr/employees/${employee.id}/edit`}>
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
        title="Delete Employee"
        description={`Are you sure you want to delete ${employee.firstName} ${employee.lastName}? This action cannot be undone.`}
      />
    </>
  );
}

export function EmployeesTable({ employees }: EmployeesTableProps) {
  const columns: Column<EmployeeWithRelations>[] = [
    {
      accessorKey: "employeeId",
      header: "Employee ID",
    },
    {
      id: "name",
      header: "Name",
      cell: (row) => (
        <div className="font-medium">
          {row.firstName} {row.lastName}
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "position",
      header: "Position",
    },
    {
      id: "department",
      header: "Department",
      cell: (row) => row.department?.name || "N/A",
    },
    {
      accessorKey: "employmentType",
      header: "Type",
      cell: (row) => {
        const type = row.employmentType;
        const colors = {
          FULL_TIME: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
          PART_TIME: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
          CONTRACT: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
          INTERN: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
        };
        return (
          <Badge variant="secondary" className={colors[type]}>
            {type.replace("_", " ")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (row) => {
        const status = row.status;
        const colors = {
          ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
          INACTIVE: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
          ON_LEAVE: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
          TERMINATED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        };
        return (
          <Badge variant="secondary" className={colors[status]}>
            {status.replace("_", " ")}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: (row) => <ActionsCell employee={row} />,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={employees}
      searchKey="name"
      searchPlaceholder="Search employees..."
    />
  );
}
