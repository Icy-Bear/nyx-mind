"use client";

import { getTasks } from "@/actions/tasks";
import TaskFilters from "@/components/dashboard/TaskFilters";
import TaskList from "@/components/dashboard/TaskList";
import React, { useState, useMemo, useEffect } from "react";

type TaskStatus = "Pending" | "In Progress" | "Completed";
type TaskPriority = "Low" | "Medium" | "High";
type ViewMode = "grid" | "list";

export interface Task {
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
}

export default function TasksPage() {
  const users: User[] = [
    { id: "u1", name: "Aarav Sharma", role: "Developer" },
    { id: "u2", name: "Sofia Patel", role: "Designer" },
    { id: "u3", name: "Rohan Gupta", role: "Manager" },
    { id: "u4", name: "Priya Singh", role: "Developer" },
    { id: "u5", name: "Karan Verma", role: "Designer" },
  ];

  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskView, setTaskView] = useState<ViewMode>("grid");
  const [taskSearch, setTaskSearch] = useState("");
  const [taskFilter, setTaskFilter] = useState<TaskStatus | "All">("All");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("All");

  useEffect(() => {
    async function fetchData() {
      const data = await getTasks();
      setTasks(data);
    }
    fetchData();
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
        task.description.toLowerCase().includes(taskSearch.toLowerCase());

      const matchesStatus = taskFilter === "All" || task.status === taskFilter;

      const matchesAssignee =
        assigneeFilter === "All" || task.assigneeName === assigneeFilter;

      return matchesSearch && matchesStatus && matchesAssignee;
    });
  }, [tasks, taskSearch, taskFilter, assigneeFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Task Management</h2>
          <p className="text-gray-600 mt-1">Track and manage project tasks</p>
        </div>

        <TaskFilters
          taskSearch={taskSearch}
          onTaskSearchChange={setTaskSearch}
          taskFilter={taskFilter}
          onTaskFilterChange={setTaskFilter}
          assigneeFilter={assigneeFilter}
          onAssigneeFilterChange={setAssigneeFilter}
          taskView={taskView}
          onTaskViewChange={setTaskView}
          users={users}
        />
      </div>

      <TaskList tasks={filteredTasks} users={users} viewMode={taskView} />
    </div>
  );
}