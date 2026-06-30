import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { EmployeesTable } from "./employees-table";
import prisma from "@/lib/prisma";

export default async function EmployeesPage() {
  const employeesRaw = await prisma.employee.findMany({
    include: {
      department: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const employees = employeesRaw.map(emp => ({
    ...emp,
    salary: emp.salary.toNumber(),
    department: emp.department ? {
      ...emp.department,
      budget: emp.department.budget.toNumber(),
    } : null,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        description="Manage employee records and information"
        backHref="/hr"
        action={
          <Button asChild>
            <Link href="/hr/employees/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Link>
          </Button>
        }
      />

      <EmployeesTable employees={employees} />
    </div>
  );
}
