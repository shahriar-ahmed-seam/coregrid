import prisma from "@/lib/prisma";
import { Contact, Customer } from "@prisma/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ContactsTable } from "./contacts-table";
import { PageHeader } from "@/components/layout/page-header";
import { Plus } from "lucide-react";

type ContactWithCustomer = Contact & {
  customer: Customer;
};

export default async function ContactsPage() {
  const contacts = await prisma.contact.findMany({
    include: {
      customer: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contacts"
        description="Manage your customer contacts"
        backHref="/crm"
      >
        <Link href="/crm/contacts/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Contact
          </Button>
        </Link>
      </PageHeader>

      <ContactsTable contacts={contacts} />
    </div>
  );
}
