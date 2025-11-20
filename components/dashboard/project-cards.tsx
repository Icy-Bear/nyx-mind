"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

interface ProjectCardsProps {
  projects: { name: string }[];
}

export function ProjectCards({ projects }: ProjectCardsProps) {
  const router = useRouter();

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {/* Create Project */}
      <Card
        className="cursor-pointer border-dashed hover:bg-accent/50 transition"
        onClick={() => router.push("/dashboard/create")}
      >
        <CardContent className="flex flex-col items-center justify-center h-40">
          <Plus className="w-10 h-10 text-muted-foreground" />
          <span className="mt-3 text-sm font-medium">Create Project</span>
        </CardContent>
      </Card>

      {/* List all projects */}
      {projects.map((p) => (
        <Card
          key={p.name}
          className="cursor-pointer hover:bg-accent transition"
          onClick={() => router.push(`/dashboard/${p.name}`)}
        >
          <CardHeader>
            <CardTitle className="capitalize">{p.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Click to manage this project.
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
