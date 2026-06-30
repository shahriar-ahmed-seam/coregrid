import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { DepartmentsTable } from "./departments-table";
import prisma from "@/lib/prisma";

export default async function DepartmentsPage() {
  const departmentsRaw = await prisma.department.findMany({
    include: {
      manager: true,
      _count: {
        select: {
          employees: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const departments = departmentsRaw.map(dept => ({
    ...dept,
    budget: dept.budget.toNumber(),
    manager: dept.manager ? {
      ...dept.manager,
      salary: dept.manager.salary.toNumber(),
    } : null,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments"
        description="Manage organizational departments"
        backHref="/hr"
        action={
          <Button asChild>
            <Link href="/hr/departments/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Department
            </Link>
          </Button>
        }
      />

      <DepartmentsTable departments={departments} />
    </div>
  );
}
