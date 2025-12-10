
import { db } from "@/db/drizzle";
import { user } from "@/db/schema/auth-schema";
import { eq } from "drizzle-orm";

async function checkUser() {
    const found = await db.select().from(user).where(eq(user.email, "admin@gamil.com"));
    console.log("Found user (gamil):", found);

    const foundGmail = await db.select().from(user).where(eq(user.email, "admin@gmail.com"));
    console.log("Found user (gmail):", foundGmail);
    process.exit(0);
}

checkUser();
