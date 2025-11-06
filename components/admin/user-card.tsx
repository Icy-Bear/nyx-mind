"use client";

import { useUserStore } from "@/store/useUserStore";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export default function UserCard() {
  const { user } = useUserStore();
  return (
    <div className="flex gap-4 p-1 border-2 rounded border-black">
      <Avatar className="h-8 w-8 rounded-lg grayscale">
        <AvatarImage src={user?.image ?? ""} alt={"user"} />
        <AvatarFallback className="rounded-lg">CN</AvatarFallback>
      </Avatar>

      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{user?.name}</span>
        <span className="text-muted-foreground truncate text-xs">
          {user?.email}
        </span>
      </div>
    </div>
  );
}
