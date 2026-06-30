import { PageHeader } from "@/components/layout/page-header";
import prisma from "@/lib/prisma";
import { DepartmentForm } from "../department-form";

export default async function NewDepartmentPage() {
  const employeesRaw = await prisma.employee.findMany({
    where: { status: "ACTIVE" },
    orderBy: { firstName: "asc" },
  });

  const employees = employeesRaw.map(emp => ({
    ...emp,
    salary: emp.salary.toNumber(),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Department"
        description="Create a new department"
        backHref="/hr/departments"
      />

      <DepartmentForm employees={employees} />
    </div>
  );
}
