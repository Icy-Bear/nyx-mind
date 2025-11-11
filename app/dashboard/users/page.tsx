import { getAllUsers } from "@/actions/users";
import { AddUser } from "@/components/admin/AddUser";
import UserList from "@/components/admin/UserList";
import { auth } from "@/lib/auth";
import { Users } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

import { headers } from "next/headers";

export default async function UsersPage() {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });

  if (!session || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const users = await getAllUsers();

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage user accounts and permissions
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{users.length} total users</span>
        </div>
      </div>

      {/* Main content */}
      <div className="space-y-6">
        <AddUser />
        <UserList users={users} currentUserId={session?.user.id as string} />
      </div>
    </div>
  );
}
