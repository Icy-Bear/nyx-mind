"use server";

import { db } from "@/db/drizzle";
import { user } from "@/db/schema/auth-schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function getAllUsers() {
  try {
    const users = await db.select().from(user);
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
}) {
  try {
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, data.email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new Error("User with this email already exists");
    }

    await auth.api.signUpEmail({
      body: {
        email: data.email,
        password: data.password,
        name: data.name,
      },
    });

    // Update the role after creation
    await db
      .update(user)
      .set({ role: data.role })
      .where(eq(user.email, data.email));

    revalidatePath("/dashboard/users");

    return {};
  } catch (error) {
    console.error("Error creating user:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to create user");
  }
}

export async function deleteUser(userId: string) {
  try {
    await auth.api.removeUser({
      body: {
        userId,
      },
      headers: await headers(),
    });
    revalidatePath("/dashboard/users");
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error("Failed to delete user");
  }
}

export async function updateUserJoinedAt(userId: string, joinedAt: Date) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
      throw new Error("Unauthorized - Admin access required");
    }

    await db
      .update(user)
      .set({ createdAt: joinedAt })
      .where(eq(user.id, userId));

    revalidatePath("/dashboard/users");

    return { success: true };
  } catch (error) {
    console.error("Error updating user joined date:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to update user joined date");
  }
}
