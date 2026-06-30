"use client";

import { Project, Department, Task } from "@prisma/client";
import { DataTable, Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";

type ProjectWithStats = Project & {
  budget: number;
  department: Department | null;
  totalTasks: number;
  completedTasks: number;
  progress: number;
};

interface ProjectsTableProps {
  projects: ProjectWithStats[];
}

const statusColors = {
  PLANNING: "secondary",
  IN_PROGRESS: "default",
  ON_HOLD: "secondary",
  COMPLETED: "default",
  CANCELLED: "destructive",
} as const;

export function ProjectsTable({ projects }: ProjectsTableProps) {
  const router = useRouter();

  const columns: Column<ProjectWithStats>[] = [
    {
      accessorKey: "name",
      header: "Project Name",
      cell: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      accessorKey: "department",
      header: "Department",
      cell: (row) => row.department?.name || "N/A",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (row) => (
        <Badge variant={statusColors[row.status as keyof typeof statusColors]}>
          {row.status.replace(/_/g, " ")}
        </Badge>
      ),
    },
    {
      header: "Progress",
      cell: (row) => (
        <div className="flex items-center gap-2 min-w-[150px]">
          <Progress value={row.progress} className="h-2" />
          <span className="text-sm text-muted-foreground">
            {row.progress}%
          </span>
        </div>
      ),
    },
    {
      header: "Tasks",
      cell: (row) => (
        <span className="text-sm">
          {row.completedTasks}/{row.totalTasks}
        </span>
      ),
    },
    {
      accessorKey: "budget",
      header: "Budget",
      cell: (row) => row.budget > 0 ? `$${row.budget.toLocaleString()}` : "N/A",
    },
    {
      accessorKey: "startDate",
      header: "Start Date",
      cell: (row) => row.startDate ? new Date(row.startDate).toLocaleDateString() : "N/A",
    },
    {
      accessorKey: "endDate",
      header: "End Date",
      cell: (row) => row.endDate ? new Date(row.endDate).toLocaleDateString() : "N/A",
    },
    {
      header: "Actions",
      cell: (row) => <ActionsCell project={row} />,
    },
  ];

  return <DataTable data={projects} columns={columns} />;
}

function ActionsCell({ project }: { project: ProjectWithStats }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${project.name}"? This will also delete all associated tasks.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.refresh();
      } else {
        const error = await response.json();
        alert(`Failed to delete project: ${error.error}`);
      }
    } catch (error) {
      console.error("Failed to delete project:", error);
      alert("Failed to delete project");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => router.push(`/projects/${project.id}`)}>
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(`/projects/${project.id}/edit`)}>
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(`/projects/${project.id}/tasks`)}>
          Manage Tasks
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleDelete}
          className="text-destructive"
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
