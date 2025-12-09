"use client";

import { useState, useEffect } from "react";
import { startOfWeek } from "date-fns";
import { getWeeklyReport } from "@/actions/weekly-reports";
import { toast } from "sonner";

interface Member {
  id: string;
  name: string;
  email: string;
  role: string | null;
  createdAt: Date;
}

interface UseWeeklyReportDataProps {
  member: Member | null;
  selectedDate: Date;
  currentProjectId?: string;
  onDataSaved?: () => void;
}

export function useWeeklyReportData({
  member,
  selectedDate,
  currentProjectId,
  onDataSaved,
}: UseWeeklyReportDataProps) {
  const [hours, setHours] = useState<Record<string, number>>({
    mon: 0,
    tue: 0,
    wed: 0,
    thu: 0,
    fri: 0,
    sat: 0,
    sun: 0,
  });

  const [projects, setProjects] = useState<Record<string, string>>({
    mon: "none",
    tue: "none",
    wed: "none",
    thu: "none",
    fri: "none",
    sat: "none",
    sun: "none",
  });

  const [descriptions, setDescriptions] = useState<Record<string, string>>({
    mon: "",
    tue: "",
    wed: "",
    thu: "",
    fri: "",
    sat: "",
    sun: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [targetHours, setTargetHours] = useState<number>(40);

  // Load weekly report data when week changes or data is saved
  useEffect(() => {
    const loadWeeklyReport = async () => {
      if (!member) return;

      setIsLoading(true);
      try {
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
        const report = await getWeeklyReport(weekStart, member.id, currentProjectId);

        if (report) {
          setHours(report.hours);
          setProjects(report.projects);
          setDescriptions(report.descriptions);
          setTargetHours(report.targetHours || 40);
        } else {
          // Reset to defaults for new week
          setHours({
            mon: 0,
            tue: 0,
            wed: 0,
            thu: 0,
            fri: 0,
            sat: 0,
            sun: 0,
          });
          setProjects({
            mon: "none",
            tue: "none",
            wed: "none",
            thu: "none",
            fri: "none",
            sat: "none",
            sun: "none",
          });
          setDescriptions({
            mon: "",
            tue: "",
            wed: "",
            thu: "",
            fri: "",
            sat: "",
            sun: "",
          });
        }
      } catch (error) {
        console.error("Error loading weekly report:", error);
        toast.error("Failed to load weekly report");
      } finally {
        setIsLoading(false);
      }
    };

    loadWeeklyReport();
  }, [selectedDate, member, refreshTrigger, currentProjectId]);

  const updateHours = (dayKey: string, value: number) => {
    setHours((prev) => ({
      ...prev,
      [dayKey]: Math.max(0, Math.min(24, value)),
    }));
  };

  const updateProject = (dayKey: string, value: string) => {
    setProjects((prev) => ({
      ...prev,
      [dayKey]: value,
    }));
  };

  const updateDescription = (dayKey: string, text: string) => {
    setDescriptions((prev) => ({ ...prev, [dayKey]: text }));
  };

  const refreshData = () => {
    setRefreshTrigger((prev) => prev + 1);
    onDataSaved?.();
  };

  // Calculate total actual hours worked
  const totalActualHours = Object.values(hours).reduce((sum, dayHours) => sum + dayHours, 0);

  return {
    hours,
    projects,
    descriptions,
    targetHours,
    totalActualHours,
    isLoading,
    updateHours,
    updateProject,
    updateDescription,
    refreshData,
  };
}