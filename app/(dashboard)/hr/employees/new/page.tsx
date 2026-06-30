import { PageHeader } from "@/components/layout/page-header";
import prisma from "@/lib/prisma";
import { EmployeeForm } from "../employee-form";

export default async function NewEmployeePage() {
  const departmentsRaw = await prisma.department.findMany({
    orderBy: { name: "asc" },
  });

  const departments = departmentsRaw.map(dept => ({
    ...dept,
    budget: dept.budget.toNumber(),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Employee"
        description="Add a new employee to the system"
        backHref="/hr/employees"
      />

      <EmployeeForm departments={departments} />
    </div>
  );
}
