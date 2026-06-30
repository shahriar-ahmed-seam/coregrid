import { PageHeader } from "@/components/layout/page-header";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EmployeeForm } from "../../employee-form";

interface EditEmployeePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditEmployeePage({ params }: EditEmployeePageProps) {
  const { id } = await params;
  const [employeeRaw, departmentsRaw] = await Promise.all([
    prisma.employee.findUnique({
      where: { id },
      include: {
        department: true,
      },
    }),
    prisma.department.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

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

  const departments = departmentsRaw.map(dept => ({
    ...dept,
    budget: dept.budget.toNumber(),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Employee"
        description="Update employee information"
        backHref={`/hr/employees/${employee.id}`}
      />

      <EmployeeForm employee={employee} departments={departments} />
    </div>
  );
}
