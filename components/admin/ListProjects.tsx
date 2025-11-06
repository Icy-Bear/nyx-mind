"use client";

import { SelectProject } from "@/db/schema";
import { Dispatch, SetStateAction } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function ListProject({
  projects,
  currentProject,
  setCurrentProject,
}: {
  projects: SelectProject[];
  currentProject: SelectProject | undefined;
  setCurrentProject: Dispatch<SetStateAction<SelectProject | undefined>>;
}) {
  if (projects.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-10">
        No projects found. Create one to get started!
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex gap-4 overflow-x-auto pb-4">
        {projects.map((project) => (
          <Card
            key={project.id}
            className={cn(
              "min-w-[250px] cursor-pointer transition-all hover:shadow-lg",
              currentProject?.id === project.id &&
                "border-primary ring-2 ring-primary"
            )}
            onClick={() => setCurrentProject(project)}
          >
            <CardHeader>
              <CardTitle className="text-xl">{project.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 line-clamp-2">
                {project.idea}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
