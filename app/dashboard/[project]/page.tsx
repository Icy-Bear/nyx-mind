"use client";

import {
  getProjectDetails,
  assignUsersToProject,
  getAllUsers,
} from "@/actions/projects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import { UserPlus, Calendar, Users } from "lucide-react";
import { format } from "date-fns";
import { ActionDialog } from "@/components/action-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useParams } from "next/navigation";

interface Props {
  params: { project: string };
}

interface Project {
  id: string;
  projectName: string;
  plannedStart: Date | null;
  plannedEnd: Date | null;
  percentComplete: string | null;
  createdAt: Date | null;
  assignees: Array<{
    id: string;
    name: string;
    email: string;
    role: string | null;
  }>;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string | null;
}

export default function ProjectPage() {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const params = useParams<{ project: string }>();

  useEffect(() => {
    const loadProject = async () => {
      try {
        const projectData = await getProjectDetails(params.project);
        setProject(projectData);
      } catch (error) {
        toast.error("Failed to load project");
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [params.project]);

  const loadUsers = async () => {
    if (allUsers.length > 0) return;
    try {
      const users = await getAllUsers();
      setAllUsers(users);
      // Pre-select current assignees
      setSelectedUsers(project?.assignees.map((a) => a.id) || []);
    } catch (error) {
      toast.error("Failed to load users");
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

  const handleAssignUsers = async () => {
    if (!project) return;
    try {
      await assignUsersToProject(project.id, selectedUsers);
      toast.success("Team members updated successfully");
      // Reload project data
      const updatedProject = await getProjectDetails(params.project);
      setProject(updatedProject);
    } catch (error) {
      toast.error("Failed to update team members");
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!project) {
    return <div className="p-6">Project not found</div>;
  }

  return (
    <div className="min-h-screen bg-background p-3 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{project.projectName}</h1>
              <p className="text-muted-foreground mt-1">
                Project details and team management
              </p>
            </div>
            {isAdmin && (
              <ActionDialog
                title="Manage Team Members"
                description="Add or remove team members from this project."
                label="Manage Team"
                icon={<UserPlus className="h-4 w-4" />}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onOpenChange={async (open) => {
                  if (open) await loadUsers();
                }}
              >
                <div className="space-y-4">
                  <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                    {allUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={user.id}
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={(checked) =>
                            handleUserToggle(user.id, checked)
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
                  <Button onClick={handleAssignUsers} className="w-full">
                    Update Team Members
                  </Button>
                </div>
              </ActionDialog>
            )}
          </div>
        </div>

        {/* Project Info Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <Badge variant="secondary">
                {project.percentComplete
                  ? `${project.percentComplete}%`
                  : "Not Started"}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {project.percentComplete || 0}%
              </div>
              <p className="text-xs text-muted-foreground">Complete</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Size</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {project.assignees.length}
              </div>
              <p className="text-xs text-muted-foreground">Members</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Start Date</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {project.plannedStart
                  ? format(project.plannedStart, "MMM dd")
                  : "TBD"}
              </div>
              <p className="text-xs text-muted-foreground">
                {project.plannedStart
                  ? format(project.plannedStart, "yyyy")
                  : ""}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">End Date</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {project.plannedEnd
                  ? format(project.plannedEnd, "MMM dd")
                  : "TBD"}
              </div>
              <p className="text-xs text-muted-foreground">
                {project.plannedEnd ? format(project.plannedEnd, "yyyy") : ""}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Team Members */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            {project.assignees.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {project.assignees.map((assignee) => (
                  <div
                    key={assignee.id}
                    className="flex items-center space-x-3"
                  >
                    <Avatar>
                      <AvatarFallback>
                        {assignee.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{assignee.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {assignee.email}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {assignee.role}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                No team members assigned yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
