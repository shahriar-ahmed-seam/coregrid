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
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Expense, Employee, ExpenseCategory } from "@prisma/client";
import { useState } from "react";

const expenseSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  category: z.enum(["TRAVEL", "MEALS", "SUPPLIES", "EQUIPMENT", "SOFTWARE", "OTHER"]),
  description: z.string().min(1, "Description is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  expenseDate: z.string().min(1, "Expense date is required"),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
  receiptUrl: z.string().optional(),
  notes: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  expense?: Omit<Expense, "amount"> & { amount: number };
  employees: Employee[];
}


export function ExpenseForm({ expense, employees }: ExpenseFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: expense
      ? {
        employeeId: expense.employeeId,
        category: // map unknown/extra values to "OTHER"
          ["TRAVEL", "MEALS", "SUPPLIES", "EQUIPMENT", "SOFTWARE", "OTHER"].includes(expense.category)
            ? (expense.category as ExpenseFormData["category"])
            : "OTHER",
        description: expense.description,
        amount: expense.amount,
        expenseDate: new Date(expense.expenseDate).toISOString().split("T")[0],
        status: ["PENDING", "APPROVED", "REJECTED"].includes(expense.status)
          ? (expense.status as ExpenseFormData["status"])
          : "PENDING",
        receiptUrl: expense.receiptUrl || "",
        notes: expense.notes || "",
      }
      : {
        status: "PENDING",
        category: "OTHER",
      },
  });

  const employeeId = watch("employeeId");
  const category = watch("category");
  const status = watch("status");

  const onSubmit = async (data: ExpenseFormData) => {
    setIsSubmitting(true);
    try {
      const url = expense ? `/api/finance/expenses/${expense.id}` : "/api/finance/expenses";
      const method = expense ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push("/finance/expenses");
        router.refresh();
      } else {
        const errorData = await response.json();
        alert(`Failed to save expense: ${errorData.details || errorData.error}`);
      }
    } catch (error) {
      console.error("Failed to save expense:", error);
      alert("Failed to save expense. Check console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Expense Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="employeeId">Employee *</Label>
            <Select
              value={employeeId}
              onValueChange={(value) => setValue("employeeId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.firstName} {employee.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.employeeId && (
              <p className="text-sm text-destructive mt-1">
                {errors.employeeId.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={(value) => setValue("category", value as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TRAVEL">Travel</SelectItem>
                <SelectItem value="MEALS">Meals</SelectItem>
                <SelectItem value="SUPPLIES">Supplies</SelectItem>
                <SelectItem value="EQUIPMENT">Equipment</SelectItem>
                <SelectItem value="SOFTWARE">Software</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="amount">Amount ($) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              {...register("amount", { valueAsNumber: true })}
            />
            {errors.amount && (
              <p className="text-sm text-destructive mt-1">
                {errors.amount.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="expenseDate">Expense Date *</Label>
            <Input id="expenseDate" type="date" {...register("expenseDate")} />
            {errors.expenseDate && (
              <p className="text-sm text-destructive mt-1">
                {errors.expenseDate.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="status">Status *</Label>
            <Select value={status} onValueChange={(value) => setValue("status", value as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="receiptUrl">Receipt URL</Label>
            <Input id="receiptUrl" type="url" {...register("receiptUrl")} />
          </div>

          <div className="col-span-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea id="description" {...register("description")} rows={3} />
            {errors.description && (
              <p className="text-sm text-destructive mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...register("notes")} rows={3} />
          </div>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : expense ? "Update Expense" : "Submit Expense"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
