"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProjectCardsProps {
  projects: { id: string; name: string }[];
}

export function ProjectCards({ projects }: ProjectCardsProps) {
  const router = useRouter();

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {/* List all projects */}
      {projects.map((p) => (
        <Card
          key={p.id}
          className="cursor-pointer hover:bg-accent transition"
          onClick={() => router.push(`/dashboard/${p.id}`)}
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
