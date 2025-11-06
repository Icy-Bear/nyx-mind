"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt?: Date;
}

interface UserListProps {
  users: User[];
}

export default function UserList({ users }: UserListProps) {
  return (
    <div className="flex flex-col gap-4 p-10">
      {users.map((user) => (
        <div
          key={user.id}
          className="flex items-center justify-between border border-neutral-200 rounded-2xl p-4 hover:bg-neutral-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.image ?? undefined} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-neutral-900">{user.name}</p>
              <p className="text-sm text-neutral-500">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-neutral-300 text-neutral-700 text-xs"
            >
              {user.role}
            </Badge>
            {user.emailVerified ? (
              <Badge className="bg-green-100 text-green-800 border border-green-200">
                Verified
              </Badge>
            ) : (
              <Badge className="bg-neutral-200 text-neutral-700 border border-neutral-300">
                Unverified
              </Badge>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
