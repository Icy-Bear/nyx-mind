"use client";

import { useSession } from "@/lib/auth-client";

interface User {
  id: string;
  name: string;
  email: string;
  role: string | null;
  image?: string | null;
}

export function useAuth() {
  const { data: session, isPending } = useSession();

  const user: User | null = session?.user ? {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role || null,
    image: session.user.image || null,
  } : null;

  return {
    user,
    isLoading: isPending,
    isAdmin: user?.role === "admin",
  };
}