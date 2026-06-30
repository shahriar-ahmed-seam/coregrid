import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, User, DollarSign, Users } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

interface DepartmentDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DepartmentDetailPage({ params }: DepartmentDetailPageProps) {
  const { id } = await params;
  const departmentRaw = await prisma.department.findUnique({
    where: { id },
    include: {
      manager: true,
      employees: {
        where: { status: "ACTIVE" },
        orderBy: { firstName: "asc" },
      },
    },
  });

  if (!departmentRaw) {
    notFound();
  }

  const department = {
    ...departmentRaw,
    budget: departmentRaw.budget.toNumber(),
    manager: departmentRaw.manager ? {
      ...departmentRaw.manager,
      salary: departmentRaw.manager.salary.toNumber(),
    } : null,
    employees: departmentRaw.employees.map(emp => ({
      ...emp,
      salary: emp.salary.toNumber(),
    })),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={department.name}
        description={department.code}
        backHref="/hr/departments"
        action={
          <Button asChild>
            <Link href={`/hr/departments/${department.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Department
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Department Information */}
        <Card>
          <CardHeader>
            <CardTitle>Department Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Manager</p>
                <p className="text-sm text-muted-foreground">
                  {department.manager
                    ? `${department.manager.firstName} ${department.manager.lastName}`
                    : "No manager assigned"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Annual Budget</p>
                <p className="text-sm text-muted-foreground">
                  {department.budget ? `$${Number(department.budget).toLocaleString()}` : "Not set"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Active Employees</p>
                <p className="text-sm text-muted-foreground">{department.employees.length}</p>
              </div>
            </div>
            {department.description && (
              <div>
                <p className="text-sm font-medium mb-1">Description</p>
                <p className="text-sm text-muted-foreground">{department.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Employees */}
        <Card>
          <CardHeader>
            <CardTitle>Employees ({department.employees.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {department.employees.length === 0 ? (
                <p className="text-sm text-muted-foreground">No employees in this department</p>
              ) : (
                department.employees.map((employee) => (
                  <Link
                    key={employee.id}
                    href={`/hr/employees/${employee.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {employee.firstName} {employee.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">{employee.position}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">{employee.employeeId}</div>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
