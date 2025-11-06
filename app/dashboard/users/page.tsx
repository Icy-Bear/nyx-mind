import { getAllUsers } from "@/actions/users";
import { CreateUser } from "@/components/admin/CreateUser";
import UserList from "@/components/admin/UserList";
import React from "react";

export default async function page() {
  const users = await getAllUsers();
  return (
    <>
      <CreateUser>
        <UserList users={users} />
      </CreateUser>
    </>
  );
}
