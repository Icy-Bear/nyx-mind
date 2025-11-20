"use server";

import { db } from "@/db/drizzle";
import { user } from "@/db/schema/auth-schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { LEAVE_CONSTANTS } from "@/lib/leave-constants";
import { leaveBalances, leaveRequests } from "@/db/schema/leave-schema";

// Helper function to calculate working days between two dates
function calculateWorkingDays(fromDate: Date, toDate: Date): number {
  let workingDays = 0;
  const currentDate = new Date(fromDate);

  while (currentDate <= toDate) {
    const dayOfWeek = currentDate.getDay();
    // Exclude weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return workingDays;
}

// Helper function to calculate total used CL days
async function getTotalUsedClDays(userId: string): Promise<number> {
  const result = await db
    .select({ total: sql<number>`sum(${leaveRequests.totalDays})` })
    .from(leaveRequests)
    .where(
      and(
        eq(leaveRequests.userId, userId),
        eq(leaveRequests.leaveType, "CL"),
        eq(leaveRequests.status, "Approved")
      )
    );

  return result[0]?.total || 0;
}

// Helper function to calculate CL balance based on continuous accrual
async function calculateClBalance(
  userCreatedAt: Date,
  usedClDays: number
): Promise<number> {
  const daysSinceCreation = Math.floor(
    (new Date().getTime() - userCreatedAt.getTime()) / (1000 * 60 * 60 * 24)
  );
  const totalAccrued =
    daysSinceCreation * LEAVE_CONSTANTS.CL_ACCRUAL_RATE_PER_DAY;
  const currentBalance = Math.max(0, totalAccrued - usedClDays);

  // Round to 2 decimal places
  return Math.round(currentBalance * 100) / 100;
}

// Helper function to check and update leave balances for accruals
async function updateLeaveAccruals(userId: string) {
  const balance = await db
    .select()
    .from(leaveBalances)
    .where(eq(leaveBalances.userId, userId))
    .limit(1);

  if (balance.length === 0) {
    // Initialize balance for new user
    await db.insert(leaveBalances).values({
      id: crypto.randomUUID(),
      userId,
      clBalance: "0", // Start with 0, accrues continuously
      mlBalance: 12, // Initial ML
    });
    return;
  }

  const currentBalance = balance[0];
  const now = new Date();
  let updated = false;

  // CL is now calculated continuously in getLeaveBalance, no need for accrual here

  // Check ML accrual (yearly)
  const lastMlAccrual = new Date(currentBalance.lastMlAccrual);
  const yearsSinceLastAccrual = now.getFullYear() - lastMlAccrual.getFullYear();

  if (yearsSinceLastAccrual > 0) {
    const newMlBalance = currentBalance.mlBalance + yearsSinceLastAccrual * 12;
    await db
      .update(leaveBalances)
      .set({
        mlBalance: newMlBalance,
        lastMlAccrual: now,
        updatedAt: now,
      })
      .where(eq(leaveBalances.userId, userId));
    updated = true;
  }

  if (updated) {
    revalidatePath("/dashboard/leave");
  }
}

export async function getLeaveBalance(userId: string) {
  try {
    // Get user creation date
    const userData = await db
      .select({ createdAt: user.createdAt })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (userData.length === 0) {
      throw new Error("User not found");
    }

    const usedClDays = await getTotalUsedClDays(userId);
    const calculatedClBalance = await calculateClBalance(
      userData[0].createdAt,
      usedClDays
    );

    // Update or create balance record
    await db
      .insert(leaveBalances)
      .values({
        userId,
        clBalance: calculatedClBalance.toString(),
        mlBalance: 12, // Keep ML logic as is
        lastClAccrual: new Date(),
        lastMlAccrual: new Date(),
      })
      .onConflictDoUpdate({
        target: leaveBalances.userId,
        set: {
          clBalance: calculatedClBalance.toString(),
          updatedAt: new Date(),
        },
      });

    const balance = await db
      .select()
      .from(leaveBalances)
      .where(eq(leaveBalances.userId, userId))
      .limit(1);

    return balance[0];
  } catch (error) {
    console.error("Error fetching leave balance:", error);
    throw new Error("Failed to fetch leave balance");
  }
}

export async function getLeaveHistory(userId: string) {
  try {
    const requests = await db
      .select({
        id: leaveRequests.id,
        leaveType: leaveRequests.leaveType,
        fromDate: leaveRequests.fromDate,
        toDate: leaveRequests.toDate,
        totalDays: leaveRequests.totalDays,
        reason: leaveRequests.reason,
        status: leaveRequests.status,
        createdAt: leaveRequests.createdAt,
        approvedBy: leaveRequests.approvedBy,
        approverName: user.name,
      })
      .from(leaveRequests)
      .leftJoin(user, eq(leaveRequests.approvedBy, user.id))
      .where(eq(leaveRequests.userId, userId))
      .orderBy(desc(leaveRequests.createdAt));

    return requests;
  } catch (error) {
    console.error("Error fetching leave history:", error);
    throw new Error("Failed to fetch leave history");
  }
}

export async function applyLeave(data: {
  leaveType: "CL" | "ML";
  fromDate: Date;
  toDate: Date;
  reason: string;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    // Validate dates
    if (data.fromDate > data.toDate) {
      throw new Error("From date cannot be after to date");
    }

    // Calculate working days
    const totalDays = calculateWorkingDays(data.fromDate, data.toDate);

    if (totalDays === 0) {
      throw new Error("No working days in the selected date range");
    }

    // Check balance
    const balance = await getLeaveBalance(userId);
    const requiredBalance =
      data.leaveType === "CL"
        ? parseFloat(balance.clBalance.toString())
        : balance.mlBalance;

    if (requiredBalance < totalDays) {
      const formattedBalance =
        data.leaveType === "CL"
          ? requiredBalance.toFixed(2)
          : requiredBalance.toString();
      throw new Error(
        `Insufficient ${data.leaveType} balance. Available: ${formattedBalance}, Required: ${totalDays}`
      );
    }

    // Create request
    await db.insert(leaveRequests).values({
      userId,
      leaveType: data.leaveType,
      fromDate: data.fromDate.toISOString().split("T")[0], // YYYY-MM-DD
      toDate: data.toDate.toISOString().split("T")[0],
      totalDays,
      reason: data.reason,
    });

    revalidatePath("/dashboard/leave");

    return { success: true };
  } catch (error) {
    console.error("Error applying for leave:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to apply for leave");
  }
}

export async function approveLeave(requestId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const adminId = session.user.id;

    // Get the request
    const request = await db
      .select()
      .from(leaveRequests)
      .where(eq(leaveRequests.id, requestId))
      .limit(1);

    if (request.length === 0) {
      throw new Error("Leave request not found");
    }

    const leaveRequest = request[0];

    if (leaveRequest.status !== "Pending") {
      throw new Error("Request has already been processed");
    }

    // Check balance again (in case it changed)
    const balance = await getLeaveBalance(leaveRequest.userId);
    const currentBalance =
      leaveRequest.leaveType === "CL"
        ? parseFloat(balance.clBalance.toString())
        : balance.mlBalance;

    if (currentBalance < leaveRequest.totalDays) {
      throw new Error("Insufficient balance to approve this request");
    }

    // Update request status
    await db
      .update(leaveRequests)
      .set({
        status: "Approved",
        approvedBy: adminId,
        updatedAt: new Date(),
      })
      .where(eq(leaveRequests.id, requestId));

    // Deduct balance
    const newBalance = currentBalance - leaveRequest.totalDays;
    if (leaveRequest.leaveType === "CL") {
      await db
        .update(leaveBalances)
        .set({
          clBalance: (Math.round(newBalance * 100) / 100).toString(),
          updatedAt: new Date(),
        })
        .where(eq(leaveBalances.userId, leaveRequest.userId));
    } else {
      await db
        .update(leaveBalances)
        .set({ mlBalance: newBalance, updatedAt: new Date() })
        .where(eq(leaveBalances.userId, leaveRequest.userId));
    }

    revalidatePath("/dashboard/leave");

    return { success: true };
  } catch (error) {
    console.error("Error approving leave:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to approve leave");
  }
}

