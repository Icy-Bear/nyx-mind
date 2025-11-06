"use client";

import { AddUser } from "../create-user";

export function CreateUser({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen">
      <AddUser />
      {children}
    </div>
  );
}
