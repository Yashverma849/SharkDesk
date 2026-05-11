"use client";

import {
  useSidebar,
  SIDEBAR_COLLAPSED_W,
  SIDEBAR_EXPANDED_W,
} from "@/components/layout/sidebar-context";
import { TopBar } from "@/components/layout/top-bar";
import { cn } from "@/lib/utils";

export function MainArea({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <main
      className={cn(
        "h-full overflow-y-auto overflow-x-hidden custom-scrollbar transition-[padding] duration-200 ease-out",
      )}
      style={{
        paddingLeft: collapsed ? SIDEBAR_COLLAPSED_W : SIDEBAR_EXPANDED_W,
      }}
    >
      <div className="flex min-h-full flex-col">
        <TopBar />
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col p-8">
          {children}
        </div>
      </div>
    </main>
  );
}