export async function rejectLeave(requestId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const adminId = session.user.id;

    // Update request status
    await db
      .update(leaveRequests)
      .set({
        status: "Rejected",
        approvedBy: adminId,
        updatedAt: new Date(),
      })
      .where(eq(leaveRequests.id, requestId));

    revalidatePath("/dashboard/leave");

    return { success: true };
  } catch (error) {
    console.error("Error rejecting leave:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to reject leave");
  }
}

export async function getPendingLeaveRequests() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const requests = await db
      .select({
        id: leaveRequests.id,
        leaveType: leaveRequests.leaveType,
        fromDate: leaveRequests.fromDate,
        toDate: leaveRequests.toDate,
        totalDays: leaveRequests.totalDays,
        reason: leaveRequests.reason,
        createdAt: leaveRequests.createdAt,
        userName: user.name,
        userEmail: user.email,
      })
      .from(leaveRequests)
      .innerJoin(user, eq(leaveRequests.userId, user.id))
      .where(eq(leaveRequests.status, "Pending"))
      .orderBy(desc(leaveRequests.createdAt));

    return requests;
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    throw new Error("Failed to fetch pending requests");
  }
}

export async function recalculateUserClBalance(userId: string) {
  try {
    const userData = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);
    if (!userData.length) return;

    const usedClDays = await getTotalUsedClDays(userId);
    const newBalance = await calculateClBalance(
      userData[0].createdAt,
      usedClDays
    );

    await db
      .update(leaveBalances)
      .set({ clBalance: newBalance.toString(), updatedAt: new Date() })
      .where(eq(leaveBalances.userId, userId));

    revalidatePath("/dashboard/leave");
  } catch (error) {
    console.error("Error recalculating CL balance:", error);
    throw new Error("Failed to recalculate CL balance");
  }
}
