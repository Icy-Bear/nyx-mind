"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";

interface SearchAndFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  roleFilter: string;
  onRoleFilterChange: (role: string) => void;
  verificationFilter: string;
  onVerificationFilterChange: (filter: string) => void;
}

export function SearchAndFilter({
  searchTerm,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  verificationFilter,
  onVerificationFilterChange,
}: SearchAndFilterProps) {
  const [showFilters, setShowFilters] = useState(false);
  const hasActiveFilters = roleFilter !== "all" || verificationFilter !== "all";

  const clearFilters = () => {
    onRoleFilterChange("all");
    onVerificationFilterChange("all");
    onSearchChange("");
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-4 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
        />
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                Active
              </span>
            )}
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-gray-500 hover:text-gray-700 gap-1"
            >
              <X className="h-3 w-3" />
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Role</label>
            <Select value={roleFilter} onValueChange={onRoleFilterChange}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="MEMBER">Member</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Verification Status</label>
            <Select value={verificationFilter} onValueChange={onVerificationFilterChange}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchAndFilter;