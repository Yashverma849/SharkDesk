"use client";

import { NotificationBell } from "@/components/notifications/NotificationBell";
import { NotificationOverlayStack } from "@/components/notifications/NotificationOverlayStack";

export function TopBar() {
  return (
    <header className="h-16 shrink-0 border-b border-[#1F2937] bg-[#0B0F1A]">
      <div className="flex h-full w-full items-center justify-end px-4 sm:px-6">
        <NotificationBell />
      </div>
      <NotificationOverlayStack />
    </header>
  );
}
