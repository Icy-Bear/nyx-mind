"use client";

import { useState, useMemo } from "react";
import { AddUser } from "@/components/create-user";
import UserList from "@/components/admin/UserList";
import { UserCard } from "@/components/admin/UserCard";
import { ViewToggle } from "@/components/admin/ViewToggle";
import { SearchAndFilter } from "@/components/admin/SearchAndFilter";
import { Users, Shield, UserCheck } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt?: Date;
}

interface UsersPageProps {
  users: User[];
}

type ViewMode = "grid" | "list";

export function UsersPage({ users: initialUsers }: UsersPageProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");

  // Filter and search users
  const filteredUsers = useMemo(() => {
    return initialUsers.filter((user) => {
      // Search filter
      const matchesSearch = 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      // Role filter
      const matchesRole = roleFilter === "all" || user.role === roleFilter;

      // Verification filter
      const matchesVerification = 
        verificationFilter === "all" ||
        (verificationFilter === "verified" && user.emailVerified) ||
        (verificationFilter === "unverified" && !user.emailVerified);

      return matchesSearch && matchesRole && matchesVerification;
    });
  }, [initialUsers, searchTerm, roleFilter, verificationFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = initialUsers.length;
    const admins = initialUsers.filter(u => u.role === "ADMIN").length;
    const members = initialUsers.filter(u => u.role === "MEMBER").length;
    const verified = initialUsers.filter(u => u.emailVerified).length;

    return { total, admins, members, verified };
  }, [initialUsers]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                User Management
              </h1>
              <p className="text-gray-600 mt-2">
                Manage system users, roles, and permissions
              </p>
            </div>
            <AddUser />
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Admins</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.admins}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <UserCheck className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Members</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.members}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <UserCheck className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Verified</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.verified}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 max-w-2xl">
              <SearchAndFilter
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                roleFilter={roleFilter}
                onRoleFilterChange={setRoleFilter}
                verificationFilter={verificationFilter}
                onVerificationFilterChange={setVerificationFilter}
              />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                {filteredUsers.length} of {initialUsers.length} users
              </div>
              <ViewToggle
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            </div>
          </div>
        </div>

        {/* Users Display */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
              {filteredUsers.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
          ) : (
            <div className="p-6">
              <UserList users={filteredUsers} />
            </div>
          )}
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12">
            <div className="text-center">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No users found
              </h3>
              <p className="text-gray-500">
                {searchTerm || roleFilter !== "all" || verificationFilter !== "all"
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "No users have been created yet."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UsersPage;