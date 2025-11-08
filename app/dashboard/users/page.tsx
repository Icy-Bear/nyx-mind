import { getAllUsers } from "@/actions/users";
import { CreateUser } from "@/components/admin/CreateUser";
import UserList from "@/components/admin/UserList";
import { Users } from "lucide-react";

export default async function UsersPage() {
  const users = await getAllUsers();

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <p className="text-muted-foreground text-sm sm:text-base">
          Manage user accounts and permissions
        </p>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{users.length} total users</span>
        </div>
      </div>

      <CreateUser>
        <UserList users={users} />
      </CreateUser>
    </div>
  );
}
