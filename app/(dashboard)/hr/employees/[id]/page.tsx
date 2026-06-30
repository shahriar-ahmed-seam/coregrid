import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Mail, Phone, MapPin, Calendar, DollarSign, Building2, User } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { format } from "date-fns";

interface EmployeeDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EmployeeDetailPage({ params }: EmployeeDetailPageProps) {
  const { id } = await params;
  const employeeRaw = await prisma.employee.findUnique({
    where: { id },
    include: {
      department: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      leaveRequests: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      attendance: {
        orderBy: { date: "desc" },
        take: 10,
      },
    },
  });

  if (!employeeRaw) {
    notFound();
  }

  const employee = {
    ...employeeRaw,
    salary: employeeRaw.salary.toNumber(),
    department: employeeRaw.department ? {
      ...employeeRaw.department,
      budget: employeeRaw.department.budget.toNumber(),
    } : null,
  };

  const statusColors = {
    ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    INACTIVE: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    ON_LEAVE: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    TERMINATED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${employee.firstName} ${employee.lastName}`}
        description={employee.position}
        backHref="/hr/employees"
        action={
          <Button asChild>
            <Link href={`/hr/employees/${employee.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Employee
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Employee ID</p>
                <p className="text-sm text-muted-foreground">{employee.employeeId}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{employee.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">{employee.phone || "N/A"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Date of Birth</p>
                <p className="text-sm text-muted-foreground">
                  {employee.dateOfBirth ? format(new Date(employee.dateOfBirth), "PPP") : "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Address</p>
                <p className="text-sm text-muted-foreground">
                  {employee.address && (
                    <>
                      {employee.address}<br />
                      {employee.city}, {employee.state} {employee.zipCode}<br />
                      {employee.country}
                    </>
                  )}
                  {!employee.address && "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employment Information */}
        <Card>
          <CardHeader>
            <CardTitle>Employment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Department</p>
                <p className="text-sm text-muted-foreground">
                  {employee.department?.name || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Position</p>
                <p className="text-sm text-muted-foreground">{employee.position}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Hire Date</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(employee.hireDate), "PPP")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Salary</p>
                <p className="text-sm text-muted-foreground">
                  ${Number(employee.salary).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Employment Type</p>
                <p className="text-sm text-muted-foreground">
                  {employee.employmentType.replace("_", " ")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Status</p>
                <Badge variant="secondary" className={statusColors[employee.status]}>
                  {employee.status.replace("_", " ")}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Leave Requests */}
      {employee.leaveRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Leave Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {employee.leaveRequests.map((leave) => (
                <div key={leave.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{leave.leaveType.replace("_", " ")}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(leave.startDate), "PPP")} - {format(new Date(leave.endDate), "PPP")}
                    </p>
                  </div>
                  <Badge>{leave.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
