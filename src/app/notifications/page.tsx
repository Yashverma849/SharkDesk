"use client";

import { NotificationItemRow } from "@/components/notifications/NotificationItemRow";
import { useLiveNotifications } from "@/components/notifications/use-live-notifications";

export default function NotificationsPage() {
  const { notifications, loading, error, markAsRead } = useLiveNotifications();
  const unreadNotifications = notifications.filter((n) => n.unread);

  return (
    <div className="flex w-full flex-col animate-in fade-in duration-300">
      <header className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-[#E5E7EB]">
          Notifications
        </h1>
        <p className="mt-1 bg-gradient-to-r from-[#9CA3AF] to-[#14B8A6] bg-clip-text text-sm text-transparent">
          Recent updates across projects
        </p>
      </header>

      <section className="overflow-hidden rounded-xl border border-[#1F2937] bg-[#121826] p-3">
        {loading ? (
          <div className="flex h-56 flex-col items-center justify-center px-6 text-center">
            <p className="text-sm text-[#9CA3AF]">Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="flex h-56 flex-col items-center justify-center px-6 text-center">
            <p className="text-sm font-semibold text-[#E5E7EB]">
              Could not load notifications
            </p>
            <p className="mt-1 text-xs text-[#9CA3AF]">{error}</p>
          </div>
        ) : unreadNotifications.length === 0 ? (
          <div className="flex h-56 flex-col items-center justify-center px-6 text-center">
            <p className="text-sm font-semibold text-[#E5E7EB]">
              No notifications
            </p>
            <p className="mt-1 text-xs text-[#9CA3AF]">You&apos;re all caught up</p>
          </div>
        ) : (
          <div className="space-y-2">
            {unreadNotifications.map((item) => (
              <NotificationItemRow
                key={item.id}
                item={item}
                onMarkAsRead={markAsRead}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
