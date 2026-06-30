"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { ProjectsTable } from "./projects-table";
import { PageHeader } from "@/components/layout/page-header";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      const data = await response.json();
      
      const projectsWithStats = data.map((project: any) => {
        const totalTasks = project.tasks.length;
        const completedTasks = project.tasks.filter((t: any) => t.status === "DONE").length;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return {
          ...project,
          budget: project.budget || 0,
          totalTasks,
          completedTasks,
          progress,
        };
      });

      setProjects(projectsWithStats);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    // Refresh every 30 seconds to keep progress bars up to date
    const interval = setInterval(fetchProjects, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Projects"
          description="Manage projects, tasks, and timelines"
          backHref="/projects"
        />
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Manage projects, tasks, and timelines"
        backHref="/projects"
      >
        <Link href="/projects/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </Link>
      </PageHeader>

      <ProjectsTable projects={projects} />
    </div>
  );
}
