"use client";

import React from "react";
import TaskCard from "./TaskCard";

type TaskStatus = "Pending" | "In Progress" | "Completed";
type TaskPriority = "Low" | "Medium" | "High";
type ViewMode = "grid" | "list";

interface User {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

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

interface TaskListProps {
  tasks: Task[];
  users: User[];
  viewMode: ViewMode;
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

export default function TaskList({ tasks, users, viewMode }: TaskListProps) {
  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} users={users} />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 font-medium text-foreground">
                Task
              </th>
              <th className="text-left p-4 font-medium text-foreground">
                Assignee
              </th>
              <th className="text-left p-4 font-medium text-foreground">
                Status
              </th>
              <th className="text-left p-4 font-medium text-foreground">
                Priority
              </th>
              <th className="text-left p-4 font-medium text-foreground">
                Due Date
              </th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, index) => {
              const assignee = users.find((u) => u.id === task.assigneeName);
              return (
                <tr
                  key={task.id}
                  className={`border-t border-border hover:bg-muted/30 transition-colors ${
                    index % 2 === 0 ? "" : "bg-muted/10"
                  }`}
                >
                  <td className="p-4">
                    <div>
                      <h4 className="font-medium text-foreground">
                        {task.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {task.description}
                      </p>
                    </div>
                  </td>
                  <td className="p-4">
                    {assignee ? (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                          {getUserInitials(assignee.name)}
                        </div>
                        <span className="text-sm text-foreground">
                          {assignee.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                        task.status
                      )}`}
                    >
                      {task.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-sm font-medium ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {task.dueDate}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}