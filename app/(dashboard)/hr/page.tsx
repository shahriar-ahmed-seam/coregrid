import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { Users, Building2, Calendar, Clock, DollarSign, UserCheck, TrendingUp, AlertCircle } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";

async function getHRStats() {
  const [
    totalEmployees,
    activeEmployees,
    departments,
    pendingLeaves,
    todayAttendance,
  ] = await Promise.all([
    prisma.employee.count(),
    prisma.employee.count({ where: { status: "ACTIVE" } }),
    prisma.department.count(),
    prisma.leaveRequest.count({ where: { status: "PENDING" } }),
    prisma.attendance.count({
      where: {
        date: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    }),
  ]);

  return {
    totalEmployees,
    activeEmployees,
    departments,
    pendingLeaves,
    todayAttendance,
    attendanceRate: totalEmployees > 0 ? ((todayAttendance / totalEmployees) * 100).toFixed(1) : "0",
  };
}

export default async function HRPage() {
  const stats = await getHRStats();

  const quickActions = [
    {
      title: "Employees",
      description: "Manage employee records",
      icon: Users,
      href: "/hr/employees",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/50",
    },
    {
      title: "Departments",
      description: "Manage departments",
      icon: Building2,
      href: "/hr/departments",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/50",
    },
    {
      title: "Leave Requests",
      description: "Review leave applications",
      icon: Calendar,
      href: "/hr/leave-requests",
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950/50",
    },
    {
      title: "Attendance",
      description: "Track attendance",
      icon: Clock,
      href: "/hr/attendance",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/50",
    },
    {
      title: "Payroll",
      description: "Manage payroll",
      icon: DollarSign,
      href: "/hr/payroll",
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/50",
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Human Resources"
        description="Manage employees, departments, attendance, and payroll"
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeEmployees} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.departments}</div>
            <p className="text-xs text-muted-foreground">Active departments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Leaves</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingLeaves}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Today</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.attendanceRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.todayAttendance} of {stats.totalEmployees} present
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${action.bgColor} flex items-center justify-center mb-2`}>
                      <Icon className={`h-6 w-6 ${action.color}`} />
                    </div>
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
