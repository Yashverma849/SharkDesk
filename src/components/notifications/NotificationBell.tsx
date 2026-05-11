"use client";

import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { NotificationItemRow } from "@/components/notifications/NotificationItemRow";
import { unreadCountLabel } from "@/lib/notifications";
import { useLiveNotifications } from "@/components/notifications/use-live-notifications";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, loading, refresh, markAsRead } =
    useLiveNotifications();
  const unreadNotifications = notifications.filter((n) => n.unread);
  const unreadLabel = unreadCountLabel(unreadCount);

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("pointerdown", onPointerDown);
      return () => document.removeEventListener("pointerdown", onPointerDown);
    }
  }, [open]);

  function handleBellClick() {
    if (window.matchMedia("(max-width: 767px)").matches) {
      router.push("/notifications");
      return;
    }
    if (!open) {
      void refresh();
    }
    setOpen((v) => !v);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={handleBellClick}
        aria-label="Notifications"
        aria-expanded={open}
        className={cn(
          "relative flex h-10 w-10 items-center justify-center rounded-[10px] text-[#E5E7EB] transition-all duration-150",
          "hover:bg-white/[0.04]",
          open &&
            "shadow-[0_0_0_1px_rgba(20,184,166,0.2),0_0_12px_rgba(20,184,166,0.12)]",
        )}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#14B8A6] px-1 text-[11px] font-semibold text-white">
            {unreadLabel}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+10px)] z-[90] w-[360px] overflow-hidden rounded-[14px] border border-[#1F2937] bg-[#121826] shadow-[0_10px_30px_rgba(0,0,0,0.4)] animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="border-b border-[#1F2937] px-4 py-3 text-sm font-semibold text-[#E5E7EB]">
            Notifications
          </div>

          <div className="max-h-[360px] overflow-y-auto p-2 custom-scrollbar">
            {loading ? (
              <div className="flex h-32 items-center justify-center text-xs text-[#9CA3AF]">
                Loading notifications...
              </div>
            ) : unreadNotifications.length === 0 ? (
              <div className="flex h-44 flex-col items-center justify-center px-6 text-center">
                <p className="text-sm font-semibold text-[#E5E7EB]">
                  No notifications
                </p>
                <p className="mt-1 text-xs text-[#9CA3AF]">
                  You&apos;re all caught up
                </p>
              </div>
            ) : (
              unreadNotifications.map((item) => (
                <div key={item.id} className="mb-2 last:mb-0">
                  <NotificationItemRow
                    item={item}
                    compact={false}
                    onMarkAsRead={markAsRead}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
