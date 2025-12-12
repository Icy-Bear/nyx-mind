"use client";

import { useState, useMemo, useEffect } from "react";
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


import { format } from "date-fns";

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
} from "lucide-react";
import { SelectUser } from "@/db/schema/auth-schema";
import { deleteUser, updateUserJoinedAt } from "@/actions/users";




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
  const [dateInputValue, setDateInputValue] = useState("");

  useEffect(() => {
    if (editUser?.joinedAt) {
      setDateInputValue(format(editUser.joinedAt, "yyyy-MM-dd"));
    }
  }, [editUser?.joinedAt]);

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDateInputValue(value);

    const parsedDate = new Date(value);
    if (!isNaN(parsedDate.getTime()) && editUser) {
      setEditUser({ ...editUser, joinedAt: parsedDate });
    }
  };

  // Memoize users to prevent infinite re-renders
  const memoizedUsers = useMemo(() => users, [users]);







  const filteredUsers = useMemo(() => {
    return memoizedUsers.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === "all" || user.role === filterRole;
      return matchesSearch && matchesRole;
    });
  }, [memoizedUsers, searchTerm, filterRole]);

  // ✅ Move current user to top
  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      if (a.id === currentUserId) return -1;
      if (b.id === currentUserId) return 1;
      return 0;
    });
  }, [filteredUsers, currentUserId]);

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {sortedUsers.map((user) => (
            <Card
              key={user.id}
              className={`hover:shadow-md transition-shadow ${user.id === currentUserId ? "ring-2 ring-primary" : ""
                }`}
            >
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <Avatar className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 flex-shrink-0">
                      <AvatarImage
                        src={user.image ?? undefined}
                        alt={user.name}
                      />
                      <AvatarFallback className="text-sm sm:text-base lg:text-lg">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm sm:text-base lg:text-lg truncate flex gap-2 items-center">
                        {user.name}
                        {user.id === currentUserId && (
                          <Badge
                            variant="outline"
                            className="text-xs border-primary text-primary flex-shrink-0"
                          >
                            You
                          </Badge>
                        )}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
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

                <div className="space-y-2 sm:space-y-3">
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2">
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
                      <Calendar className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}




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
              className={`hover:shadow-md transition-shadow ${user.id === currentUserId ? "ring-2 ring-primary" : ""
                }`}
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
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
                      <div className="flex flex-col gap-1">
                        <h3 className="font-semibold text-sm sm:text-base truncate flex items-center gap-2">
                          {user.name}
                          {user.id === currentUserId && (
                            <Badge
                              variant="outline"
                              className="text-xs border-primary text-primary flex-shrink-0"
                            >
                              You
                            </Badge>
                          )}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-2">
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
                          <span className="text-xs text-muted-foreground flex items-center gap-1 whitespace-nowrap">
                            <Calendar className="h-3 w-3 flex-shrink-0" />
                            {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="hidden sm:flex text-xs px-2 py-1 h-8"
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
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User Joined Date</DialogTitle>
            <DialogDescription>
              Update the joined date for <strong>{editUser?.user.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Joined Date</label>
              <Input
                type="date"
                value={dateInputValue}
                onChange={handleDateInputChange}
                className="w-full"
              />
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
        <DialogContent className="max-h-[90vh] overflow-y-auto">
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
