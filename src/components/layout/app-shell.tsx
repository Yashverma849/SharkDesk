"use client";

import { SidebarProvider } from "@/components/layout/sidebar-context";
import { Sidebar } from "@/components/layout/Sidebar";
import { MainArea } from "@/components/layout/main-area";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar />
      <MainArea>{children}</MainArea>
    </SidebarProvider>
  );
}
