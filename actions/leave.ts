"use server";

import { db } from "@/db/drizzle";
import { leaveBalances, leaveRequests, user } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

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
      clBalance: 2, // Initial CL
      mlBalance: 12, // Initial ML
    });
    return;
  }

  const currentBalance = balance[0];
  const now = new Date();
  let updated = false;

  // Check CL accrual (quarterly)
  const lastClAccrual = new Date(currentBalance.lastClAccrual);
  const quartersSinceLastAccrual = Math.floor(
    (now.getTime() - lastClAccrual.getTime()) / (1000 * 60 * 60 * 24 * 91) // ~91 days per quarter
  );

  if (quartersSinceLastAccrual > 0) {
    const newClBalance = currentBalance.clBalance + (quartersSinceLastAccrual * 2);
    await db
      .update(leaveBalances)
      .set({
        clBalance: newClBalance,
        lastClAccrual: now,
        updatedAt: now,
      })
      .where(eq(leaveBalances.userId, userId));
    updated = true;
  }

  // Check ML accrual (yearly)
  const lastMlAccrual = new Date(currentBalance.lastMlAccrual);
  const yearsSinceLastAccrual = now.getFullYear() - lastMlAccrual.getFullYear();

  if (yearsSinceLastAccrual > 0) {
    const newMlBalance = currentBalance.mlBalance + (yearsSinceLastAccrual * 12);
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
    await updateLeaveAccruals(userId);

    const balance = await db
      .select()
      .from(leaveBalances)
      .where(eq(leaveBalances.userId, userId))
      .limit(1);

    if (balance.length === 0) {
      // Should have been created by updateLeaveAccruals
      throw new Error("Failed to initialize leave balance");
    }

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
    const requiredBalance = data.leaveType === "CL" ? balance.clBalance : balance.mlBalance;

    if (requiredBalance < totalDays) {
      throw new Error(`Insufficient ${data.leaveType} balance. Available: ${requiredBalance}, Required: ${totalDays}`);
    }

    // Create request
    await db.insert(leaveRequests).values({
      id: crypto.randomUUID(),
      userId,
      leaveType: data.leaveType,
      fromDate: data.fromDate,
      toDate: data.toDate,
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
    const currentBalance = leaveRequest.leaveType === "CL" ? balance.clBalance : balance.mlBalance;

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
        .set({ clBalance: newBalance, updatedAt: new Date() })
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