"use server";

import { Task } from "@/app/dashboard/tasks/page";

// Mock data for demonstration - replace with actual database queries
const mockTasks: Task[] = [
  {
    id: "1",
    title: "Design new landing page",
    description: "Create a modern, responsive landing page design for the new product launch",
    status: "In Progress",
    priority: "High",
    assigneeName: "u2",
    dueDate: "2024-12-15",
    createdAt: "2024-11-01"
  },
  {
    id: "2",
    title: "Implement user authentication",
    description: "Add secure login and registration functionality with JWT tokens",
    status: "Pending",
    priority: "High",
    assigneeName: "u1",
    dueDate: "2024-12-20",
    createdAt: "2024-11-02"
  },
  {
    id: "3",
    title: "Database optimization",
    description: "Optimize database queries and add proper indexing for better performance",
    status: "Completed",
    priority: "Medium",
    assigneeName: "u4",
    dueDate: "2024-12-10",
    createdAt: "2024-11-03"
  },
  {
    id: "4",
    title: "Write API documentation",
    description: "Create comprehensive documentation for all REST API endpoints",
    status: "In Progress",
    priority: "Low",
    assigneeName: "u3",
    dueDate: "2024-12-25",
    createdAt: "2024-11-04"
  },
  {
    id: "5",
    title: "Mobile app testing",
    description: "Test the mobile application on various devices and screen sizes",
    status: "Pending",
    priority: "Medium",
    assigneeName: "u5",
    dueDate: "2024-12-18",
    createdAt: "2024-11-05"
  },
  {
    id: "6",
    title: "Security audit",
    description: "Conduct a thorough security audit of the application and fix vulnerabilities",
    status: "Pending",
    priority: "High",
    assigneeName: null,
    dueDate: "2024-12-22",
    createdAt: "2024-11-06"
  },
  {
    id: "7",
    title: "Performance monitoring setup",
    description: "Set up application performance monitoring and alerting system",
    status: "Completed",
    priority: "Medium",
    assigneeName: "u1",
    dueDate: "2024-12-08",
    createdAt: "2024-11-07"
  },
  {
    id: "8",
    title: "User feedback integration",
    description: "Implement user feedback collection and analysis system",
    status: "In Progress",
    priority: "Low",
    assigneeName: "u2",
    dueDate: "2024-12-28",
    createdAt: "2024-11-08"
  }
];

export async function getTasks(): Promise<Task[]> {
  try {
    // Simulate database delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return mockTasks;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw new Error("Failed to fetch tasks");
  }
}