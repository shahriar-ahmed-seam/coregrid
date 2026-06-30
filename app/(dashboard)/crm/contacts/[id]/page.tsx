import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Mail, Phone, Building2, Briefcase, ExternalLink, ArrowLeft } from "lucide-react";

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const contact = await prisma.contact.findUnique({
    where: { id },
    include: {
      customer: true,
      deals: {
        include: {
          customer: true,
        },
      },
    },
  });

  if (!contact) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <Link
            href="/crm/contacts"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Contacts
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">
              {contact.firstName} {contact.lastName}
            </h1>
            {contact.isPrimary && <Badge>Primary Contact</Badge>}
          </div>
          {contact.jobTitle && (
            <p className="text-muted-foreground">{contact.jobTitle}</p>
          )}
        </div>
        <div className="flex gap-3">
          <Link href={`/crm/contacts/${contact.id}/edit`}>
            <Button>Edit Contact</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
          <div className="space-y-3">
            {contact.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <a
                  href={`mailto:${contact.email}`}
                  className="text-blue-600 hover:underline"
                >
                  {contact.email}
                </a>
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <a
                  href={`tel:${contact.phone}`}
                  className="text-blue-600 hover:underline"
                >
                  {contact.phone}
                </a>
              </div>
            )}
            {contact.jobTitle && (
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-muted-foreground" />
                <span>{contact.jobTitle}</span>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Company</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-muted-foreground" />
              <Link
                href={`/crm/customers/${contact.customer.id}`}
                className="text-blue-600 hover:underline flex items-center gap-1"
              >
                {contact.customer.companyName}
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
            {contact.customer.industry && (
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">Industry:</span>
                <span>{contact.customer.industry}</span>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Related Deals</h2>
        {contact.deals.length === 0 ? (
          <p className="text-muted-foreground">No deals associated with this contact</p>
        ) : (
          <div className="space-y-3">
            {contact.deals.map((deal) => (
              <Link
                key={deal.id}
                href={`/crm/deals/${deal.id}`}
                className="flex justify-between items-center p-4 border rounded-lg hover:bg-accent transition-colors"
              >
                <div>
                  <p className="font-medium">{deal.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {deal.customer.companyName}
                  </p>
                </div>
                <div className="text-right">
                  <Badge>{deal.stage}</Badge>
                  <p className="text-sm font-medium mt-1">
                    ${deal.value.toNumber().toLocaleString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
