import prisma from "@/lib/prisma";
import { ProjectForm } from "../../project-form";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";

interface EditProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { id } = await params;
  
  const [project, departmentsRaw] = await Promise.all([
    prisma.project.findUnique({
      where: { id },
    }),
    prisma.department.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  if (!project) {
    notFound();
  }

  const departments = departmentsRaw.map(dept => ({
    ...dept,
    budget: dept.budget,
  }));

  const projectWithNumber = {
    ...project,
    budget: project.budget?.toNumber() ?? 0,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Project"
        description="Update project information"
        backHref={`/projects/${id}`}
      />

      <ProjectForm project={projectWithNumber} departments={departments} />
    </div>
  );
}
