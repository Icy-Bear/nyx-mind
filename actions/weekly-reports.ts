"use server";

import { db } from "@/db/drizzle";
import {
  weeklyReports,
  dailyTimeEntries,
} from "@/db/schema/weekly-report-schema";
import { projects } from "@/db/schema/project-schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

// Helper to convert day keys to day numbers (Monday = 1, Sunday = 0)
const DAY_MAPPING = {
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
  sun: 0,
};

export async function saveWeeklyReport(data: {
  weekStartDate: Date;
  hours: Record<string, number>;
  projects: Record<string, string>;
  descriptions: Record<string, string>;
  projectId?: string;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("You must be logged in to perform this action.");
    }

    const userId = session.user.id;

    // Check if weekly report already exists
    const existingReport = await db
      .select()
      .from(weeklyReports)
      .where(
        and(
          eq(weeklyReports.userId, userId),
          eq(
            weeklyReports.weekStartDate,
            data.weekStartDate.toISOString().split("T")[0]
          ),
          data.projectId ? eq(weeklyReports.projectId, data.projectId) : sql`${weeklyReports.projectId} IS NULL`
        )
      )
      .limit(1);

    let weeklyReportId: string;

    if (existingReport.length > 0) {
      // Update existing report
      weeklyReportId = existingReport[0].id;
      await db
        .update(weeklyReports)
        .set({ updatedAt: new Date() })
        .where(eq(weeklyReports.id, weeklyReportId));
    } else {
      // Create new report
      const newReport = await db
        .insert(weeklyReports)
        .values({
          userId,
          weekStartDate: data.weekStartDate.toISOString().split("T")[0],
          projectId: data.projectId,
        })
        .returning({ id: weeklyReports.id });

      weeklyReportId = newReport[0].id;
    }

    // Upsert daily entries
    const dailyEntries = Object.entries(data.hours).map(([dayKey, hours]) => ({
      weeklyReportId,
      dayOfWeek: DAY_MAPPING[dayKey as keyof typeof DAY_MAPPING],
      hours: hours.toFixed(2),
      projectName: data.projects[dayKey] || "",
      description: data.descriptions[dayKey] || "",
    }));

    // Delete existing entries and insert new ones
    await db
      .delete(dailyTimeEntries)
      .where(eq(dailyTimeEntries.weeklyReportId, weeklyReportId));

    if (dailyEntries.length > 0) {
      await db.insert(dailyTimeEntries).values(dailyEntries);
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/users");

    return { success: true, weeklyReportId };
  } catch (error) {
    console.error("Error saving weekly report:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to save weekly report");
  }
}

export async function getWeeklyReport(weekStartDate: Date, userId?: string, currentProjectId?: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Unauthorized");
    }

    const currentUserId = userId || session.user.id;
    const isAdmin = session.user.role === "admin";

    // If viewing another user's report, must be admin
    if (userId && userId !== session.user.id && !isAdmin) {
      throw new Error("You do not have permission to view other users' reports.");
    }

    // Get the weekly report
    const reportData = await db
      .select()
      .from(weeklyReports)
      .where(
        and(
          eq(weeklyReports.userId, currentUserId),
          eq(
            weeklyReports.weekStartDate,
            weekStartDate.toISOString().split("T")[0]
          ),
          currentProjectId ? eq(weeklyReports.projectId, currentProjectId) : sql`${weeklyReports.projectId} IS NULL`
        )
      )
      .limit(1);

    if (reportData.length === 0) {
      return null; // No report found
    }

    const report = reportData[0];

    // Get daily entries
    const entries = await db
      .select()
      .from(dailyTimeEntries)
      .where(
        currentProjectId
          ? and(
            eq(dailyTimeEntries.weeklyReportId, report.id),
            eq(dailyTimeEntries.projectName, currentProjectId)
          )
          : eq(dailyTimeEntries.weeklyReportId, report.id)
      )
      .orderBy(dailyTimeEntries.dayOfWeek);

    // Convert back to the format expected by the component
    const hours: Record<string, number> = {};
    const projects: Record<string, string> = {};
    const descriptions: Record<string, string> = {};

    // Initialize with defaults
    Object.keys(DAY_MAPPING).forEach((dayKey) => {
      hours[dayKey] = 0;
      projects[dayKey] = "none"; // Default project
      descriptions[dayKey] = "";
    });

    // Fill in actual data
    entries.forEach((entry) => {
      const dayKey = Object.keys(DAY_MAPPING).find(
        (key) =>
          DAY_MAPPING[key as keyof typeof DAY_MAPPING] === entry.dayOfWeek
      );
      if (dayKey) {
        hours[dayKey] = parseFloat(entry.hours);
        projects[dayKey] = entry.projectName || "none"; // Convert empty string to "none"
        descriptions[dayKey] = entry.description || "";
      }
    });

    return {
      id: report.id,
      weekStartDate: report.weekStartDate,
      targetHours: parseFloat(report.targetHours),
      hours,
      projects,
      descriptions,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      entries,
    };
  } catch (error) {
    console.error("Error fetching weekly report:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch weekly report");
  }
}

