"use client";

import * as React from "react";
import {
  IconDashboard,
  IconInnerShadowTop,
  IconReport,
  IconSearch,
  IconSettings,
  IconUser,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
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
      {
        title: "Users",
        url: "/dashboard/users",
        icon: IconUser,
      },
    ],
    navSecondary: [
      {
        title: "Settings",
        url: "#",
        icon: IconSettings,
      },
      {
        title: "Search",
        url: "#",
        icon: IconSearch,
      },
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
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Irm Portal</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sideNavData.navMain} />
        <NavDocuments items={sideNavData.documents} />
        <NavSecondary items={sideNavData.navSecondary} className="mt-auto" />
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
