import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { Users, Building2, TrendingUp, DollarSign, Target, Phone } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";

async function getCRMStats() {
  const [
    totalCustomers,
    totalContacts,
    activeDeals,
    wonDeals,
    deals,
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.contact.count(),
    prisma.deal.count({ where: { stage: { notIn: ["CLOSED_WON", "CLOSED_LOST"] } } }),
    prisma.deal.count({ where: { stage: "CLOSED_WON" } }),
    prisma.deal.findMany({
      where: { stage: { notIn: ["CLOSED_WON", "CLOSED_LOST"] } },
      select: { value: true },
    }),
  ]);

  const pipelineValue = deals.reduce((sum, deal) => sum + Number(deal.value), 0);

  return {
    totalCustomers,
    totalContacts,
    activeDeals,
    wonDeals,
    pipelineValue,
  };
}

export default async function CRMPage() {
  const stats = await getCRMStats();

  const quickActions = [
    {
      title: "Customers",
      description: "Manage customer accounts",
      icon: Building2,
      href: "/crm/customers",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/50",
    },
    {
      title: "Contacts",
      description: "Manage contacts",
      icon: Users,
      href: "/crm/contacts",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/50",
    },
    {
      title: "Deals",
      description: "Track sales pipeline",
      icon: Target,
      href: "/crm/deals",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/50",
    },
    {
      title: "Activities",
      description: "View communications",
      icon: Phone,
      href: "/crm/activities",
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950/50",
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="CRM & Sales"
        description="Manage customer relationships and sales pipeline"
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Active accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contacts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalContacts}</div>
            <p className="text-xs text-muted-foreground">Total contacts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeDeals}</div>
            <p className="text-xs text-muted-foreground">{stats.wonDeals} won this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.pipelineValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total opportunity value</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${action.bgColor} flex items-center justify-center mb-3`}>
                    <action.icon className={`h-6 w-6 ${action.color}`} />
                  </div>
                  <CardTitle className="text-base">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
