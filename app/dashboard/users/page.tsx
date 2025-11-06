import { getAllUsers } from "@/actions/users";
import { CreateUser } from "@/components/admin/CreateUser";
import UserList from "@/components/admin/UserList";
import { Users, UserPlus } from "lucide-react";

export default async function UsersPage() {
  const users = await getAllUsers();
  
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 sm:h-8 sm:w-8" />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Users</h1>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage user accounts and permissions
          </p>
        </div>
        
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
