import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Mail, Phone, MapPin, Globe, Building2 } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

interface CustomerDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      contacts: {
        orderBy: { createdAt: "desc" },
      },
      deals: {
        include: {
          salesRep: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: {
          invoices: true,
        },
      },
    },
  });

  if (!customer) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={customer.companyName}
        description={customer.industry || "Customer"}
        backHref="/crm/customers"
        action={
          <Button asChild>
            <Link href={`/crm/customers/${customer.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Customer
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {customer.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{customer.email}</p>
                </div>
              </div>
            )}

            {customer.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">{customer.phone}</p>
                </div>
              </div>
            )}

            {customer.website && (
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Website</p>
                  <a
                    href={customer.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {customer.website}
                  </a>
                </div>
              </div>
            )}

            {(customer.address || customer.city || customer.state || customer.country) && (
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Address</p>
                  <div className="text-sm text-muted-foreground">
                    {customer.address && <p>{customer.address}</p>}
                    <p>
                      {[customer.city, customer.state, customer.zipCode]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    {customer.country && <p>{customer.country}</p>}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Contacts</span>
              <Badge variant="secondary">{customer.contacts.length}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Deals</span>
              <Badge variant="secondary">{customer.deals.length}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Invoices</span>
              <Badge variant="secondary">{customer._count.invoices}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {customer.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {customer.notes}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contacts ({customer.contacts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {customer.contacts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No contacts yet</p>
          ) : (
            <div className="space-y-4">
              {customer.contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-start justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {contact.firstName} {contact.lastName}
                      {contact.isPrimary && (
                        <Badge variant="secondary" className="ml-2">
                          Primary
                        </Badge>
                      )}
                    </p>
                    {contact.jobTitle && (
                      <p className="text-sm text-muted-foreground">{contact.jobTitle}</p>
                    )}
                    <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                      {contact.email && <span>{contact.email}</span>}
                      {contact.phone && <span>{contact.phone}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Deals ({customer.deals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {customer.deals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No deals yet</p>
          ) : (
            <div className="space-y-4">
              {customer.deals.map((deal) => (
                <div
                  key={deal.id}
                  className="flex items-start justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{deal.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Sales Rep: {deal.salesRep.firstName} {deal.salesRep.lastName}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge>{deal.stage.replace("_", " ")}</Badge>
                      <Badge variant="secondary">${Number(deal.value).toLocaleString()}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