export async function saveDailyEntry(data: {
  weekStartDate: Date;
  dayOfWeek: number;
  hours: number;
  projectName: string;
  description: string;
  currentProjectId?: string;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    // Check if weekly report exists, create if not
    const weeklyReport = await db
      .select()
      .from(weeklyReports)
      .where(
        and(
          eq(weeklyReports.userId, userId),
          eq(
            weeklyReports.weekStartDate,
            data.weekStartDate.toISOString().split("T")[0]
          ),
          data.currentProjectId ? eq(weeklyReports.projectId, data.currentProjectId) : sql`${weeklyReports.projectId} IS NULL`
        )
      )
      .limit(1);

    let weeklyReportId: string;

    if (weeklyReport.length === 0) {
      // Create new weekly report
      const newReport = await db
        .insert(weeklyReports)
        .values({
          userId,
          weekStartDate: data.weekStartDate.toISOString().split("T")[0],
          projectId: data.currentProjectId,
        })
        .returning({ id: weeklyReports.id });

      weeklyReportId = newReport[0].id;
    } else {
      weeklyReportId = weeklyReport[0].id;
    }

    // Use currentProjectId if provided, otherwise use projectName from data
    const finalProjectName = data.currentProjectId || data.projectName;

    // Upsert the daily entry
    await db
      .insert(dailyTimeEntries)
      .values({
        weeklyReportId,
        dayOfWeek: data.dayOfWeek,
        hours: data.hours.toFixed(2),
        projectName: finalProjectName,
        description: data.description,
      })
      .onConflictDoUpdate({
        target: [dailyTimeEntries.weeklyReportId, dailyTimeEntries.dayOfWeek, dailyTimeEntries.projectName],
        set: {
          hours: data.hours.toFixed(2),
          projectName: finalProjectName,
          description: data.description,
          updatedAt: new Date(),
        },
      });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/users");

    return { success: true, weeklyReportId };
  } catch (error) {
    console.error("Error saving daily entry:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to save daily entry");
  }
}

export async function getUserWeeklyReports(userId?: string, limit = 10) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Unauthorized");
    }

    const currentUserId = userId || session.user.id;

    const reports = await db
      .select({
        id: weeklyReports.id,
        weekStartDate: weeklyReports.weekStartDate,
        createdAt: weeklyReports.createdAt,
        updatedAt: weeklyReports.updatedAt,
        projectId: weeklyReports.projectId,
        projectName: projects.projectName,
        totalHours: sql<number>`COALESCE(SUM(CAST(${dailyTimeEntries.hours} AS DECIMAL)), 0)`,
        entryCount: sql<number>`COUNT(${dailyTimeEntries.id})`,
      })
      .from(weeklyReports)
      .leftJoin(
        dailyTimeEntries,
        eq(weeklyReports.id, dailyTimeEntries.weeklyReportId)
      )
      .leftJoin(
        projects,
        eq(weeklyReports.projectId, projects.id)
      )
      .where(eq(weeklyReports.userId, currentUserId))
      .groupBy(weeklyReports.id, projects.projectName)
      .orderBy(desc(weeklyReports.weekStartDate))
      .limit(limit);

    return reports;
  } catch (error) {
    console.error("Error fetching user weekly reports:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch weekly reports");
  }
}

