import { PageHeader } from "@/components/layout/page-header";
import { getCurrentUser } from "@/lib/auth/session";
import { AnalyticsDashboard } from "@/components/dashboard/analytics-dashboard";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return (
    <div className="space-y-6">
      <PageHeader
        heading={`Welcome back, ${user.name || "User"}!`}
        description="Here's a comprehensive overview of your organization's performance."
      />

      <Suspense fallback={<DashboardSkeleton />}>
        <AnalyticsDashboard />
      </Suspense>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-80" />
        ))}
      </div>
    </div>
  );
}
