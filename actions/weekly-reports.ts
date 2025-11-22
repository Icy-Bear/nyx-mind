"use server";

import { db } from "@/db/drizzle";
import { weeklyReports, dailyTimeEntries } from "@/db/schema/weekly-report-schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

// Helper to convert day keys to day numbers (Monday = 1, Sunday = 0)
const DAY_MAPPING = {
  mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6, sun: 0
};

export async function saveWeeklyReport(data: {
  weekStartDate: Date;
  hours: Record<string, number>;
  projects: Record<string, string>;
  descriptions: Record<string, string>;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    // Check if weekly report already exists
    const existingReport = await db
      .select()
      .from(weeklyReports)
      .where(
        and(
          eq(weeklyReports.userId, userId),
          eq(weeklyReports.weekStartDate, data.weekStartDate.toISOString().split('T')[0])
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
          weekStartDate: data.weekStartDate.toISOString().split('T')[0],
        })
        .returning({ id: weeklyReports.id });

      weeklyReportId = newReport[0].id;
    }

    // Upsert daily entries
    const dailyEntries = Object.entries(data.hours).map(([dayKey, hours]) => ({
      weeklyReportId,
      dayOfWeek: DAY_MAPPING[dayKey as keyof typeof DAY_MAPPING],
      hours: hours.toString(),
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

    return { success: true, weeklyReportId };
  } catch (error) {
    console.error("Error saving weekly report:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to save weekly report");
  }
}

export async function getWeeklyReport(weekStartDate: Date, userId?: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Unauthorized");
    }

    const currentUserId = userId || session.user.id;

    // Get the weekly report
    const reportData = await db
      .select()
      .from(weeklyReports)
      .where(
        and(
          eq(weeklyReports.userId, currentUserId),
          eq(weeklyReports.weekStartDate, weekStartDate.toISOString().split('T')[0])
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
      .where(eq(dailyTimeEntries.weeklyReportId, report.id))
      .orderBy(dailyTimeEntries.dayOfWeek);

    // Convert back to the format expected by the component
    const hours: Record<string, number> = {};
    const projects: Record<string, string> = {};
    const descriptions: Record<string, string> = {};

    // Initialize with defaults
    Object.keys(DAY_MAPPING).forEach(dayKey => {
      hours[dayKey] = 0;
      projects[dayKey] = "nivaas"; // Default project
      descriptions[dayKey] = "";
    });

    // Fill in actual data
    entries.forEach(entry => {
      const dayKey = Object.keys(DAY_MAPPING).find(
        key => DAY_MAPPING[key as keyof typeof DAY_MAPPING] === entry.dayOfWeek
      );
      if (dayKey) {
        hours[dayKey] = parseFloat(entry.hours);
        projects[dayKey] = entry.projectName;
        descriptions[dayKey] = entry.description || "";
      }
    });

    return {
      id: report.id,
      weekStartDate: report.weekStartDate,
      hours,
      projects,
      descriptions,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
    };
  } catch (error) {
    console.error("Error fetching weekly report:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch weekly report");
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
        totalHours: sql<number>`COALESCE(SUM(CAST(${dailyTimeEntries.hours} AS DECIMAL)), 0)`,
        entryCount: sql<number>`COUNT(${dailyTimeEntries.id})`,
      })
      .from(weeklyReports)
      .leftJoin(
        dailyTimeEntries,
        eq(weeklyReports.id, dailyTimeEntries.weeklyReportId)
      )
      .where(eq(weeklyReports.userId, currentUserId))
      .groupBy(weeklyReports.id)
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