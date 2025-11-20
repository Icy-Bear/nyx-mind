"use client";

import { ActionDialog } from "@/components/action-dialog";
import { ProjectCards } from "@/components/dashboard/project-cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban, Plus } from "lucide-react";

export default function DashboardPage() {
  const projects = [
    { name: "nivaas" },
    { name: "mithaya-darpan" },
    { name: "chat-app" },
  ];

  return (
    <div className="min-h-screen bg-background p-3 sm:p-6 lg:p-8">
      {/* ---------------- Header ---------------- */}
      <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8">
        {/* TOP ROW: Title + Action Button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Projects</h1>
            <p className="text-muted-foreground text-sm sm:text-base mt-1">
              View, manage, and track all your projects in one place.
            </p>
          </div>

          {/* Right side actions: Add Project and Apply Leave in header */}
          <div className="flex items-center gap-2">
            <ActionDialog
              title="Create New Project"
              description="Add a new project to your dashboard."
              label="Add Project"
              icon={<Plus className="h-4 w-4" />}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {/* Form or content inside dialog */}
              <form className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Project name"
                  className="border rounded-md p-2"
                />
                <button
                  className="bg-primary text-white px-3 py-2 rounded-md"
                  type="submit"
                >
                  Create
                </button>
              </form>
            </ActionDialog>
          </div>
        </div>

        {/* Stats Info Bar */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <FolderKanban className="h-4 w-4 flex-shrink-0" />
          <span>
            You have {projects.length} active project
            {projects.length !== 1 ? "s" : ""}.
          </span>
        </div>
      </div>

      {/* ---------------- Project Statistics ---------------- */}
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

        <Card>
          <CardHeader>
            <CardTitle>Last Updated</CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-semibold">Today</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Tasks</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">7</CardContent>
        </Card>
      </div>

      {/* ---------------- Projects Cards ---------------- */}
      <div>
        <ProjectCards projects={projects} />
      </div>
    </div>
  );
}
