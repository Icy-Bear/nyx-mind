"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Mail, Calendar, Shield } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt?: Date;
}

interface UserCardProps {
  user: User;
}

export function UserCard({ user }: UserCardProps) {
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "Unknown";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-0 shadow-md bg-white/50 backdrop-blur-sm">
      <div className="p-6 space-y-4">
        {/* User Avatar and Basic Info */}
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16 ring-2 ring-white/50">
            <AvatarImage src={user.image ?? undefined} alt={user.name} />
            <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
              {user.name}
            </h3>
            <div className="flex items-center text-sm text-gray-500 truncate">
              <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
          </div>
        </div>

        {/* Role and Verification Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-gray-400" />
            <Badge
              variant={user.role === "ADMIN" ? "default" : "secondary"}
              className="text-xs"
            >
              {user.role}
            </Badge>
          </div>
          <Badge
            variant={user.emailVerified ? "default" : "outline"}
            className={`text-xs ${
              user.emailVerified
                ? "bg-green-100 text-green-800 border-green-200"
                : "bg-gray-100 text-gray-600 border-gray-200"
            }`}
          >
            {user.emailVerified ? "Verified" : "Unverified"}
          </Badge>
        </div>

        {/* Creation Date */}
        <div className="flex items-center text-xs text-gray-500 pt-2 border-t border-gray-100">
          <Calendar className="h-3 w-3 mr-1" />
          <span>Joined {formatDate(user.createdAt)}</span>
        </div>
      </div>
    </Card>
  );
}

export default UserCard;