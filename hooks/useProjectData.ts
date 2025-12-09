"use client";

import { useState, useEffect } from "react";
import { getProjects, getProjectDetails } from "@/actions/projects";
import { toast } from "sonner";
import { getProjectDateRanges, DateRange } from "@/lib/project-date-utils";

interface Member {
  id: string;
  name: string;
  email: string;
  role: string | null;
  createdAt: Date;
}

interface UseProjectDataProps {
  member: Member | null;
  currentProjectId?: string;
  currentProjectName?: string;
}

export function useProjectData({
  member,
  currentProjectId,
  currentProjectName,
}: UseProjectDataProps) {
  const [userProjects, setUserProjects] = useState<
    Array<{ id: string; projectName: string }>
  >([]);
  const [projectDateRanges, setProjectDateRanges] = useState<DateRange[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentProject, setCurrentProject] = useState<{
    id: string;
    projectName: string;
    status: "not_started" | "in_progress" | "on_hold" | "completed" | "cancelled" | null;
    summary: string | null;
    plannedStart: Date | null;
    plannedEnd: Date | null;
    actualStart: Date | null;
    actualEnd: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    assignees: Member[];
  } | null>(null);

  // Load current project and user projects when member changes
  useEffect(() => {
    const loadProjectData = async () => {
      if (!member) return;

      setIsLoading(true);
      try {
        if (currentProjectId && currentProjectName) {
          // In project context - only load current project
          const projectDetails = await getProjectDetails(currentProjectId);
          setUserProjects([{ id: currentProjectId, projectName: currentProjectName }]);
          setCurrentProject(projectDetails);
          
          // Get date range for current project only
          const ranges = getProjectDateRanges([projectDetails]);
          setProjectDateRanges(ranges);
        } else {
          // In general context - load all user projects
          const projects = await getProjects(member.id);
          setUserProjects(
            projects.map((p) => ({ id: p.id, projectName: p.projectName }))
          );

          // Get date ranges for all projects
          const ranges = getProjectDateRanges(projects);
          setProjectDateRanges(ranges);
        }
      } catch (error) {
        console.error("Error loading project data:", error);
        toast.error("Failed to load project data");
        setUserProjects([]);
        setProjectDateRanges([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjectData();
  }, [member, currentProjectId, currentProjectName]);

  return {
    userProjects,
    projectDateRanges,
    isLoading,
    currentProject,
  };
}