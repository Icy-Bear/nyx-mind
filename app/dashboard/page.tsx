"use client";

import { ActionDialog } from "@/components/action-dialog";
import { ProjectCards } from "@/components/dashboard/project-cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban, Plus } from "lucide-react";
import { getProjects } from "@/actions/projects";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import CreateProjectForm from "./create/page";
import { useSession } from "@/lib/auth-client";
import { Spinner } from "@/components/ui/spinner";
import { Project } from "@/lib/types";

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const { data, isPending } = useSession();

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const fetchedProjects = await getProjects();
        setProjects(fetchedProjects);
      } catch (error) {
        toast.error("Failed to load projects");
      }
    };

    loadProjects();
  }, []);

  if (isPending) {
    return (
      <div className="flex h-screen justify-center items-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-3 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Projects</h1>
            <p className="text-muted-foreground text-sm sm:text-base mt-1">
              View, manage, and track all your projects in one place.
            </p>
          </div>

          {data?.user.role === "admin" && (
            <ActionDialog
              title="Create New Project"
              description="Add a new project to your dashboard."
              label="Add Project"
              icon={<Plus className="h-4 w-4" />}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <CreateProjectForm />
            </ActionDialog>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <FolderKanban className="h-4 w-4 flex-shrink-0" />
          <span>
            You have {projects.length} active project
            {projects.length !== 1 ? "s" : ""}.
          </span>
        </div>
      </div>

      {data?.user.role === "admin" ? (
        <ProjectStatics projects={projects} />
      ) : (
        <></>
      )}

       <div>
         <ProjectCards projects={projects} />
       </div>
    </div>
  );
}

function ProjectStatics({ projects }: { projects: Project[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
      <Card>
        <CardHeader>
          <CardTitle>Total Projects</CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-bold">
          {projects.length}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active</CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-bold">2</CardContent>
      </Card>
    </div>
  );
}
