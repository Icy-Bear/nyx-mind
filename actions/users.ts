"use server";

import { db } from "@/db/drizzle";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

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
  role: "ADMIN" | "MEMBER";
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

    const result = await auth.api.signUpEmail({
      body: {
        name: data.name,
        email: data.email,
        password: data.password,
      },
    });

    if (!result.user) {
      throw new Error("Failed to create user");
    }

    await db
      .update(user)
      .set({ role: data.role })
      .where(eq(user.id, result.user.id));

    return { ...result.user, role: data.role };
  } catch (error) {
    console.error("Error creating user:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to create user");
  }
}