"use client";

import {
  useSidebar,
  SIDEBAR_COLLAPSED_W,
  SIDEBAR_EXPANDED_W,
} from "@/components/layout/sidebar-context";
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
      <div className="min-h-full p-8 max-w-6xl mx-auto">{children}</div>
    </main>
  );
}
