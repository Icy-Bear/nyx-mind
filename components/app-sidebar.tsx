"use client";

import * as React from "react";
import {
  IconDashboard,
  IconReport,
  IconUser,
  IconCommand,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Spinner } from "./ui/spinner";
import { useSession } from "@/lib/auth-client";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isPending, data } = useSession();

  const sideNavData = {
    user: data?.user,
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: IconDashboard,
      },
      ...(data?.user?.role === "admin" ? [{
        title: "Users",
        url: "/dashboard/users",
        icon: IconUser,
      }] : []),
    ],
    documents: [
      {
        name: "Leave",
        url: "/dashboard/leave",
        icon: IconReport,
      },
    ],
  };
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <IconCommand className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">NyxMinds</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sideNavData.navMain} label="Platform" />
        <NavDocuments items={sideNavData.documents} />
      </SidebarContent>
      <SidebarFooter>
        {isPending ? (
          <div className="flex justify-center items-center">
            <Spinner />
          </div>
        ) : data?.user ? (
          <NavUser user={data.user} />
        ) : (
          <div className="flex justify-center items-center">
            <Spinner />
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
