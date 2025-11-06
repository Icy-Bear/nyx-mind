"use client";

import React from "react";

type TaskStatus = "Pending" | "In Progress" | "Completed";
type ViewMode = "grid" | "list";

interface User {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

interface TaskFiltersProps {
  taskSearch: string;
  onTaskSearchChange: (value: string) => void;
  taskFilter: TaskStatus | "All";
  onTaskFilterChange: (value: TaskStatus | "All") => void;
  assigneeFilter: string;
  onAssigneeFilterChange: (value: string) => void;
  taskView: ViewMode;
  onTaskViewChange: (value: ViewMode) => void;
  users: User[];
}

export default function TaskFilters({
  taskSearch,
  onTaskSearchChange,
  taskFilter,
  onTaskFilterChange,
  assigneeFilter,
  onAssigneeFilterChange,
  taskView,
  onTaskViewChange,
  users,
}: TaskFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search tasks..."
          value={taskSearch}
          onChange={(e) => onTaskSearchChange(e.target.value)}
          className="pl-10 pr-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent w-48 lg:w-64"
        />
        <svg
          className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Status Filter */}
      <select
        value={taskFilter}
        onChange={(e) =>
          onTaskFilterChange(e.target.value as TaskStatus | "All")
        }
        className="px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="All">All Status</option>
        <option value="Pending">Pending</option>
        <option value="In Progress">In Progress</option>
        <option value="Completed">Completed</option>
      </select>

      {/* Assignee Filter */}
      <select
        value={assigneeFilter}
        onChange={(e) => onAssigneeFilterChange(e.target.value)}
        className="px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="All">All Assignees</option>
        <option value="">Unassigned</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>

      {/* View Toggle */}
      <div className="flex border border-border rounded-lg">
        <button
          onClick={() => onTaskViewChange("grid")}
          className={`px-3 py-2 ${
            taskView === "grid"
              ? "bg-primary text-primary-foreground"
              : "bg-background text-foreground"
          } transition-colors`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
        </button>
        <button
          onClick={() => onTaskViewChange("list")}
          className={`px-3 py-2 ${
            taskView === "list"
              ? "bg-primary text-primary-foreground"
              : "bg-background text-foreground"
          } transition-colors`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}