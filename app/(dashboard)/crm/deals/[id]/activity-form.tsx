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

const activitySchema = z.object({
  type: z.enum(["CALL", "EMAIL", "MEETING", "NOTE", "TASK"]),
  subject: z.string().min(1, "Subject is required"),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
});

type ActivityFormData = z.infer<typeof activitySchema>;

interface ActivityFormProps {
  dealId: string;
}

export function ActivityForm({ dealId }: ActivityFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      type: "NOTE",
      date: new Date().toISOString().slice(0, 16),
    },
  });

  const type = watch("type");

  const onSubmit = async (data: ActivityFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/crm/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          dealId,
        }),
      });

      if (response.ok) {
        reset({
          type: "NOTE",
          date: new Date().toISOString().slice(0, 16),
          subject: "",
          description: "",
        });
        router.refresh();
      } else {
        const errorData = await response.json();
        alert(`Failed to create activity: ${errorData.details || errorData.error}`);
      }
    } catch (error) {
      console.error("Failed to create activity:", error);
      alert("Failed to create activity. Check console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="type">Type *</Label>
          <Select value={type} onValueChange={(value) => setValue("type", value as any)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CALL">Call</SelectItem>
              <SelectItem value="EMAIL">Email</SelectItem>
              <SelectItem value="MEETING">Meeting</SelectItem>
              <SelectItem value="NOTE">Note</SelectItem>
              <SelectItem value="TASK">Task</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="subject">Subject *</Label>
          <Input id="subject" {...register("subject")} />
          {errors.subject && (
            <p className="text-sm text-destructive mt-1">
              {errors.subject.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="date">Date & Time *</Label>
          <Input id="date" type="datetime-local" {...register("date")} />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register("description")} rows={2} />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Adding..." : "Add Activity"}
      </Button>
    </form>
  );
}
