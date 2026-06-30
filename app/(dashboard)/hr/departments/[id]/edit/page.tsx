import { PageHeader } from "@/components/layout/page-header";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { DepartmentForm } from "../../department-form";

interface EditDepartmentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditDepartmentPage({ params }: EditDepartmentPageProps) {
  const { id } = await params;
  const [departmentRaw, employeesRaw] = await Promise.all([
    prisma.department.findUnique({
      where: { id },
    }),
    prisma.employee.findMany({
      where: { status: "ACTIVE" },
      orderBy: { firstName: "asc" },
    }),
  ]);

  if (!departmentRaw) {
    notFound();
  }

  const department = {
    ...departmentRaw,
    budget: departmentRaw.budget.toNumber(),
  };

  const employees = employeesRaw.map(emp => ({
    ...emp,
    salary: emp.salary.toNumber(),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Department"
        description="Update department information"
        backHref={`/hr/departments/${department.id}`}
      />

      <DepartmentForm department={department} employees={employees} />
    </div>
  );
}
