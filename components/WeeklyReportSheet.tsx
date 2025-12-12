// ✅ REFACTORED WeeklyReportSheet - broken down into smaller, reusable components
"use client";

import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { useState } from "react";
import { startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { saveDailyEntry } from "@/actions/weekly-reports";
import { toast } from "sonner";

// Import extracted components
import {
  WeeklyReportHeader,
  WeekNavigation,
  DailyLogsGrid,
  DayEditDialog,
  TargetHoursProgress,
} from "./weekly-report";

// Import custom hooks
import { useWeeklyReportData } from "@/hooks/useWeeklyReportData";
import { useProjectData } from "@/hooks/useProjectData";
import { useAuth } from "@/hooks/useAuth";

// Day mapping constant (matches database values)
const DAY_MAPPING = {
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
  sun: 0,
};

interface WeeklyReportSheetProps {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  member: {
    id: string;
    name: string;
    email: string;
    role: string | null;
    createdAt: Date;
  } | null;
  onDataSaved?: () => void;
  currentProjectId?: string;
  currentProjectName?: string;
}

export function WeeklyReportSheet({
  open,
  onOpenChange,
  member,
  onDataSaved,
  currentProjectId,
  currentProjectName,
}: WeeklyReportSheetProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Use custom hooks for data management
  const {
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
  } = useWeeklyReportData({
    member,
    selectedDate,
    currentProjectId,
    onDataSaved,
  });

  const { userProjects, projectDateRanges, currentProject } = useProjectData({
    member,
    currentProjectId,
    currentProjectName,
  });

  const { isAdmin } = useAuth();

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDates = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const handleSaveDay = async () => {
    if (!editingDay) return;

    setIsSaving(true);
    try {
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
      const dayOfWeek = DAY_MAPPING[editingDay as keyof typeof DAY_MAPPING];

      await saveDailyEntry({
        weekStartDate: weekStart,
        dayOfWeek,
        hours: hours[editingDay],
        projectName:
          projects[editingDay] === "none" ? "" : projects[editingDay],
        description: descriptions[editingDay] || "",
        currentProjectId: currentProjectId,
      });

      toast.success("Day saved successfully!");
      setDialogOpen(false);
      setEditingDay(null);
      refreshData();
    } catch (error) {
      console.error("Error saving day:", error);
      toast.error("Failed to save day");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDayClick = (dayKey: string) => {
    setEditingDay(dayKey);
    setDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) setEditingDay(null);
  };

  if (!member) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl p-0 border-l bg-background"
      >
        <SheetTitle className="sr-only">
          Weekly Report
        </SheetTitle>
        {/* HEADER */}
        <WeeklyReportHeader
          member={member}
          selectedDate={selectedDate}
          currentProjectName={currentProjectName}
          targetHours={targetHours}
          project={currentProject}
        />

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* TARGET HOURS AND PROGRESS */}
            <TargetHoursProgress
              member={member}
              targetHours={targetHours}
              actualHours={totalActualHours}
              selectedDate={selectedDate}
              isCurrentUserAdmin={isAdmin}
              onTargetHoursUpdated={refreshData}
              projectId={currentProjectId}
            />

            {/* WEEK NAVIGATION */}
            <WeekNavigation
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              projectDateRanges={projectDateRanges}
              project={currentProject ? {
                id: currentProject.id,
                projectName: currentProject.projectName,
                plannedStart: currentProject.plannedStart,
                plannedEnd: currentProject.plannedEnd,
                actualStart: currentProject.actualStart,
                actualEnd: currentProject.actualEnd,
              } : undefined}
            />

            {/* DAILY LOGS GRID */}
            <DailyLogsGrid
              weekDates={weekDates}
              hours={hours}
              projects={projects}
              descriptions={descriptions}
              onDayClick={handleDayClick}
              isLoading={isLoading}
              projectDateRanges={projectDateRanges}
              userProjects={userProjects}
            />
          </div>
        </div>

        {/* EDIT DIALOG */}
        <DayEditDialog
          open={dialogOpen}
          onOpenChange={handleDialogClose}
          day={
            editingDay
              ? {
                key: editingDay,
                label: editingDay.charAt(0).toUpperCase() + editingDay.slice(1),
                fullLabel:
                  editingDay.charAt(0).toUpperCase() + editingDay.slice(1) + "day",
              }
              : null
          }
          hours={editingDay ? hours[editingDay] : 0}
          project={editingDay ? projects[editingDay] : "none"}
          description={editingDay ? descriptions[editingDay] : ""}
          onHoursChange={(value) => editingDay && updateHours(editingDay, value)}
          onProjectChange={(value) => editingDay && updateProject(editingDay, value)}
          onDescriptionChange={(value) =>
            editingDay && updateDescription(editingDay, value)
          }
          onSave={handleSaveDay}
          isSaving={isSaving}
          userProjects={userProjects}
          currentProjectId={currentProjectId}
          currentProjectName={currentProjectName}
        />
      </SheetContent>
    </Sheet>
  );
}