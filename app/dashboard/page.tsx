"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProjectCards } from "@/components/dashboard/project-cards";
import { Button } from "@/components/ui/button";
import { FolderKanban, Plus } from "lucide-react";
import { getProjects } from "@/actions/projects";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CreateProjectForm } from "@/components/create-project-form";
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
        toast.error("Failed to load projects" + error);
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
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="h-4 w-4" />
                  <span>Add Project</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>Add a new project to your dashboard.</DialogDescription>
                <CreateProjectForm />
              </DialogContent>
            </Dialog>
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

      <div>
        <ProjectCards projects={projects} role={data?.user.role as string} />
      </div>
    </div>
  );
}
