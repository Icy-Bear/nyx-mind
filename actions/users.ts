"use server";

import { db } from "@/db/drizzle";
import { user } from "@/db/schema";

export async function getAllUsers() {
  try {
    const users = await db.select().from(user);
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }
}