export async function getUnfilledDaysCount(userId: string, createdAt: Date) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Unauthorized");
    }

    // Only admins can view other users' unfilled days, or users can view their own
    if (session.user.id !== userId && session.user.role !== "admin") {
      throw new Error("Access denied");
    }

    // Get all dates with time entries for this user
    const entries = await db
      .select({
        date: sql`DATE(${dailyTimeEntries.createdAt})`,
      })
      .from(dailyTimeEntries)
      .innerJoin(
        weeklyReports,
        eq(dailyTimeEntries.weeklyReportId, weeklyReports.id)
      )
      .where(eq(weeklyReports.userId, userId))
      .groupBy(sql`DATE(${dailyTimeEntries.createdAt})`);

    const filledDates = new Set(entries.map((e) => e.date as string));

    // Calculate total days from created_at to today
    const today = new Date();
    const startDate = new Date(createdAt);
    startDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    let totalDays = 0;
    let filledDays = 0;

    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      totalDays++;
      const dateStr = d.toISOString().split("T")[0];
      if (filledDates.has(dateStr)) {
        filledDays++;
      }
    }

    return totalDays - filledDays;
  } catch (error) {
    console.error("Error calculating unfilled days:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to calculate unfilled days");
  }
}

export async function setTargetHours(data: {
  userId: string;
  weekStartDate: Date;
  targetHours: number;
  projectId?: string;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Unauthorized");
    }

    // Only admins can set target hours
    if (session.user.role !== "admin") {
      throw new Error("You do not have permission to set target hours. Admin access is required.");
    }

    // Check if weekly report exists
    const existingReport = await db
      .select()
      .from(weeklyReports)
      .where(
        and(
          eq(weeklyReports.userId, data.userId),
          eq(
            weeklyReports.weekStartDate,
            data.weekStartDate.toISOString().split("T")[0]
          ),
          data.projectId ? eq(weeklyReports.projectId, data.projectId) : sql`${weeklyReports.projectId} IS NULL`
        )
      )
      .limit(1);

    if (existingReport.length > 0) {
      // Update existing report
      await db
        .update(weeklyReports)
        .set({
          targetHours: data.targetHours.toFixed(2),
          updatedAt: new Date()
        })
        .where(eq(weeklyReports.id, existingReport[0].id));
    } else {
      // Create new report with target hours
      await db.insert(weeklyReports).values({
        userId: data.userId,
        weekStartDate: data.weekStartDate.toISOString().split("T")[0],
        targetHours: data.targetHours.toFixed(2),
        projectId: data.projectId,
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/users");

    return { success: true };
  } catch (error) {
    console.error("Error setting target hours:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to set target hours");
  }
}

export async function getUserTargetHours(userId: string, weekStartDate?: Date, projectId?: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Unauthorized");
    }

    // Only admins can view target hours
    if (session.user.role !== "admin") {
      throw new Error("You do not have permission to view target hours. Admin access is required.");
    }

    const whereConditions = [eq(weeklyReports.userId, userId)];

    if (weekStartDate) {
      whereConditions.push(
        eq(
          weeklyReports.weekStartDate,
          weekStartDate.toISOString().split("T")[0]
        )
      );
    }

    if (projectId) {
      whereConditions.push(eq(weeklyReports.projectId, projectId));
    } else {
      whereConditions.push(sql`${weeklyReports.projectId} IS NULL`);
    }

    const results = await db
      .select({
        weekStartDate: weeklyReports.weekStartDate,
        targetHours: weeklyReports.targetHours,
        createdAt: weeklyReports.createdAt,
        updatedAt: weeklyReports.updatedAt,
      })
      .from(weeklyReports)
      .where(and(...whereConditions))
      .orderBy(desc(weeklyReports.weekStartDate))
      .limit(10);

    return results.map(result => ({
      ...result,
      targetHours: parseFloat(result.targetHours),
    }));
  } catch (error) {
    console.error("Error fetching user target hours:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch target hours");
  }
}

