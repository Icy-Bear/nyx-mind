"use server";

import { db } from "@/db/drizzle";
import { projects, projectAssignees } from "@/db/schema/project-schema";
import { user } from "@/db/schema/auth-schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function createProject(data: {
  projectName: string;
  summary?: string;
  plannedStart?: Date;
  plannedEnd?: Date;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
      throw new Error("Unauthorized - Admin access required");
    }

    const projectId = crypto.randomUUID();

    await db.insert(projects).values({
      id: projectId,
      projectName: data.projectName,
      summary: data.summary,
      plannedStart: data.plannedStart,
      plannedEnd: data.plannedEnd,
    });

    revalidatePath("/dashboard");

    return { success: true, projectId };
  } catch (error) {
    console.error("Error creating project:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to create project");
  }
}

export async function getProjects(userId?: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Unauthorized");
    }

    const currentUserId = userId || session.user.id;
    const isAdmin = session.user.role === "admin";

    let query;

    if (isAdmin) {
      // Admin sees all projects
      query = db
        .select({
          id: projects.id,
          projectName: projects.projectName,
          summary: projects.summary,
          plannedStart: projects.plannedStart,
          plannedEnd: projects.plannedEnd,
          percentComplete: projects.percentComplete,
          createdAt: projects.createdAt,
        })
        .from(projects);
    } else {
      // Regular users see only assigned projects
      query = db
        .select({
          id: projects.id,
          projectName: projects.projectName,
          summary: projects.summary,
          plannedStart: projects.plannedStart,
          plannedEnd: projects.plannedEnd,
          percentComplete: projects.percentComplete,
          createdAt: projects.createdAt,
        })
        .from(projects)
        .innerJoin(
          projectAssignees,
          eq(projects.id, projectAssignees.projectId)
        )
        .where(eq(projectAssignees.userId, currentUserId));
    }

    const result = await query;

    return result;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw new Error("Failed to fetch projects");
  }
}

export async function getProjectDetails(projectId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Unauthorized");
    }

    const isAdmin = session.user.role === "admin";

    // Get project info
    const projectData = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (projectData.length === 0) {
      throw new Error("Project not found");
    }

    const project = projectData[0];

    // Check if user has access (admin or assigned)
    if (!isAdmin) {
      const assignment = await db
        .select()
        .from(projectAssignees)
        .where(
          and(
            eq(projectAssignees.projectId, projectId),
            eq(projectAssignees.userId, session.user.id)
          )
        )
        .limit(1);

      if (assignment.length === 0) {
        throw new Error("Access denied - not assigned to this project");
      }
    }

    // Get assigned users
    const assignees = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      })
      .from(projectAssignees)
      .innerJoin(user, eq(projectAssignees.userId, user.id))
      .where(eq(projectAssignees.projectId, projectId));

    return {
      ...project,
      assignees,
    };
  } catch (error) {
    console.error("Error fetching project details:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch project details");
  }
}

export async function assignUsersToProject(
  projectId: string,
  userIds: string[]
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
      throw new Error("Unauthorized - Admin access required");
    }

    // Remove existing assignments
    await db
      .delete(projectAssignees)
      .where(eq(projectAssignees.projectId, projectId));

    // Add new assignments
    if (userIds.length > 0) {
      const assignments = userIds.map((userId) => ({
        id: crypto.randomUUID(),
        projectId,
        userId,
      }));

      await db.insert(projectAssignees).values(assignments);
    }

    revalidatePath(`/dashboard/${projectId}`);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error assigning users to project:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to assign users to project");
  }
}

export async function getAllUsers() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
      throw new Error("Unauthorized - Admin access required");
    }

    const users = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      })
      .from(user)
      .where(eq(user.banned, false));

    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }
}
