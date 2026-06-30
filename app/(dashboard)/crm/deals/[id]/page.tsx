import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ActivityForm } from "./activity-form";
import {
  Building2,
  User,
  DollarSign,
  Calendar,
  Target,
  TrendingUp,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const deal = await prisma.deal.findUnique({
    where: { id },
    include: {
      customer: true,
      contact: true,
      salesRep: true,
      activities: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!deal) {
    notFound();
  }

  const dealValue = deal.value.toNumber();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <Link
            href="/crm/deals"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Deals
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{deal.title}</h1>
            <Badge>{deal.stage.replace("_", " ")}</Badge>
            <Badge variant={deal.priority === "HIGH" ? "destructive" : "secondary"}>
              {deal.priority}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Created on {new Date(deal.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href={`/crm/deals/${deal.id}/edit`}>
            <Button>Edit Deal</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Deal Information</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Deal Value</p>
                <p className="text-2xl font-bold">${dealValue.toLocaleString()}</p>
              </div>
            </div>

            {deal.probability !== null && (
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Probability</p>
                  <p className="font-medium">{deal.probability}%</p>
                </div>
              </div>
            )}

            {deal.expectedCloseDate && (
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Expected Close Date</p>
                  <p className="font-medium">
                    {new Date(deal.expectedCloseDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            {deal.actualCloseDate && (
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Actual Close Date</p>
                  <p className="font-medium">
                    {new Date(deal.actualCloseDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Sales Rep</p>
                <p className="font-medium">
                  {deal.salesRep.firstName
                    ? `${deal.salesRep.firstName} ${deal.salesRep.lastName}`
                    : deal.salesRep.email}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Related Information</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Customer</p>
                <Link
                  href={`/crm/customers/${deal.customer.id}`}
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  {deal.customer.companyName}
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {deal.contact && (
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Contact</p>
                  <Link
                    href={`/crm/contacts/${deal.contact.id}`}
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {deal.contact.firstName} {deal.contact.lastName}
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {deal.description && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Description</h2>
          <p className="text-muted-foreground whitespace-pre-wrap">{deal.description}</p>
        </Card>
      )}

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Add Activity</h2>
        <ActivityForm dealId={deal.id} />
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Activities</h2>
        {deal.activities.length === 0 ? (
          <p className="text-muted-foreground">No activities recorded for this deal</p>
        ) : (
          <div className="space-y-3">
            {deal.activities.map((activity: any) => (
              <div key={activity.id} className="border-l-2 border-primary pl-4 py-2">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge className="mb-1">{activity.type}</Badge>
                    <p className="font-medium">{activity.subject}</p>
                    {activity.description && (
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(activity.date).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
