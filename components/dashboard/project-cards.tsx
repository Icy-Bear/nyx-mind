"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderOpen } from "lucide-react";

interface ProjectCardsProps {
  projects: { id: string; name: string; summary?: string | null }[];
}

export function ProjectCards({ projects }: ProjectCardsProps) {
  const router = useRouter();

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {/* List all projects */}
      {projects.map((p) => (
        <Card
          key={p.id}
          className="cursor-pointer hover:shadow-md transition-all duration-200 border-l-4 border-l-primary/20 hover:border-l-primary"
          onClick={() => router.push(`/dashboard/${p.id}`)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-primary" />
                <CardTitle className="capitalize text-lg">{p.name}</CardTitle>
              </div>
              <Badge variant="secondary" className="text-xs">
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {p.summary && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                {p.summary}
              </p>
            )}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Click to view details</span>
              <span>→</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
