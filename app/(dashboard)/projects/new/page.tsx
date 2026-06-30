import prisma from "@/lib/prisma";
import { ProjectForm } from "../project-form";
import { PageHeader } from "@/components/layout/page-header";

export default async function NewProjectPage() {
  const departmentsRaw = await prisma.department.findMany({
    orderBy: { name: "asc" },
  });

  const departments = departmentsRaw.map(dept => ({
    ...dept,
    budget: dept.budget,
  }));

  const defaultProject = {
    id: "", // placeholder
    name: "",
    description: null,
    departmentId: null,
    status: "PLANNING" as const,
    startDate: null,
    endDate: null,
    budget: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Project"
        description="Create a new project"
        backHref="/projects"
      />

      <ProjectForm project={defaultProject} departments={departments} />
    </div>
  );
}
