import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import Link from "next/link";
import {
  Phone,
  Mail,
  Calendar,
  Building2,
  User,
  MessageSquare,
  Video,
  FileText,
} from "lucide-react";

export default async function ActivitiesPage() {
  const activities = await prisma.dealActivity.findMany({
    include: {
      deal: {
        include: {
          customer: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const activityIcons = {
    CALL: Phone,
    EMAIL: Mail,
    MEETING: Video,
    NOTE: FileText,
    TASK: MessageSquare,
  } as const;

  const activityColors = {
    CALL: "default",
    EMAIL: "secondary",
    MEETING: "default",
    NOTE: "secondary",
    TASK: "default",
  } as const;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activities"
        description="Track all CRM activities and communications"
        backHref="/crm"
      />

      <div className="space-y-4">
        {activities.length === 0 ? (
          <Card className="p-12 text-center">
            <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Activities Yet</h3>
            <p className="text-muted-foreground mb-4">
              Activities need to be manually added from deal detail pages.
            </p>
            <p className="text-sm text-muted-foreground">
              To add an activity: Go to any deal → Scroll to "Add Activity" section → Fill the form → Click "Add Activity"
            </p>
          </Card>
        ) : (
          activities.map((activity) => {
            const Icon = activityIcons[activity.type as keyof typeof activityIcons] || MessageSquare;
            return (
              <Card key={activity.id} className="p-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={activityColors[activity.type as keyof typeof activityColors]}>
                            {activity.type}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(activity.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {activity.description && (
                          <p className="text-muted-foreground mb-2">{activity.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm">
                          <Link
                            href={`/crm/deals/${activity.deal.id}`}
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3" />
                            {activity.deal.title}
                          </Link>
                          <Link
                            href={`/crm/customers/${activity.deal.customer.id}`}
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Building2 className="w-3 h-3" />
                            {activity.deal.customer.companyName}
                          </Link>
                        </div>
                      </div>
                      {activity.date && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(activity.date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
