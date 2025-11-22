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

interface User {
  id: string;
  name: string;
  email: string;
  role: string | null;
}

export function CreateProjectForm() {
  const [isPending, setIsPending] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [summary, setSummary] = useState("");
  const [plannedStart, setPlannedStart] = useState<Date>();
  const [plannedEnd, setPlannedEnd] = useState<Date>();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const router = useRouter();

  // Load users when component mounts
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

    if (plannedStart && plannedEnd && plannedStart >= plannedEnd) {
      toast.error("Planned end date must be after start date");
      return;
    }

    try {
      setIsPending(true);

      // Create the project
      const result = await createProject({
        projectName: projectName.trim(),
        summary: summary.trim() || undefined,
        plannedStart,
        plannedEnd,
      });

      if (result.success && selectedUsers.length > 0) {
        // Assign users to the project
        await assignUsersToProject(result.projectId, selectedUsers);
      }

      toast.success("Project created successfully");
      router.push("/dashboard");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create project"
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
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
          />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field>
            <FieldLabel>Planned Start Date</FieldLabel>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !plannedStart && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {plannedStart ? format(plannedStart, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={plannedStart}
                  onSelect={setPlannedStart}
                />
              </PopoverContent>
            </Popover>
          </Field>

          <Field>
            <FieldLabel>Planned End Date</FieldLabel>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !plannedEnd && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {plannedEnd ? format(plannedEnd, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={plannedEnd}
                  onSelect={setPlannedEnd}
                />
              </PopoverContent>
            </Popover>
          </Field>
        </div>

        <Field>
          <FieldLabel>Assign Team Members</FieldLabel>
          <FieldDescription>
            Select users to assign to this project. You can change this later.
          </FieldDescription>
          <div className="mt-3">
            <Button
              type="button"
              variant="outline"
              onClick={loadUsers}
              disabled={usersLoaded || isLoadingUsers}
            >
              {isLoadingUsers ? <Spinner /> : usersLoaded ? "Users Loaded" : "Load Users"}
            </Button>
            {allUsers.length > 0 && (
              <div className="mt-4 space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                {allUsers.map((user) => (
                  <div key={user.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={user.id}
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={(checked) =>
                        handleUserToggle(user.id, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={user.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {user.name} ({user.email}) - {user.role}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Field>

        <Field>
          <div className="flex gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending ? <Spinner /> : "Create Project"}
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
          </div>
        </Field>
      </FieldGroup>
    </form>
  );
}
