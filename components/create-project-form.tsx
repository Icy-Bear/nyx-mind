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
import {
  createProject,
  getAllUsers,
  assignUsersToProject,
} from "@/actions/projects";
import { useRouter } from "next/navigation";
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
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

// 🟢 IMPORT DateRange TYPE
import type { DateRange } from "react-day-picker";

interface User {
  id: string;
  name: string;
  email: string;
  role: string | null;
}

interface CreateProjectFormProps {
  onSuccess?: () => void;
}

export function CreateProjectForm({ onSuccess }: CreateProjectFormProps = {}) {
  const [isPending, setIsPending] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [summary, setSummary] = useState("");

  // 🟢 FIXED RANGE STATE
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const router = useRouter();

  const loadUsers = async () => {
    if (usersLoaded) return;
    try {
      setIsLoadingUsers(true);
      const users = await getAllUsers();
      setAllUsers(users);
      setUsersLoaded(true);
    } catch (error) {
      toast.error("Failed to load users" + error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleUserToggle = (
    userId: string,
    checked: boolean | "indeterminate"
  ) => {
    if (checked === true) {
      setSelectedUsers((prev) => [...prev, userId]);
    } else {
      setSelectedUsers((prev) => prev.filter((id) => id !== userId));
    }
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!projectName.trim()) {
      toast.error("Please enter a project name");
      return;
    }

    const plannedStart = dateRange?.from;
    const plannedEnd = dateRange?.to;

    if (plannedStart && plannedEnd && plannedStart >= plannedEnd) {
      toast.error("Planned end date must be after start date");
      return;
    }

    try {
      setIsPending(true);

      const result = await createProject({
        projectName: projectName.trim(),
        summary: summary.trim() || undefined,
        plannedStart,
        plannedEnd,
      });

      if (result.success && selectedUsers.length > 0) {
        await assignUsersToProject(result.projectId, selectedUsers);
      }

      toast.success("Project created successfully");
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create project"
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

        {/* 🔥 RANGE PICKER UI */}
        <Field>
          <FieldLabel>Planned Project Duration</FieldLabel>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateRange?.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />

                <span
                  className={cn(
                    "truncate max-w-[150px] sm:max-w-full",
                    (!dateRange?.from || !dateRange?.to) &&
                      "text-muted-foreground"
                  )}
                >
                  {dateRange?.from && dateRange?.to
                    ? `${format(dateRange.from, "PPP")} → ${format(
                        dateRange.to,
                        "PPP"
                      )}`
                    : "Select date range"}
                </span>
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={1}
                className="rounded-md border"
              />
            </PopoverContent>
          </Popover>
        </Field>

        {/* TEAM MEMBER SELECTION */}
        <Field>
          <FieldLabel>Assign Team Members</FieldLabel>
          <FieldDescription className="text-sm">
            Select users to assign to this project. You can change this later.
          </FieldDescription>

          <div className="mt-3 space-y-3">
            <Button
              type="button"
              variant="outline"
              onClick={loadUsers}
              disabled={usersLoaded || isLoadingUsers}
            >
              {isLoadingUsers ? (
                <Spinner />
              ) : usersLoaded ? (
                "Users Loaded"
              ) : (
                "Load Users"
              )}
            </Button>

            {allUsers.length > 0 && (
              <div className="border rounded-md">
                <div className="p-3 border-b bg-muted/30 flex items-center justify-between text-sm font-medium">
                  <span>Select team members</span>
                  <span className="text-muted-foreground">
                    {selectedUsers.length} selected
                  </span>
                </div>

                <div className="max-h-64 overflow-y-auto p-3 space-y-3">
                  {allUsers.map((user) => (
                    <div key={user.id} className="flex items-start space-x-3">
                      <Checkbox
                        id={user.id}
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={(checked) =>
                          handleUserToggle(user.id, checked as boolean)
                        }
                        className="mt-0.5"
                      />
                      <label
                        htmlFor={user.id}
                        className="text-sm font-medium cursor-pointer flex-1 min-w-0"
                      >
                        <div className="font-semibold">{user.name}</div>
                        <div className="text-muted-foreground text-xs truncate">
                          {user.email}
                        </div>
                        <div className="text-muted-foreground text-xs capitalize">
                          {user.role}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Field>

        <Field>
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
            </DialogClose>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              {isPending ? <Spinner /> : "Create Project"}
            </Button>
          </div>
        </Field>
      </FieldGroup>
    </form>
  );
}
