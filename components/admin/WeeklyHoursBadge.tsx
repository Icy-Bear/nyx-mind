"use client";

import { useState, useCallback, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Clock, TrendingUp, TrendingDown } from "lucide-react";
import { getUserWeeklyProgress, getWeeklyReport } from "@/actions/weekly-reports";
import { startOfWeek } from "date-fns";

interface WeeklyHoursBadgeProps {
  userId: string;
  userName: string;
  className?: string;
}

interface WeeklyProgress {
  targetHours: number;
  actualHours: number;
  progressPercentage: number;
  weekStartDate: string;
}

interface ProjectBreakdown {
  projectName: string;
  hours: number;
  description?: string;
}

export function WeeklyHoursBadge({ userId, userName, className }: WeeklyHoursBadgeProps) {
  const [progress, setProgress] = useState<WeeklyProgress | null>(null);
  const [projectBreakdown, setProjectBreakdown] = useState<ProjectBreakdown[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const loadWeeklyProgress = useCallback(async () => {
    setLoading(true);
    try {
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const [progressData, reportData] = await Promise.all([
        getUserWeeklyProgress(userId, weekStart),
        getWeeklyReport(weekStart, userId)
      ]);

      setProgress(progressData);

      // Extract project breakdown from daily entries
      if (reportData?.entries) {
        const projectMap = new Map<string, number>();

        reportData.entries.forEach((entry) => {
          const hours = parseFloat(entry.hours);
          if (hours > 0) {
            const projectName = entry.projectName || "Unknown Project";
            projectMap.set(
              projectName,
              (projectMap.get(projectName) || 0) + hours
            );
          }
        });

        const breakdown = Array.from(projectMap.entries())
          .map(([projectName, hours]) => ({
            projectName,
            hours: parseFloat(hours.toFixed(2))
          }))
          .sort((a, b) => b.hours - a.hours);

        setProjectBreakdown(breakdown);
      }
    } catch (error) {
      console.error(`Failed to load weekly progress for user ${userId}:`, error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadWeeklyProgress();
  }, [loadWeeklyProgress]);

  if (loading) {
    return (
      <Badge variant="outline" className={`text-xs ${className}`}>
        <Clock className="h-3 w-3 mr-1 animate-spin" />
        Loading...
      </Badge>
    );
  }

  if (!progress) {
    return (
      <Badge variant="outline" className={`text-xs ${className}`}>
        <Clock className="h-3 w-3 mr-1" />
        No data
      </Badge>
    );
  }

  const isOverTarget = progress.actualHours > progress.targetHours;
  const progressColor = isOverTarget ? "text-green-600" : "text-orange-600";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={`text-xs cursor-pointer hover:bg-accent transition-colors ${className}`}
            onClick={() => setShowDetails(!showDetails)}
          >
            <Clock className="h-3 w-3 mr-1" />
            {progress.actualHours.toFixed(1)}h / {progress.targetHours}h
            {isOverTarget ? (
              <TrendingUp className="h-3 w-3 ml-1 text-green-600" />
            ) : (
              <TrendingDown className="h-3 w-3 ml-1 text-orange-600" />
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-2">
            <div className="font-semibold">{userName}&apos;s Week Progress</div>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Target:</span>
                <span className="font-medium">{progress.targetHours}h</span>
              </div>
              <div className="flex justify-between">
                <span>Actual:</span>
                <span className={`font-medium ${progressColor}`}>
                  {progress.actualHours.toFixed(1)}h
                </span>
              </div>
              <div className="flex justify-between">
                <span>Progress:</span>
                <span className={`font-medium ${progressColor}`}>
                  {progress.progressPercentage.toFixed(0)}%
                </span>
              </div>
            </div>

            {projectBreakdown.length > 0 && (
              <div className="border-t pt-2">
                <div className="text-xs font-medium mb-1">Project Breakdown:</div>
                <div className="text-xs space-y-1">
                  {projectBreakdown.slice(0, 3).map((project, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="truncate max-w-[120px]">{project.projectName}</span>
                      <span className="font-medium">{project.hours}h</span>
                    </div>
                  ))}
                  {projectBreakdown.length > 3 && (
                    <div className="text-muted-foreground italic">
                      +{projectBreakdown.length - 3} more projects
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              Week of {new Date(progress.weekStartDate).toLocaleDateString()}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}