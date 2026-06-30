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
import { Deal, Customer, Contact, Employee } from "@prisma/client";
import { useState, useEffect } from "react";

const dealSchema = z.object({
  title: z.string().min(1, "Title is required"),
  customerId: z.string().min(1, "Customer is required"),
  contactId: z.string().optional(),
  salesRepId: z.string().min(1, "Sales rep is required"),
  stage: z.enum([
    "LEAD",
    "QUALIFIED",
    "PROPOSAL",
    "NEGOTIATION",
    "CLOSED_WON",
    "CLOSED_LOST",
  ]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  value: z.number().min(0, "Value must be positive"),
  probability: z.number().min(0).max(100).optional(),
  expectedCloseDate: z.string().optional(),
  description: z.string().optional(),
});

type DealFormData = z.infer<typeof dealSchema>;

interface DealFormProps {
  deal?: Omit<Deal, "value"> & { value: number };
  customers: Customer[];
  salesReps: Employee[];
}


export function DealForm({ deal, customers, salesReps }: DealFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DealFormData>({
    resolver: zodResolver(dealSchema),
    defaultValues: deal
      ? {
          title: deal.title,
          customerId: deal.customerId,
          contactId: deal.contactId || undefined,
          salesRepId: deal.salesRepId,
          stage: deal.stage,
          priority: deal.priority,
          value: deal.value,
          probability: deal.probability || undefined,
          expectedCloseDate: deal.expectedCloseDate
            ? new Date(deal.expectedCloseDate).toISOString().split("T")[0]
            : undefined,
          description: deal.description || "",
        }
      : {
          stage: "LEAD",
          priority: "MEDIUM",
          value: 0,
          probability: 50,
        },
  });

  const customerId = watch("customerId");
  const contactId = watch("contactId");
  const stage = watch("stage");
  const priority = watch("priority");
  const salesRepId = watch("salesRepId");

  // Fetch contacts when customer changes
  useEffect(() => {
    if (customerId) {
      fetch(`/api/crm/customers/${customerId}`)
        .then((res) => res.json())
        .then((data) => {
          setContacts(data.contacts || []);
          // Reset contact if current contact doesn't belong to new customer
          if (contactId && !data.contacts?.some((c: Contact) => c.id === contactId)) {
            setValue("contactId", undefined);
          }
        });
    } else {
      setContacts([]);
      setValue("contactId", undefined);
    }
  }, [customerId, contactId, setValue]);

  const onSubmit = async (data: DealFormData) => {
    setIsSubmitting(true);
    try {
      const url = deal ? `/api/crm/deals/${deal.id}` : "/api/crm/deals";
      const method = deal ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push("/crm/deals");
        router.refresh();
      } else {
        const errorData = await response.json();
        console.error("Failed to save deal:", errorData);
        alert(`Failed to save deal: ${errorData.details || errorData.error}`);
      }
    } catch (error) {
      console.error("Failed to save deal:", error);
      alert("Failed to save deal. Check console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Deal Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label htmlFor="title">Deal Title *</Label>
            <Input id="title" {...register("title")} />
            {errors.title && (
              <p className="text-sm text-destructive mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="customerId">Customer *</Label>
            <Select
              value={customerId}
              onValueChange={(value) => setValue("customerId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.companyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.customerId && (
              <p className="text-sm text-destructive mt-1">
                {errors.customerId.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="contactId">Contact</Label>
            <Select
              value={contactId}
              onValueChange={(value) => setValue("contactId", value)}
              disabled={!customerId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select contact" />
              </SelectTrigger>
              <SelectContent>
                {contacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {contact.firstName} {contact.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="salesRepId">Sales Rep *</Label>
            <Select
              value={salesRepId}
              onValueChange={(value) => setValue("salesRepId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select sales rep" />
              </SelectTrigger>
              <SelectContent>
                {salesReps.map((rep) => (
                  <SelectItem key={rep.id} value={rep.id}>
                    {rep.firstName} {rep.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.salesRepId && (
              <p className="text-sm text-destructive mt-1">
                {errors.salesRepId.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="value">Deal Value *</Label>
            <Input
              id="value"
              type="number"
              step="0.01"
              {...register("value", { valueAsNumber: true })}
            />
            {errors.value && (
              <p className="text-sm text-destructive mt-1">
                {errors.value.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="stage">Stage *</Label>
            <Select value={stage} onValueChange={(value) => setValue("stage", value as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LEAD">Lead</SelectItem>
                <SelectItem value="QUALIFIED">Qualified</SelectItem>
                <SelectItem value="PROPOSAL">Proposal</SelectItem>
                <SelectItem value="NEGOTIATION">Negotiation</SelectItem>
                <SelectItem value="CLOSED_WON">Closed Won</SelectItem>
                <SelectItem value="CLOSED_LOST">Closed Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="priority">Priority *</Label>
            <Select
              value={priority}
              onValueChange={(value) => setValue("priority", value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="probability">Probability (%)</Label>
            <Input
              id="probability"
              type="number"
              min="0"
              max="100"
              {...register("probability", { valueAsNumber: true })}
            />
            {errors.probability && (
              <p className="text-sm text-destructive mt-1">
                {errors.probability.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="expectedCloseDate">Expected Close Date</Label>
            <Input id="expectedCloseDate" type="date" {...register("expectedCloseDate")} />
          </div>

          <div className="col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} rows={4} />
          </div>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : deal ? "Update Deal" : "Create Deal"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
