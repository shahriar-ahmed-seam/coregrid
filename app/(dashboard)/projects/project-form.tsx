"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Decimal from "decimal.js";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Project, Department, ProjectStatus } from "@prisma/client";
import { useState } from "react";

const projectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  departmentId: z.string().optional(),
  status: z.enum(["PLANNING", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "CANCELLED"]),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  budget: z.number().min(0).optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  project: Omit<Project, "budget"> & { budget: number };
  departments: Department[];
}

const mapStatusForForm = (status: ProjectStatus) => {
  switch (status) {
    case "ACTIVE":
      return "IN_PROGRESS";
    default:
      return status; // PLANNING, ON_HOLD, COMPLETED, CANCELLED stay same
  }
};

export function ProjectForm({ project, departments }: ProjectFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: project
  ? {
      name: project.name,
      description: project.description || "",
      departmentId: project.departmentId || "",
      status: mapStatusForForm(project.status),
      startDate: project.startDate ? new Date(project.startDate).toISOString().split("T")[0] : "",
      endDate: project.endDate ? new Date(project.endDate).toISOString().split("T")[0] : "",
      budget: project.budget,
    }
  : {
      status: "PLANNING",
    },
  });

  const departmentId = watch("departmentId");
  const status = watch("status");

  const onSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    try {
      const url = project ? `/api/projects/${project.id}` : "/api/projects";
      const method = project ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push("/projects");
        router.refresh();
      } else {
        const errorData = await response.json();
        alert(`Failed to save project: ${errorData.details || errorData.error}`);
      }
    } catch (error) {
      console.error("Failed to save project:", error);
      alert("Failed to save project. Check console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Project Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="departmentId">Department</Label>
            <Select
              value={departmentId || "none"}
              onValueChange={(value) => setValue("departmentId", value === "none" ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
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
                <SelectItem value="PLANNING">Planning</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="ON_HOLD">On Hold</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input id="startDate" type="date" {...register("startDate")} />
          </div>

          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input id="endDate" type="date" {...register("endDate")} />
          </div>

          <div>
            <Label htmlFor="budget">Budget ($)</Label>
            <Input
              id="budget"
              type="number"
              step="0.01"
              {...register("budget", { valueAsNumber: true })}
            />
          </div>

          <div className="col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} rows={4} />
          </div>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : project ? "Update Project" : "Create Project"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
