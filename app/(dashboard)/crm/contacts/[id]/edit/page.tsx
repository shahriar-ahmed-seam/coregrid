import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ContactForm } from "../../contact-form";
import { PageHeader } from "@/components/layout/page-header";

export default async function EditContactPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [contact, customers] = await Promise.all([
    prisma.contact.findUnique({
      where: { id },
    }),
    prisma.customer.findMany({
      orderBy: { companyName: "asc" },
    }),
  ]);

  if (!contact) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Contact"
        description={`Update contact information for ${contact.firstName} ${contact.lastName}`}
        backHref={`/crm/contacts/${contact.id}`}
      />

      <ContactForm contact={contact} customers={customers} />
    </div>
  );
}
