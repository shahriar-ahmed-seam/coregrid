"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Contact, Customer } from "@prisma/client";
import { useState } from "react";

const contactSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  jobTitle: z.string().optional(),
  isPrimary: z.boolean(),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactFormProps {
  contact?: Contact;
  customers: Customer[];
}

export function ContactForm({ contact, customers }: ContactFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: contact
      ? {
          customerId: contact.customerId,
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: contact.email || "",
          phone: contact.phone || "",
          jobTitle: contact.jobTitle || "",
          isPrimary: contact.isPrimary,
        }
      : {
          isPrimary: false,
        },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const url = contact
        ? `/api/crm/contacts/${contact.id}`
        : "/api/crm/contacts";
      const method = contact ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push("/crm/contacts");
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to save contact:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const customerId = watch("customerId");
  const isPrimary = watch("isPrimary");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label htmlFor="customerId">Company *</Label>
            <Select
              value={customerId}
              onValueChange={(value) => setValue("customerId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select company" />
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
            <Label htmlFor="firstName">First Name *</Label>
            <Input id="firstName" {...register("firstName")} />
            {errors.firstName && (
              <p className="text-sm text-destructive mt-1">
                {errors.firstName.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="lastName">Last Name *</Label>
            <Input id="lastName" {...register("lastName")} />
            {errors.lastName && (
              <p className="text-sm text-destructive mt-1">
                {errors.lastName.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register("phone")} />
          </div>

          <div className="col-span-2">
            <Label htmlFor="jobTitle">Job Title</Label>
            <Input id="jobTitle" {...register("jobTitle")} />
          </div>

          <div className="col-span-2 flex items-center space-x-2">
            <Checkbox
              id="isPrimary"
              checked={isPrimary}
              onCheckedChange={(checked) => setValue("isPrimary", checked as boolean)}
            />
            <Label htmlFor="isPrimary" className="cursor-pointer">
              Set as primary contact
            </Label>
          </div>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : contact ? "Update Contact" : "Create Contact"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
