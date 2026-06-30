import prisma from "@/lib/prisma";
import { ContactForm } from "../contact-form";
import { PageHeader } from "@/components/layout/page-header";

export default async function NewContactPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { companyName: "asc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Contact"
        description="Add a new contact to your CRM"
        backHref="/crm/contacts"
      />

      <ContactForm customers={customers} />
    </div>
  );
}