export async function getUserWeeklyProgress(userId: string, weekStartDate?: Date, projectId?: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Unauthorized");
    }

    // Only admins can view other users' progress, but users can view their own
    if (session.user.role !== "admin" && session.user.id !== userId) {
      throw new Error("You do not have permission to view this user's progress.");
    }

    const targetDate = weekStartDate || getWeekStart(new Date());
    const weekStartStr = targetDate.toISOString().split("T")[0];

    // Get target hours for the week
    const targetReport = await db
      .select({
        targetHours: weeklyReports.targetHours,
        id: weeklyReports.id,
      })
      .from(weeklyReports)
      .where(
        and(
          eq(weeklyReports.userId, userId),
          eq(weeklyReports.weekStartDate, weekStartStr),
          projectId ? eq(weeklyReports.projectId, projectId) : sql`${weeklyReports.projectId} IS NULL`
        )
      )
      .limit(1);

    const targetHours = targetReport.length > 0 ? parseFloat(targetReport[0].targetHours) : 40;
    const reportId = targetReport.length > 0 ? targetReport[0].id : null;

    // Get actual hours worked for the week
    let actualHours = 0;

    if (reportId) {
      const actualHoursResult = await db
        .select({
          totalHours: sql<number>`COALESCE(SUM(CAST(${dailyTimeEntries.hours} AS DECIMAL)), 0)`,
        })
        .from(dailyTimeEntries)
        .where(eq(dailyTimeEntries.weeklyReportId, reportId))
        .limit(1);

      actualHours = Number(actualHoursResult[0]?.totalHours || 0);
    } else if (!projectId) {
      // Fallback for legacy data or cross-project view if we want to support it later, 
      // but for now we stick to strict isolation.
      // If no report exists for this project/week, actual hours is 0.
      actualHours = 0;
    }

    return {
      targetHours,
      actualHours,
      progressPercentage: targetHours > 0 ? Math.min((actualHours / targetHours) * 100, 100) : 0,
      weekStartDate: weekStartStr,
    };
  } catch (error) {
    console.error("Error fetching user weekly progress:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch user weekly progress");
  }
}

export async function getUserTotalHours(userId: string, projectId?: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Unauthorized");
    }

    // Only admins can view other users' total hours, but users can view their own
    if (session.user.role !== "admin" && session.user.id !== userId) {
      throw new Error("You do not have permission to view this user's total hours.");
    }

    // Get total hours worked across all time
    const totalHoursResult = await db
      .select({
        totalHours: sql<number>`COALESCE(SUM(CAST(${dailyTimeEntries.hours} AS DECIMAL)), 0)`,
      })
      .from(weeklyReports)
      .leftJoin(
        dailyTimeEntries,
        eq(weeklyReports.id, dailyTimeEntries.weeklyReportId)
      )
      .where(
        and(
          eq(weeklyReports.userId, userId),
          projectId ? eq(weeklyReports.projectId, projectId) : undefined
        )
      )
      .limit(1);

    return Number(totalHoursResult[0]?.totalHours || 0);
  } catch (error) {
    console.error("Error fetching user total hours:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch user total hours");
  }
}

export async function getUserWeeklyBreakdown(userId: string, weeksCount: number = 12, projectId?: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Unauthorized");
    }

    // Only admins can view other users' weekly breakdown, but users can view their own
    if (session.user.role !== "admin" && session.user.id !== userId) {
      throw new Error("You do not have permission to view this user's weekly breakdown.");
    }

    // Get weekly reports for the last N weeks
    const weeklyData = await db
      .select({
        weekStartDate: weeklyReports.weekStartDate,
        targetHours: weeklyReports.targetHours,
        actualHours: sql<number>`COALESCE(SUM(CAST(${dailyTimeEntries.hours} AS DECIMAL)), 0)`,
        projectName: projects.projectName,
      })
      .from(weeklyReports)
      .leftJoin(
        dailyTimeEntries,
        eq(weeklyReports.id, dailyTimeEntries.weeklyReportId)
      )
      .leftJoin(
        projects,
        eq(weeklyReports.projectId, projects.id)
      )
      .where(
        and(
          eq(weeklyReports.userId, userId),
          projectId ? eq(weeklyReports.projectId, projectId) : undefined
        )
      )
      .groupBy(weeklyReports.weekStartDate, weeklyReports.targetHours, projects.projectName)
      .orderBy(desc(weeklyReports.weekStartDate))
      .limit(weeksCount);

    return weeklyData.map(week => {
      const targetHours = parseFloat(week.targetHours);
      const actualHours = Number(week.actualHours);
      return {
        weekStartDate: week.weekStartDate,
        targetHours,
        actualHours,
        progressPercentage: targetHours > 0 ? Math.min((actualHours / targetHours) * 100, 100) : 0,
        projectName: week.projectName,
      };
    });
  } catch (error) {
    console.error("Error fetching user weekly breakdown:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch user weekly breakdown");
  }
}

// Helper function to get week start date (Monday)
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
}


