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
import { Employee } from "@prisma/client";
import { FormGrid } from "@/components/ui/form-fields";
import { differenceInDays, format } from "date-fns";
import { useEffect } from "react";

const leaveRequestSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  leaveType: z.enum(["ANNUAL", "SICK", "PERSONAL", "MATERNITY", "PATERNITY", "UNPAID"]),
  startDate: z.string(),
  endDate: z.string(),
  reason: z.string().min(1, "Reason is required"),
});

type LeaveRequestFormValues = z.infer<typeof leaveRequestSchema>;

interface LeaveRequestFormProps {
  employees: Employee[];
}

export function LeaveRequestForm({ employees }: LeaveRequestFormProps) {
  const router = useRouter();

  const form = useForm<LeaveRequestFormValues>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: {
      employeeId: "",
      leaveType: "ANNUAL",
      startDate: format(new Date(), "yyyy-MM-dd"),
      endDate: format(new Date(), "yyyy-MM-dd"),
      reason: "",
    },
  });

  const startDate = form.watch("startDate");
  const endDate = form.watch("endDate");

  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end < start) {
        form.setValue("endDate", startDate);
      }
    }
  }, [startDate, endDate, form]);

  const onSubmit = async (data: LeaveRequestFormValues) => {
    try {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      const days = differenceInDays(end, start) + 1;

      const response = await fetch("/api/hr/leave-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          days,
          status: "PENDING",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create leave request");
      }

      toast.success("Leave request submitted successfully");
      router.push("/hr/leave-requests");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    }
  };

  const days = startDate && endDate
    ? differenceInDays(new Date(endDate), new Date(startDate)) + 1
    : 0;

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormGrid cols={2}>
              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {employees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.firstName} {emp.lastName} ({emp.employeeId})
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
                name="leaveType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Leave Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ANNUAL">Annual Leave</SelectItem>
                        <SelectItem value="SICK">Sick Leave</SelectItem>
                        <SelectItem value="PERSONAL">Personal Leave</SelectItem>
                        <SelectItem value="MATERNITY">Maternity Leave</SelectItem>
                        <SelectItem value="PATERNITY">Paternity Leave</SelectItem>
                        <SelectItem value="UNPAID">Unpaid Leave</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" min={startDate} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {days > 0 && (
                <div className="col-span-2 p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">
                    Duration: <span className="text-primary">{days} day{days !== 1 ? "s" : ""}</span>
                  </p>
                </div>
              )}

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Reason</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={4} placeholder="Provide reason for leave..." />
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
                {form.formState.isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
