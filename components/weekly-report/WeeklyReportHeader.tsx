"use client";

import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";
import { format, startOfWeek, endOfWeek } from "date-fns";

interface Member {
  id: string;
  name: string;
  email: string;
  role: string | null;
  createdAt: Date;
}

interface WeeklyReportHeaderProps {
  member: Member | null;
  selectedDate: Date;
  currentProjectName?: string;
}

export function WeeklyReportHeader({
  member,
  selectedDate,
  currentProjectName,
}: WeeklyReportHeaderProps) {
  if (!member) return null;

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });

  return (
    <div className="p-4 sm:p-6 border-b bg-gradient-to-r from-primary/5 to-secondary/5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div className="min-w-0 flex-1">
          <div className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <span className="truncate">{member.name}&apos;s Weekly Report</span>
          </div>
          <div className="text-sm sm:text-base text-muted-foreground mt-1">
            {currentProjectName && (
              <>
                <span className="block sm:inline">
                  Project:{" "}
                  <span className="font-medium text-foreground">
                    {currentProjectName}
                  </span>
                </span>
              </>
            )}
          </div>
        </div>
        <Badge
          variant="secondary"
          className="text-sm self-start sm:self-center shrink-0"
        >
          Week{" "}
          {Math.ceil((selectedDate.getDate() - selectedDate.getDay() + 1) / 7)}
        </Badge>
      </div>
    </div>
  );
}
