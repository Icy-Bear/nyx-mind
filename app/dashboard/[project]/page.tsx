"use client";

import {
  getProjectDetails,
  assignUsersToProject,
  getAllUsers,
  deleteProject,
} from "@/actions/projects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import { Edit, UserPlus, Calendar, Users, Trash2 } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useParams, useRouter } from "next/navigation";
import { ProjectWithAssignees, User } from "@/lib/types";

import { StatusEdit } from "@/components/admin/StatusEdit";
import { EditProjectForm } from "@/components/edit-project-form";
import { usePageTitle } from "@/contexts/page-title-context";

import { EnhancedUserCard } from "@/components/admin/EnhancedUserCard";
import { WeeklyReportSheet } from "@/components/WeeklyReportSheet";
import {
  getStatusColor,
  getStatusLabel,
  getStatusDescription,
} from "@/lib/status-utils";

export default function ProjectPage() {
  const [project, setProject] = useState<ProjectWithAssignees | null>(null);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [initialSelectedUsers, setInitialSelectedUsers] = useState<string[]>(
    []
  );
  const [isUpdatingTeam, setIsUpdatingTeam] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isDeletingProject, setIsDeletingProject] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<{
    id: string;
    name: string;
    email: string;
    role: string | null;
    createdAt: Date;
  } | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const handlePanelOpenChange = (open: boolean) => {
    setPanelOpen(open);
  };

  const handleDataSaved = () => {
    // Data saved callback - can be used for other refresh logic if needed
  };



  const handleStatusUpdated = () => {
    // Refresh project data when status is updated
    const loadProject = async () => {
      try {
        const projectData = await getProjectDetails(params.project);
        setProject(projectData);
      } catch (error) {
        toast.error("Failed to load project" + error);
      }
    };
    loadProject();
  };

  const handleProjectUpdated = () => {
    // Refresh project data when project is updated
    const loadProject = async () => {
      try {
        const projectData = await getProjectDetails(params.project);
        setProject(projectData);
      } catch (error) {
        toast.error("Failed to load project" + error);
      }
    };
    loadProject();
    setEditDialogOpen(false);
  };
  const router = useRouter();

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
    if (loading) {
      setTitle(" ");
    } else if (project) {
      setTitle(project.projectName || "Project Details");
    } else {
      setTitle("Project Details");
    }
    return () => setTitle(null);
  }, [project, loading, setTitle]);

  const loadUsers = async () => {
    if (allUsers.length > 0 || isLoadingUsers) return;
    try {
      setIsLoadingUsers(true);
      const users = await getAllUsers();
      setAllUsers(users);
      const initialUsers = project?.assignees.map((a) => a.id) || [];
      setSelectedUsers(initialUsers);
      setInitialSelectedUsers(initialUsers);
    } catch (error) {
      toast.error("Failed to load users: " + error);
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

  const handleAssignUsers = async () => {
    if (!project) return;
    try {
      setIsUpdatingTeam(true);
      await assignUsersToProject(project.id, selectedUsers);
      toast.success("Team members updated successfully");
      const updatedProject = await getProjectDetails(params.project);
      setProject(updatedProject);
      setInitialSelectedUsers(selectedUsers);
    } catch (error) {
      toast.error("Failed to update team members" + error);
    } finally {
      setIsUpdatingTeam(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!project) return;
    try {
      setIsDeletingProject(true);
      await deleteProject(project.id);
      toast.success("Project deleted successfully");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Failed to delete project" + error);
    } finally {
      setIsDeletingProject(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen justify-center items-center">
        <Spinner />
      </div>
    );
  }

  if (!project) {
    router.replace("/dashboard");
    return;
  }

  // --- SORT MEMBERS: Logged-in user first ---
  const sortedAssignees = [...project.assignees].sort((a, b) => {
    if (a.id === loggedInUserId) return -1;
    if (b.id === loggedInUserId) return 1;
    return 0;
  });

  // Check if team members have changed
  const hasTeamChanges =
    JSON.stringify(selectedUsers.sort()) !==
    JSON.stringify(initialSelectedUsers.sort());

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
                <div className="flex gap-2">
                  <Dialog
                    open={editDialogOpen}
                    onOpenChange={setEditDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <Edit className="h-4 w-4" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
                      <DialogTitle>Edit Project</DialogTitle>
                      <DialogDescription>
                        Update project details, dates, and status.
                      </DialogDescription>
                      <div className="flex-1 overflow-y-auto pr-1">
                        {project && (
                          <EditProjectForm
                            project={project}
                            onSuccess={handleProjectUpdated}
                            onCancel={() => setEditDialogOpen(false)}
                          />
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog
                    onOpenChange={async (open) => {
                      if (open) await loadUsers();
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                        <UserPlus className="h-4 w-4" />
                        <span className="hidden sm:inline">Manage Team</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col">
                      <DialogTitle>Manage Team Members</DialogTitle>
                      <DialogDescription>
                        Add or remove team members from this project.
                      </DialogDescription>
                      <div className="flex-1 overflow-y-auto pr-1">
                        <div className="space-y-4">
                          {isLoadingUsers ? (
                            <div className="flex justify-center items-center py-8">
                              <Spinner />
                            </div>
                          ) : (
                            <>
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
                              <Button
                                onClick={handleAssignUsers}
                                className="w-full"
                                disabled={!hasTeamChanges || isUpdatingTeam}
                              >
                                {isUpdatingTeam ? (
                                  <Spinner />
                                ) : (
                                  "Update Team Members"
                                )}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden md:inline">Delete</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete the project &ldquo;{project.projectName}&rdquo;
                          and remove all associated data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteProject}
                          disabled={isDeletingProject}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isDeletingProject ? <Spinner /> : "Delete Project"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
          </div>

          {/* Project Info Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-10">
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
                <CardTitle className="text-sm font-medium">Status</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(project.status)}>
                    {getStatusLabel(project.status)}
                  </Badge>
                  {isAdmin && (
                    <StatusEdit
                      projectId={project.id}
                      currentStatus={project.status ?? "not_started"}
                      onStatusUpdated={handleStatusUpdated}
                    />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {getStatusDescription(project.status)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Start Date
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      Planned
                    </div>
                    <div className="font-bold">
                      {project.plannedStart
                        ? format(project.plannedStart, "MMM dd")
                        : "TBD"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      Actual
                    </div>
                    <div className="font-bold">
                      {project.actualStart
                        ? format(project.actualStart, "MMM dd")
                        : "TBD"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">End Date</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      Planned
                    </div>
                    <div className="font-bold">
                      {project.plannedEnd
                        ? format(project.plannedEnd, "MMM dd")
                        : "TBD"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      Actual
                    </div>
                    <div className="font-bold">
                      {project.actualEnd
                        ? format(project.actualEnd, "MMM dd")
                        : "TBD"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* TEAM MEMBERS CARDS */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold tracking-tight">
                Team Members
              </h2>
              <span className="text-sm text-muted-foreground">
                {project.assignees.length} members
              </span>
            </div>
            {project.assignees.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedAssignees.map((assignee) => {
                  const canOpen = isAdmin || assignee.id === loggedInUserId;

                  return (
                    <EnhancedUserCard
                      key={assignee.id}
                      user={{
                        id: assignee.id,
                        name: assignee.name,
                        email: assignee.email,
                        role: assignee.role || "user",
                        createdAt: assignee.createdAt
                      }}
                      isCurrentUser={assignee.id === loggedInUserId}
                      projectId={project.id}
                      canViewDetails={canOpen}
                      onOpenWeeklyReport={() => {
                        if (!canOpen) {
                          toast.error("You can only view your own details");
                          return;
                        }
                        setSelectedMember(assignee);
                        setPanelOpen(true);
                      }}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No team members</h3>
                <p className="text-muted-foreground">
                  No team members assigned to this project yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MEMBER DETAILS PANEL */}
      <WeeklyReportSheet
        open={panelOpen}
        onOpenChange={handlePanelOpenChange}
        member={selectedMember}
        onDataSaved={handleDataSaved}
        currentProjectId={project?.id}
        currentProjectName={project?.projectName}
      />
    </>
  );
}
