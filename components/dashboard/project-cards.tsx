"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderOpen } from "lucide-react";
import { Project } from "@/lib/types";
import { getStatusColor, getStatusLabel } from "@/lib/status-utils";

interface ProjectCardsProps {
  projects: Project[];
  role: string;
}

export function ProjectCards({ projects, role }: ProjectCardsProps) {
  const router = useRouter();

  if (projects.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            {role === "admin" ? (
              <div>
                <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                <p className="text-muted-foreground">Create your first project to get started.</p>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold mb-2">No projects assigned</h3>
                <p className="text-muted-foreground">You haven&apos;t been assigned to any projects yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

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
                <CardTitle className="capitalize text-lg">
                  {p.projectName}
                </CardTitle>
              </div>
              <Badge className={`text-xs border ${getStatusColor(p.status)}`}>
                {getStatusLabel(p.status)}
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
