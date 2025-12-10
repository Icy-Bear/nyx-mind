"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  ChevronLeft,
  ChevronRight,
  CalendarIcon,
  ChevronDownIcon,
} from "lucide-react";
import { format, startOfWeek, endOfWeek } from "date-fns";
import {
  DateRange,
  getProjectWeekInfo,
  getProjectWeekModifier,
  getProjectWeekClassName
} from "@/lib/project-date-utils";

interface WeekNavigationProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  projectDateRanges: DateRange[];
  project?: {
    id: string;
    projectName: string;
    plannedStart?: Date | null;
    plannedEnd?: Date | null;
    actualStart?: Date | null;
    actualEnd?: Date | null;
  };
}

export function WeekNavigation({
  selectedDate,
  onDateChange,
  projectDateRanges,
  project,
}: WeekNavigationProps) {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const weekStart = startOfWeek(date, { weekStartsOn: 1 });
      onDateChange(weekStart);
    }
  };

  // Get project week info for week calculation
  const projectWeekInfo = project ? getProjectWeekInfo(project, selectedDate) : null;

  const goToPreviousWeek = () => {
    onDateChange(new Date(selectedDate.getTime() - 7 * 24 * 60 * 60 * 1000));
  };

  const goToNextWeek = () => {
    onDateChange(new Date(selectedDate.getTime() + 7 * 24 * 60 * 60 * 1000));
  };

  return (
    <Card>
      <CardContent className="pt-4 sm:pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={goToPreviousWeek}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Prev</span>
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 font-semibold text-base sm:text-lg hover:bg-accent w-full sm:w-auto justify-center"
              >
                <CalendarIcon className="h-4 w-4" />
                <span className="truncate">
                  {format(weekStart, "MMM d")} -{" "}
                  {format(weekEnd, "MMM d, yyyy")}
                </span>
                <ChevronDownIcon className="h-4 w-4 opacity-50 shrink-0" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0"
              align="center"
              side="bottom"
            >
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                className="rounded-md border-0"
                disabled={(date) => {
                  if (projectDateRanges.length === 0) return false;
                  return !projectDateRanges.some(
                    (range) => date >= range.start && date <= range.end
                  );
                }}
                modifiers={
                  projectWeekInfo ? {
                    [getProjectWeekModifier(projectWeekInfo.currentWeek)]: (date) => {
                      const dateWeekInfo = project ? getProjectWeekInfo(project, date) : null;
                      return dateWeekInfo?.weekNumber === projectWeekInfo.currentWeek;
                    }
                  } : {}
                }
                modifiersClassNames={
                  projectWeekInfo ? {
                    [getProjectWeekModifier(projectWeekInfo.currentWeek)]: getProjectWeekClassName(projectWeekInfo.currentWeek)
                  } : {}
                }
              />
              {projectWeekInfo && (
                <div className="p-3 border-t bg-muted/30">
                  <div className="text-xs font-medium text-muted-foreground mb-2 text-center">
                    Project Week Colors
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-blue-100 border border-blue-200"></div>
                      <span>Week 1</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-green-100 border border-green-200"></div>
                      <span>Week 2</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-yellow-100 border border-yellow-200"></div>
                      <span>Week 3</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-purple-100 border border-purple-200"></div>
                      <span>Week 4</span>
                    </div>
                    {projectWeekInfo.totalWeeks > 4 && (
                      <>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded bg-orange-100 border border-orange-200"></div>
                          <span>Week 5+</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={goToNextWeek}
          >
            <span className="hidden sm:inline">Next</span>
            <span className="sm:hidden">Next</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        <div className="text-center mt-2 sm:mt-2">
          <div className="text-sm text-muted-foreground">
            {projectWeekInfo ? (
              <>
                Week {projectWeekInfo.currentWeek} of {projectWeekInfo.totalWeeks}
                <div className="text-xs text-muted-foreground mt-1">
                  ({projectWeekInfo.dateRangeType === 'actual' ? 'Actual' : 'Planned'} Dates)
                </div>
              </>
            ) : (
              <>Week {Math.ceil((selectedDate.getDate() - selectedDate.getDay() + 1) / 7)}</>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}