"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock } from "lucide-react";
import { DailyLogCard } from "./DailyLogCard";
import { isDateInAnyRange, DateRange } from "@/lib/project-date-utils";
import { toast } from "sonner";

interface DayInfo {
  key: string;
  label: string;
  fullLabel: string;
}

interface Project {
  id: string;
  projectName: string;
}

interface DailyLogsGridProps {
  weekDates: Date[];
  hours: Record<string, number>;
  projects: Record<string, string>;
  descriptions: Record<string, string>;
  onDayClick: (dayKey: string) => void;
  isLoading: boolean;
  projectDateRanges: DateRange[];
  userProjects: Project[];
}

const DAYS: DayInfo[] = [
  { key: "mon", label: "Mon", fullLabel: "Monday" },
  { key: "tue", label: "Tue", fullLabel: "Tuesday" },
  { key: "wed", label: "Wed", fullLabel: "Wednesday" },
  { key: "thu", label: "Thu", fullLabel: "Thursday" },
  { key: "fri", label: "Fri", fullLabel: "Friday" },
  { key: "sat", label: "Sat", fullLabel: "Saturday" },
  { key: "sun", label: "Sun", fullLabel: "Sunday" },
];

export function DailyLogsGrid({
  weekDates,
  hours,
  projects,
  descriptions,
  onDayClick,
  isLoading,
  projectDateRanges,
  userProjects,
}: DailyLogsGridProps) {
  const handleDayClick = (dayKey: string, dayDate: Date) => {
    const isDateValid =
      projectDateRanges.length > 0
        ? isDateInAnyRange(dayDate, projectDateRanges)
        : true;

    if (isLoading || !isDateValid) {
      if (projectDateRanges.length > 0) {
        toast.error(
          "⚠️ Cannot log time outside of project date range"
        );
      } else {
        toast.error(
          "⚠️ Cannot log time - project has no date restrictions set"
        );
      }
      return;
    }

    onDayClick(dayKey);
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <Clock className="h-4 w-4 sm:h-5 sm:w-5" /> Daily Logs
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {isLoading
            ? // Loading Skeletons
            Array.from({ length: 7 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="rounded-xl border bg-card text-card-foreground shadow p-4 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))
            : // Actual Data
            DAYS.map((day, index) => {
              const dayDate = weekDates[index];

              return (
                <DailyLogCard
                  key={day.key}
                  day={day}
                  date={dayDate}
                  hours={hours[day.key] || 0}
                  project={projects[day.key] || "none"}
                  description={descriptions[day.key] || ""}
                  isDateValid={
                    projectDateRanges.length > 0
                      ? isDateInAnyRange(dayDate, projectDateRanges)
                      : true
                  }
                  onClick={() => handleDayClick(day.key, dayDate)}
                  userProjects={userProjects}
                  isLoading={isLoading}
                />
              );
            })}
        </div>
      </CardContent>
    </Card>
  );
}