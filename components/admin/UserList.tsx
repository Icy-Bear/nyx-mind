"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  MoreHorizontal,
  Search,
  Edit,
  Trash2,
  Shield,
  Mail,
  Calendar,
  Grid,
  List,
  Clock,
} from "lucide-react";
import { SelectUser } from "@/db/schema/auth-schema";
import { deleteUser, updateUserJoinedAt } from "@/actions/users";
import { getErrorDaysCount } from "@/actions/weekly-reports";
import { toast } from "sonner";

interface UserListProps {
  users: SelectUser[];
  currentUserId: string;
}

export default function UserList({ users, currentUserId }: UserListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [deleteConfirm, setDeleteConfirm] = useState<{
    userId: string;
    userName: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editUser, setEditUser] = useState<{
    user: SelectUser;
    joinedAt: Date;
  } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorDays, setErrorDays] = useState<Record<string, number>>({});
  const [errorDaysRefresh, setErrorDaysRefresh] = useState(0);

  // Load error days for all users
  useEffect(() => {
    const loadErrorDays = async () => {
      const days: Record<string, number> = {};
      for (const user of users) {
        try {
          const count = await getErrorDaysCount(user.id, new Date(user.createdAt));
          days[user.id] = count;
        } catch (error) {
          console.error(`Error loading error days for user ${user.id}:`, error);
          days[user.id] = 0; // Default to 0 on error
        }
      }
      setErrorDays(days);
    };

    if (users.length > 0) {
      loadErrorDays();
    }
  }, [users, errorDaysRefresh]);

  // Refresh error days when window gains focus or weekly report is saved
  useEffect(() => {
    const handleFocus = () => {
      setErrorDaysRefresh(prev => prev + 1);
    };

    const handleWeeklyReportSaved = () => {
      setErrorDaysRefresh(prev => prev + 1);
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('weeklyReportSaved', handleWeeklyReportSaved);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('weeklyReportSaved', handleWeeklyReportSaved);
    };
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // ✅ Move current user to top
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (a.id === currentUserId) return -1;
    if (b.id === currentUserId) return 1;
    return 0;
  });

  async function handleDeleteUser(userId: string) {
    try {
      setIsDeleting(true);
      await deleteUser(userId);
      toast.success("User deleted successfully");
      setDeleteConfirm(null);
    } catch {
      toast.error("Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleUpdateJoinedAt() {
    if (!editUser) return;
    try {
      setIsUpdating(true);
      await updateUserJoinedAt(editUser.user.id, editUser.joinedAt);
      toast.success("User joined date updated successfully");
      setEditUser(null);
      // Refresh unfilled days in case joined date changed
      setErrorDaysRefresh(prev => prev + 1);
    } catch {
      toast.error("Failed to update user joined date");
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterRole === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterRole("all")}
                >
                  All
                </Button>
                <Button
                  variant={filterRole === "admin" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterRole("admin")}
                >
                  Admins
                </Button>

                <Button
                  variant={filterRole === "user" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterRole("user")}
                >
                  Users
                </Button>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {sortedUsers.length} user
                {sortedUsers.length !== 1 ? "s" : ""} found
              </div>
              <div className="flex items-center gap-2">
                <div className="flex">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="px-3"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="px-3"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedUsers.map((user) => (
            <Card
              key={user.id}
              className={`hover:shadow-md transition-shadow ${
                user.id === currentUserId ? "ring-2 ring-primary" : ""
              }`}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 sm:h-14 sm:w-14">
                      <AvatarImage
                        src={user.image ?? undefined}
                        alt={user.name}
                      />
                      <AvatarFallback className="text-base sm:text-lg">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-base sm:text-lg truncate flex gap-2 items-center">
                        {user.name}
                        {user.id === currentUserId && (
                          <Badge
                            variant="outline"
                            className="text-xs border-primary text-primary"
                          >
                            You
                          </Badge>
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                     <DropdownMenuContent align="end">
                       <DropdownMenuItem
                         onClick={() =>
                           setEditUser({
                             user,
                             joinedAt: user.createdAt ? new Date(user.createdAt) : new Date(),
                           })
                         }
                       >
                         <Edit className="h-4 w-4 mr-2" />
                         Edit Joined Date
                       </DropdownMenuItem>
                       <DropdownMenuItem
                         onClick={() =>
                           setDeleteConfirm({
                             userId: user.id,
                             userName: user.name,
                           })
                         }
                         className="text-red-600"
                       >
                         <Trash2 className="h-4 w-4 mr-2" />
                         Delete User
                       </DropdownMenuItem>
                     </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={user.role === "admin" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      {user.role}
                    </Badge>
                    {user.emailVerified ? (
                      <Badge
                        variant="outline"
                        className="text-xs border-green-200 text-green-700"
                      >
                        <Mail className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        <Mail className="h-3 w-3 mr-1" />
                        Unverified
                      </Badge>
                    )}
                  </div>

                  {user.createdAt && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-orange-600">
                    <Clock className="h-3 w-3" />
                     <span>
                       {errorDays[user.id] ?? "..."} error days
                     </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {sortedUsers.map((user) => (
            <Card
              key={user.id}
              className={`hover:shadow-md transition-shadow ${
                user.id === currentUserId ? "ring-2 ring-primary" : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                      <AvatarImage
                        src={user.image ?? undefined}
                        alt={user.name}
                      />
                      <AvatarFallback className="text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                        <h3 className="font-semibold text-sm sm:text-base truncate flex items-center gap-2">
                          {user.name}
                          {user.id === currentUserId && (
                            <Badge
                              variant="outline"
                              className="text-xs border-primary text-primary"
                            >
                              You
                            </Badge>
                          )}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Badge
                          variant={
                            user.role === "admin" ? "default" : "secondary"
                          }
                          className="text-xs"
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          {user.role}
                        </Badge>
                        {user.emailVerified ? (
                          <Badge
                            variant="outline"
                            className="text-xs border-green-200 text-green-700"
                          >
                            <Mail className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            <Mail className="h-3 w-3 mr-1" />
                            Unverified
                          </Badge>
                        )}
                        {user.createdAt && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        )}
                        <span className="text-xs text-orange-600 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                           {errorDays[user.id] ?? "..."} errors
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                     <Button
                       variant="outline"
                       size="sm"
                       className="hidden sm:flex"
                       onClick={() =>
                         setEditUser({
                           user,
                           joinedAt: user.createdAt ? new Date(user.createdAt) : new Date(),
                         })
                       }
                     >
                       <Edit className="h-3 w-3 mr-1" />
                       Edit
                     </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            setDeleteConfirm({
                              userId: user.id,
                              userName: user.name,
                            })
                          }
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {sortedUsers.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-3">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No users found</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterRole !== "all"
                  ? "Try adjusting your search or filters"
                  : "No users have been created yet"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      {sortedUsers.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Showing {sortedUsers.length} of {users.length} users •{" "}
          {viewMode === "grid" ? "Grid" : "List"} view
        </div>
      )}

      {/* Edit User Dialog */}
      <Dialog
        open={!!editUser}
        onOpenChange={() => setEditUser(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Joined Date</DialogTitle>
            <DialogDescription>
              Update the joined date for <strong>{editUser?.user.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Joined Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !editUser?.joinedAt && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {editUser?.joinedAt ? format(editUser.joinedAt, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={editUser?.joinedAt}
                    onSelect={(date) => {
                      if (date && editUser) {
                        setEditUser({ ...editUser, joinedAt: date });
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditUser(null)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateJoinedAt}
              disabled={isUpdating}
            >
              {isUpdating ? "Updating..." : "Update Date"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deleteConfirm?.userName}</strong>? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deleteConfirm && handleDeleteUser(deleteConfirm.userId)
              }
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
