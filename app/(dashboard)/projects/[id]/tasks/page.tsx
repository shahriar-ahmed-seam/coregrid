import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TaskForm } from "./task-form";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";

interface TasksPageProps {
  params: Promise<{ id: string }>;
}

export default async function TasksPage({ params }: TasksPageProps) {
  const { id } = await params;
  
  const [project, users] = await Promise.all([
    prisma.project.findUnique({
      where: { id },
      include: {
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    prisma.user.findMany({
      where: {
        OR: [
          { role: "ADMIN" },
          { role: "PROJECT_MANAGER" },
          { role: "EMPLOYEE" },
        ],
      },
      select: {
        id: true,
        name: true,
      },
    }),
  ]);

  if (!project) {
    notFound();
  }

  const tasksByStatus = {
    TODO: project.tasks.filter(t => t.status === "TODO"),
    IN_PROGRESS: project.tasks.filter(t => t.status === "IN_PROGRESS"),
    REVIEW: project.tasks.filter(t => t.status === "IN_REVIEW"),
    DONE: project.tasks.filter(t => t.status === "COMPLETED"),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${project.name} - Tasks`}
        description="Manage project tasks and assignments"
        backHref={`/projects/${project.id}`}
      />

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Add New Task</h2>
        <TaskForm projectId={project.id} users={users} />
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        {Object.entries(tasksByStatus).map(([status, tasks]) => (
          <Card key={status} className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">{status.replace(/_/g, " ")}</h3>
              <Badge variant="secondary">{tasks.length}</Badge>
            </div>
            <div className="space-y-2">
              {tasks.map((task) => (
                <div key={task.id} className="p-3 border rounded bg-card">
                  <p className="font-medium text-sm mb-1">{task.title}</p>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">
                      {task.assignee?.name || "Unassigned"}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {task.priority}
                    </Badge>
                  </div>
                  {task.dueDate && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
              {tasks.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No tasks
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
