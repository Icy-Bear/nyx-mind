"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { useSession } from "@/lib/auth-client";
import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: session, isPending } = useSession();
  const { setUser, user } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    if (!isPending) {
      if (!session) {
        router.replace("/auth/login");
      } else if (session.user && !user) {
        setUser({
          ...session.user,
          image: session.user.image ?? null,
        });
      }
    }
  }, [session, isPending, router, setUser, user]);

  if (isPending) {
    return (
      <div className="h-screen w-full flex justify-center items-center">
        <Spinner />
      </div>
    );
  }
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
