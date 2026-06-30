"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useState } from "react";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
  estimatedHours: z.number().min(0).optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  projectId: string;
  users: Array<{ id: string; name: string | null }>;
}

export function TaskForm({ projectId, users }: TaskFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      status: "TODO",
      priority: "MEDIUM",
    },
  });

  const status = watch("status");
  const priority = watch("priority");
  const assigneeId = watch("assigneeId");

  const onSubmit = async (data: TaskFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/projects/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          projectId,
        }),
      });

      if (response.ok) {
        reset({
          status: "TODO",
          priority: "MEDIUM",
          title: "",
          description: "",
          assigneeId: undefined,
          dueDate: "",
          estimatedHours: 0,
        });
        router.refresh();
      } else {
        const errorData = await response.json();
        alert(`Failed to create task: ${errorData.details || errorData.error}`);
      }
    } catch (error) {
      console.error("Failed to create task:", error);
      alert("Failed to create task. Check console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-2">
          <Label htmlFor="title">Title *</Label>
          <Input id="title" {...register("title")} />
          {errors.title && (
            <p className="text-sm text-destructive mt-1">
              {errors.title.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="priority">Priority *</Label>
          <Select value={priority} onValueChange={(value) => setValue("priority", value as any)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="URGENT">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="status">Status *</Label>
          <Select value={status} onValueChange={(value) => setValue("status", value as any)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODO">To Do</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="REVIEW">Review</SelectItem>
              <SelectItem value="DONE">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="assigneeId">Assignee</Label>
          <Select value={assigneeId || "unassigned"} onValueChange={(value) => setValue("assigneeId", value === "unassigned" ? undefined : value)}>
            <SelectTrigger>
              <SelectValue placeholder="Unassigned" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name || "Unknown"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="dueDate">Due Date</Label>
          <Input id="dueDate" type="date" {...register("dueDate")} />
        </div>

        <div>
          <Label htmlFor="estimatedHours">Estimated Hours</Label>
          <Input
            id="estimatedHours"
            type="number"
            step="0.5"
            {...register("estimatedHours", { valueAsNumber: true })}
          />
        </div>

        <div className="col-span-4">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" {...register("description")} rows={2} />
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Adding..." : "Add Task"}
      </Button>
    </form>
  );
}
