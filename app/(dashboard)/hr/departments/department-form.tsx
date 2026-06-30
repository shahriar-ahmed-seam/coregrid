"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Department, Employee } from "@prisma/client";
import { FormGrid } from "@/components/ui/form-fields";

const departmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  description: z.string().optional(),
  managerId: z.string().optional(),
  budget: z.number().min(0, "Budget must be positive").optional(),
});

type DepartmentFormValues = z.infer<typeof departmentSchema>;

interface DepartmentFormProps {
  department?: Department;
  employees: Employee[];
}

export function DepartmentForm({ department, employees }: DepartmentFormProps) {
  const router = useRouter();
  const isEditing = !!department;

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: department
      ? {
          name: department.name,
          code: department.code,
          description: department.description || "",
          managerId: department.managerId || "",
          budget: department.budget ? Number(department.budget) : undefined,
        }
      : {
          name: "",
          code: "",
          description: "",
          managerId: "",
          budget: undefined,
        },
  });

  const onSubmit = async (data: DepartmentFormValues) => {
    try {
      const url = isEditing
        ? `/api/hr/departments/${department.id}`
        : "/api/hr/departments";
      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save department");
      }

      const savedDepartment = await response.json();
      toast.success(`Department ${isEditing ? "updated" : "created"} successfully`);
      router.push(`/hr/departments/${savedDepartment.id}`);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormGrid cols={2}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Engineering" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department Code</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="ENG" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="managerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Manager</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select manager" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {employees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.firstName} {emp.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Annual Budget</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="0"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormGrid>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? isEditing
                    ? "Updating..."
                    : "Creating..."
                  : isEditing
                  ? "Update Department"
                  : "Create Department"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
