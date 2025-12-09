import type { Project } from "@/lib/types";
import { format, differenceInWeeks, startOfWeek, addWeeks } from "date-fns";

export interface DateRange {
  start: Date;
  end: Date;
  type: 'actual' | 'planned';
}

export type DateRangeType = 'actual' | 'planned';

export function getValidDateRange(project: Project): DateRange | null {
  // Priority: Actual dates > Planned dates > No restrictions
  if (project.actualStart && project.actualEnd) {
    return {
      start: project.actualStart,
      end: project.actualEnd,
      type: 'actual'
    };
  }
  
  if (project.plannedStart && project.plannedEnd) {
    return {
      start: project.plannedStart,
      end: project.plannedEnd,
      type: 'planned'
    };
  }
  
  // No date restrictions if no dates are set
  return null;
}

export function isDateInRange(date: Date, range: DateRange): boolean {
  return date >= range.start && date <= range.end;
}

export function getDateRangeMessage(range: DateRange): string {
  const startStr = format(range.start, "MMM dd, yyyy");
  const endStr = format(range.end, "MMM dd, yyyy");
  const typeLabel = range.type === 'actual' ? 'Actual' : 'Planned';
  
  return `${typeLabel}: ${startStr} - ${endStr}`;
}

export function getProjectDateRanges(projects: Project[]): DateRange[] {
  return projects
    .map(project => getValidDateRange(project))
    .filter((Range): Range is NonNullable<typeof Range> => Range !== null);
}

export function isDateInAnyRange(date: Date, ranges: DateRange[]): boolean {
  return ranges.some(range => isDateInRange(date, range));
}

export interface ProjectWeekInfo {
  totalWeeks: number;
  currentWeek: number;
  weekStart: Date;
  weekEnd: Date;
  weekNumber: number;
  projectStart: Date;
  projectEnd: Date;
  dateRangeType: 'actual' | 'planned';
}

export function getProjectWeekInfo(project: Project, selectedDate: Date): ProjectWeekInfo | null {
  const dateRange = getValidDateRange(project);
  if (!dateRange) return null;

  const projectStart = startOfWeek(dateRange.start, { weekStartsOn: 1 });
  const projectEnd = dateRange.end;
  
  // Calculate total weeks in project
  const totalWeeks = Math.max(1, differenceInWeeks(projectEnd, projectStart) + 1);
  
  // Calculate current week based on selected date
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = addWeeks(weekStart, 1);
  
  // Find which week number this is in the project
  let currentWeek = Math.max(1, differenceInWeeks(weekStart, projectStart) + 1);
  
  // Ensure current week doesn't exceed total weeks
  currentWeek = Math.min(currentWeek, totalWeeks);
  
  return {
    totalWeeks,
    currentWeek,
    weekStart,
    weekEnd,
    weekNumber: currentWeek,
    projectStart,
    projectEnd,
    dateRangeType: dateRange.type
  };
}

export function getProjectWeekModifier(weekNumber: number): string {
  const weekColors = [
    'week1', 'week2', 'week3', 'week4', 
    'week5', 'week6', 'week7', 'week8'
  ];
  return weekColors[(weekNumber - 1) % weekColors.length];
}

export function getProjectWeekClassName(weekNumber: number): string {
  const weekColors = [
    "bg-blue-50 hover:bg-blue-100 text-blue-700",
    "bg-green-50 hover:bg-green-100 text-green-700", 
    "bg-yellow-50 hover:bg-yellow-100 text-yellow-700",
    "bg-purple-50 hover:bg-purple-100 text-purple-700",
    "bg-orange-50 hover:bg-orange-100 text-orange-700",
    "bg-pink-50 hover:bg-pink-100 text-pink-700",
    "bg-indigo-50 hover:bg-indigo-100 text-indigo-700",
    "bg-teal-50 hover:bg-teal-100 text-teal-700"
  ];
  return weekColors[(weekNumber - 1) % weekColors.length];
}