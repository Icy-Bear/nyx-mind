"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Edit, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

export interface DayInfo {
  key: string;
  label: string;
  fullLabel: string;
}

interface Project {
  id: string;
  projectName: string;
}

interface DailyLogCardProps {
  day: DayInfo;
  date: Date;
  hours: number;
  project: string;
  description: string;
  isDateValid: boolean;
  onClick: () => void;
  userProjects: Project[];
  isLoading?: boolean;
}

export function DailyLogCard({
  day,
  date,
  hours,
  project,
  description,
  isDateValid,
  onClick,
  userProjects,
  isLoading = false,
}: DailyLogCardProps) {
  const hasErrors = !project || project === "none" || !description;

  const getProjectColor = (projectId: string) => {
    if (projectId === "none")
      return "bg-gray-100 text-gray-700 border-gray-200";
    const colors = [
      "bg-blue-100 text-blue-700 border-blue-200",
      "bg-green-100 text-green-700 border-green-200",
      "bg-purple-100 text-purple-700 border-purple-200",
      "bg-orange-100 text-orange-700 border-orange-200",
      "bg-pink-100 text-pink-700 border-pink-200",
      "bg-indigo-100 text-indigo-700 border-indigo-200",
      "bg-teal-100 text-teal-700 border-teal-200",
      "bg-yellow-100 text-yellow-700 border-yellow-200",
    ];
    const index =
      projectId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
      colors.length;
    return colors[index];
  };

  return (
    <Button
      key={day.key}
      variant="outline"
      className={`h-auto p-3 sm:p-4 flex flex-col items-start gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl transition-all duration-200 relative ${
        !isDateValid
          ? "bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed"
          : hasErrors
          ? "bg-gradient-to-br from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 border-2 border-dashed border-red-200 hover:border-red-300"
          : "bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border-2 border-dashed border-blue-200 hover:border-blue-300"
      }`}
      onClick={onClick}
      disabled={isLoading || !isDateValid}
    >
      <div className="flex items-center justify-between w-full">
        <span className="font-semibold text-sm text-blue-700">{day.label}</span>
        <div className="flex items-center gap-1">
          {hasErrors && (
            <AlertTriangle className="h-3 w-3 text-red-500 shrink-0" />
          )}
          <Edit className="h-3 w-3 text-blue-500 shrink-0" />
        </div>
      </div>
      <div className="text-xs text-muted-foreground">
        {format(date, "MMM d")}
      </div>
      <div className="flex items-center gap-1 text-sm">
        <Clock className="h-3 w-3 text-green-600 shrink-0" />
        <span className="font-medium text-green-700">{hours}h</span>
      </div>
      <div className="flex items-center gap-1">
        {project && project !== "none" ? (
          <Badge
            variant="secondary"
            className={`text-xs px-1.5 py-0.5 border ${getProjectColor(
              project
            )}`}
          >
            {userProjects.find((p) => p.id === project)?.projectName || project}
          </Badge>
        ) : (
          <span className="text-xs text-gray-500">------</span>
        )}
      </div>
      <div className="text-xs text-gray-600 truncate w-full min-w-0">
        {description || "No description"}
      </div>
    </Button>
  );
}
