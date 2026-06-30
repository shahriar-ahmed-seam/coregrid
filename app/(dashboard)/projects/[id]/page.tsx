import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/layout/page-header";
import { Edit } from "lucide-react";

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params;
  
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      department: true,
      tasks: {
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!project) {
    notFound();
  }

  const totalTasks = project.tasks.length;
  const completedTasks = project.tasks.filter(t => t.status === "COMPLETED").length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const statusColors = {
    PLANNING: "secondary",
    IN_PROGRESS: "default",
    ON_HOLD: "secondary",
    COMPLETED: "default",
    CANCELLED: "destructive",
  } as const;

  return (
    <div className="space-y-6">
      <PageHeader
        title={project.name}
        description={project.description || "No description"}
        backHref="/projects"
      >
        <Link href={`/projects/${project.id}/edit`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Edit Project
          </Button>
        </Link>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Status</p>
          <Badge variant={statusColors[project.status as keyof typeof statusColors]}>
            {project.status.replace(/_/g, " ")}
          </Badge>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Progress</p>
          <div className="mt-2">
            <Progress value={progress} className="h-2 mb-1" />
            <p className="text-2xl font-bold">{progress}%</p>
          </div>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Tasks</p>
          <p className="text-2xl font-bold">
            {completedTasks}/{totalTasks}
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Budget</p>
          <p className="text-2xl font-bold">
            {project.budget ? `$${project.budget.toNumber().toLocaleString()}` : "N/A"}
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Project Details</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Department</p>
            <p className="font-medium">{project.department?.name || "N/A"}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <Badge variant={statusColors[project.status as keyof typeof statusColors]}>
              {project.status.replace(/_/g, " ")}
            </Badge>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Start Date</p>
            <p className="font-medium">
              {project.startDate ? new Date(project.startDate).toLocaleDateString() : "N/A"}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">End Date</p>
            <p className="font-medium">
              {project.endDate ? new Date(project.endDate).toLocaleDateString() : "N/A"}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Tasks</h2>
          <Link href={`/projects/${project.id}/tasks`}>
            <Button variant="outline" size="sm">Manage Tasks</Button>
          </Link>
        </div>
        {project.tasks.length > 0 ? (
          <div className="space-y-2">
            {project.tasks.slice(0, 5).map((task) => (
              <div key={task.id} className="flex justify-between items-center p-3 border rounded">
                <div>
                  <p className="font-medium">{task.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {task.assignee?.name || "Unassigned"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>{task.status}</Badge>
                  <Badge variant="outline">{task.priority}</Badge>
                </div>
              </div>
            ))}
            {project.tasks.length > 5 && (
              <p className="text-sm text-muted-foreground text-center pt-2">
                And {project.tasks.length - 5} more tasks...
              </p>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No tasks yet. Add tasks to track progress.
          </p>
        )}
      </Card>
    </div>
  );
}
