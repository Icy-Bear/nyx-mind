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
import { ProjectWithAssignees, User } from "@/lib/types";
import { WeeklyReportSheet } from "@/components/WeeklyReportSheet";
import { usePageTitle } from "@/contexts/page-title-context";

export default function ProjectPage() {
  const [project, setProject] = useState<ProjectWithAssignees | null>(null);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedMember, setSelectedMember] = useState<{
    id: string;
    name: string;
    email: string;
    role: string | null;
  } | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const { data: session } = useSession();
  const { setTitle } = usePageTitle();
  const loggedInUserId = session?.user?.id;
  const isAdmin = session?.user?.role === "admin";
  const params = useParams<{ project: string }>();

  useEffect(() => {
    const loadProject = async () => {
      try {
        const projectData = await getProjectDetails(params.project);
        setProject(projectData);
      } catch (error) {
        toast.error("Failed to load project" + error);
      } finally {
        setLoading(false);
      }
    };
    loadProject();
  }, [params.project]);

  useEffect(() => {
    if (project) {
      setTitle(project.projectName);
    }
    return () => setTitle(null); // Clean up on unmount
  }, [project, setTitle]);

  const loadUsers = async () => {
    if (allUsers.length > 0) return;
    try {
      const users = await getAllUsers();
      setAllUsers(users);
      setSelectedUsers(project?.assignees.map((a) => a.id) || []);
    } catch (error) {
      toast.error("Failed to load users" + error);
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
      const updatedProject = await getProjectDetails(params.project);
      setProject(updatedProject);
    } catch (error) {
      toast.error("Failed to update team members" + error);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!project) {
    return <div className="p-6">Project not found</div>;
  }

  // --- SORT MEMBERS: Logged-in user first ---
  const sortedAssignees = [...project.assignees].sort((a, b) => {
    if (a.id === loggedInUserId) return -1;
    if (b.id === loggedInUserId) return 1;
    return 0;
  });

  return (
    <>
      {/* MAIN PAGE */}
      <div className="min-h-screen bg-background p-3 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
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
                            className="text-sm font-medium leading-none"
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-10">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
                <Badge variant="secondary">
                  {(project.status ?? "not_started").replace("_", " ")}
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
                <CardTitle className="text-sm font-medium">
                  Start Date
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {project.plannedStart
                    ? format(project.plannedStart, "MMM dd")
                    : "TBD"}
                </div>
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
              </CardContent>
            </Card>
          </div>

          {/* TEAM MEMBERS TABLE */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold tracking-tight">
                Team Members
              </h2>
              <span className="text-sm text-muted-foreground">
                {project.assignees.length} members
              </span>
            </div>

            {project.assignees.length > 0 ? (
              <div className="overflow-hidden rounded-lg border bg-card">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr className="border-b">
                      <th className="p-3 text-left font-medium">Member</th>
                      <th className="p-3 text-left font-medium">Email</th>
                      <th className="p-3 text-left font-medium">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedAssignees.map((assignee) => {
                      const canOpen = isAdmin || assignee.id === loggedInUserId;

                      return (
                        <tr
                          key={assignee.id}
                          className={`
                            border-b transition 
                            ${
                              canOpen
                                ? "cursor-pointer"
                                : "opacity-70 cursor-not-allowed"
                            }
                            ${
                              assignee.id === loggedInUserId
                                ? "bg-blue-300"
                                : ""
                            }
                          `}
                          onClick={() => {
                            if (!canOpen) {
                              toast.error("You can only view your own details");
                              return;
                            }
                            setSelectedMember(assignee);
                            setPanelOpen(true);
                          }}
                        >
                          <td className="p-3 flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {assignee.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium flex items-center gap-2">
                              {assignee.name}
                              {assignee.id === loggedInUserId && (
                                <Badge variant="secondary">You</Badge>
                              )}
                            </span>
                          </td>

                          <td className="p-3 text-muted-foreground">
                            {assignee.email}
                          </td>

                          <td className="p-3">
                            <Badge variant="outline">{assignee.role}</Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground">
                No team members assigned yet.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* MEMBER DETAILS PANEL */}
      <WeeklyReportSheet
        open={panelOpen}
        onOpenChange={setPanelOpen}
        member={selectedMember}
      />
    </>
  );
}
