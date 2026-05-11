"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { NotificationItem } from "@/lib/notifications";

type ResponseShape = {
  notifications: NotificationItem[];
  unreadCount: number;
  fetchedAt: string;
};

export function useLiveNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "GET",
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch notifications (${res.status})`);
      }
      const data = (await res.json()) as ResponseShape;
      setNotifications(data.notifications ?? []);
      setError(null);
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Unable to fetch notifications";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const bootId = window.setTimeout(() => {
      void load();
    }, 0);
    const id = window.setInterval(() => {
      void load();
    }, 5000);

    const onFocus = () => void load();
    const onVisibility = () => {
      if (document.visibilityState === "visible") void load();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearTimeout(bootId);
      window.clearInterval(id);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [load]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.unread).length,
    [notifications],
  );

  const markAsRead = useCallback(async (notificationId: string) => {
    const prev = notifications;
    setNotifications((curr) =>
      curr.map((n) =>
        n.id === notificationId ? { ...n, unread: false } : n,
      ),
    );
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });
      if (!res.ok) {
        throw new Error(`Failed to mark as read (${res.status})`);
      }
    } catch (e) {
      setNotifications(prev);
      const msg =
        e instanceof Error ? e.message : "Unable to mark notification as read";
      setError(msg);
      throw e;
    }
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refresh: load,
    markAsRead,
  };
}
