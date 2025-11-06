"use client";

import React from "react";

type TaskStatus = "Pending" | "In Progress" | "Completed";
type TaskPriority = "Low" | "Medium" | "High";

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeName: string | null;
  dueDate: string;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

interface TaskCardProps {
  task: Task;
  users: User[];
}

const getUserInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

const getStatusColor = (status: TaskStatus) => {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    case "In Progress":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    case "Pending":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
  }
};

const getPriorityColor = (priority: TaskPriority) => {
  switch (priority) {
    case "High":
      return "text-red-600 dark:text-red-400";
    case "Medium":
      return "text-yellow-600 dark:text-yellow-400";
    case "Low":
      return "text-green-600 dark:text-green-400";
  }
};

export default function TaskCard({ task, users }: TaskCardProps) {
  const assignee = users.find((u) => u.id === task.assigneeName);

  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer hover:border-primary/50">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-foreground line-clamp-1">
          {task.title}
        </h3>
        <span
          className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
            task.status
          )}`}
        >
          {task.status}
        </span>
      </div>

      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {task.description}
      </p>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {assignee ? (
            <>
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                {getUserInitials(assignee.name)}
              </div>
              <span className="text-sm text-foreground">{assignee.name}</span>
            </>
          ) : (
            <span className="text-sm text-muted-foreground">Unassigned</span>
          )}
        </div>
        <span
          className={`text-xs font-medium ${getPriorityColor(task.priority)}`}
        >
          {task.priority}
        </span>
      </div>

      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <span>Due: {task.dueDate}</span>
        <span>Created: {task.createdAt}</span>
      </div>
    </div>
  );
}