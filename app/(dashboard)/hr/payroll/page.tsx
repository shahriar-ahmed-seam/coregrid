import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import prisma from "@/lib/prisma";
import { format } from "date-fns";

export default async function PayrollPage() {
  const employeesRaw = await prisma.employee.findMany({
    where: { status: "ACTIVE" },
    include: {
      department: true,
    },
    orderBy: { lastName: "asc" },
  });

  const employees = employeesRaw.map(emp => ({
    ...emp,
    salary: emp.salary.toNumber(),
    department: emp.department ? {
      ...emp.department,
      budget: emp.department.budget.toNumber(),
    } : null,
  }));

  const totalSalaries = employees.reduce((sum, emp) => sum + Number(emp.salary), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll"
        description="Manage employee salaries and compensation"
        backHref="/hr"
      />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
            <p className="text-xs text-muted-foreground">Active employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Monthly Payroll</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalSalaries / 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            <p className="text-xs text-muted-foreground">Per month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual Payroll</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSalaries.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Per year</p>
          </CardContent>
        </Card>
      </div>

      {/* Employee Salaries */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Salaries</CardTitle>
          <CardDescription>Salary breakdown by employee</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {employees.map((employee) => (
              <div
                key={employee.id}
                className="flex items-center justify-between border-b pb-3 last:border-0"
              >
                <div className="flex-1">
                  <div className="font-medium">
                    {employee.firstName} {employee.lastName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {employee.position} • {employee.department?.name || "No Department"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    ${Number(employee.salary).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ${(Number(employee.salary) / 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}/month
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
