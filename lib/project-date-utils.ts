import type { Project } from "@/lib/types";
import { format } from "date-fns";

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