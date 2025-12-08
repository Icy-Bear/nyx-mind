"use client";

import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateProject } from "@/actions/projects";
import { useState } from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";
import type { ProjectWithAssignees } from "@/lib/types";
import type { projectStatusEnum } from "@/db/schema/project-schema";

interface EditProjectFormProps {
  project: ProjectWithAssignees;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EditProjectForm({ project, onSuccess, onCancel }: EditProjectFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [projectName, setProjectName] = useState(project.projectName);
  const [summary, setSummary] = useState(project.summary || "");
  const [status, setStatus] = useState<typeof projectStatusEnum.enumValues[number]>(
    (project.status as typeof projectStatusEnum.enumValues[number]) || "not_started"
  );

  // Planned dates
  const [plannedDateRange, setPlannedDateRange] = useState<DateRange | undefined>({
    from: project.plannedStart || undefined,
    to: project.plannedEnd || undefined,
  });

  // Actual dates
  const [actualDateRange, setActualDateRange] = useState<DateRange | undefined>({
    from: project.actualStart || undefined,
    to: project.actualEnd || undefined,
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!projectName.trim()) {
      toast.error("Please enter a project name");
      return;
    }

    const plannedStart = plannedDateRange?.from;
    const plannedEnd = plannedDateRange?.to;
    const actualStart = actualDateRange?.from;
    const actualEnd = actualDateRange?.to;

    // Validate date ranges
    if (plannedStart && plannedEnd && plannedStart >= plannedEnd) {
      toast.error("Planned end date must be after start date");
      return;
    }

    if (actualStart && actualEnd && actualStart >= actualEnd) {
      toast.error("Actual end date must be after start date");
      return;
    }



    try {
      setIsPending(true);

      await updateProject(project.id, {
        projectName: projectName.trim(),
        summary: summary.trim() || undefined,
        status,
        plannedStart,
        plannedEnd,
        actualStart,
        actualEnd,
      });

      toast.success("Project updated successfully");
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update project"
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FieldGroup className="space-y-6 pb-4">
        <Field>
          <FieldLabel htmlFor="projectName">Project Name *</FieldLabel>
          <Input
            id="projectName"
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Enter project name"
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="summary">Project Summary</FieldLabel>
          <Textarea
            id="summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Enter project description or summary (optional)"
            rows={3}
            className="resize-none"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="status">Status</FieldLabel>
          <Select 
            value={status} 
            onValueChange={(value) => setStatus(value as typeof projectStatusEnum.enumValues[number])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not_started">Not Started</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        {/* Planned Dates */}
        <Field>
          <FieldLabel>Planned Project Duration</FieldLabel>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !plannedDateRange?.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                <span
                  className={cn(
                    "truncate max-w-[150px] sm:max-w-full",
                    (!plannedDateRange?.from || !plannedDateRange?.to) &&
                      "text-muted-foreground"
                  )}
                >
                  {plannedDateRange?.from && plannedDateRange?.to
                    ? `${format(plannedDateRange.from, "PPP")} → ${format(
                        plannedDateRange.to,
                        "PPP"
                      )}`
                    : plannedDateRange?.from
                    ? `${format(plannedDateRange.from, "PPP")} → No end date`
                    : "Select date range"}
                </span>
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={plannedDateRange}
                onSelect={setPlannedDateRange}
                numberOfMonths={1}
                className="rounded-md border"
              />
            </PopoverContent>
          </Popover>
        </Field>

        {/* Actual Dates */}
        <Field>
          <FieldLabel>Actual Project Duration</FieldLabel>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !actualDateRange?.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                <span
                  className={cn(
                    "truncate max-w-[150px] sm:max-w-full",
                    (!actualDateRange?.from || !actualDateRange?.to) &&
                      "text-muted-foreground"
                  )}
                >
                  {actualDateRange?.from && actualDateRange?.to
                    ? `${format(actualDateRange.from, "PPP")} → ${format(
                        actualDateRange.to,
                        "PPP"
                      )}`
                    : actualDateRange?.from
                    ? `${format(actualDateRange.from, "PPP")} → No end date`
                    : "Select date range"}
                </span>
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={actualDateRange}
                onSelect={setActualDateRange}
                numberOfMonths={1}
                className="rounded-md border"
              />
            </PopoverContent>
          </Popover>
          <FieldDescription>
            Leave empty if the project hasn&apos;t started or completed yet
          </FieldDescription>
        </Field>

        <Field>
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={onCancel}
              >
                Cancel
              </Button>
            </DialogClose>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              {isPending ? <Spinner /> : "Update Project"}
            </Button>
          </div>
        </Field>
      </FieldGroup>
    </form>
  );
}