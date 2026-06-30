import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { requireAuth } from "@/lib/auth/session";

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();

  return <DashboardLayout>{children}</DashboardLayout>;
}
