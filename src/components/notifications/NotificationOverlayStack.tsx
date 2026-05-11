"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useLiveNotifications } from "@/components/notifications/use-live-notifications";
import { notificationDotColor, type NotificationItem } from "@/lib/notifications";
import { cn } from "@/lib/utils";

type OverlayItem = NotificationItem & { overlayKey: string };

export function NotificationOverlayStack() {
  const { notifications, loading } = useLiveNotifications();
  const [overlayItems, setOverlayItems] = useState<OverlayItem[]>([]);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const bootstrappedRef = useRef(false);
  const timerRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (loading) return;

    const unread = notifications.filter((n) => n.unread);
    const unreadIds = new Set(unread.map((n) => n.id));

    if (!bootstrappedRef.current) {
      seenIdsRef.current = unreadIds;
      bootstrappedRef.current = true;
      return;
    }

    const incoming = unread.filter((n) => !seenIdsRef.current.has(n.id));
    seenIdsRef.current = unreadIds;

    if (incoming.length === 0) return;

    const delayedId = window.setTimeout(() => {
      const stamped = incoming.map((n) => ({
        ...n,
        overlayKey: `${n.id}-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
      }));
      setOverlayItems((prev) => [...stamped, ...prev].slice(0, 3));
    }, 0);

    return () => window.clearTimeout(delayedId);
  }, [notifications, loading]);

  useEffect(() => {
    for (const item of overlayItems) {
      if (timerRef.current.has(item.overlayKey)) continue;
      const id = window.setTimeout(() => {
        setOverlayItems((prev) =>
          prev.filter((x) => x.overlayKey !== item.overlayKey),
        );
        timerRef.current.delete(item.overlayKey);
      }, 4600);
      timerRef.current.set(item.overlayKey, id);
    }

    return () => {
      // no-op; cleanup on unmount handled in dedicated effect below.
    };
  }, [overlayItems]);

  useEffect(() => {
    return () => {
      for (const id of timerRef.current.values()) {
        window.clearTimeout(id);
      }
      timerRef.current.clear();
    };
  }, []);

  function dismiss(overlayKey: string) {
    const timer = timerRef.current.get(overlayKey);
    if (timer) {
      window.clearTimeout(timer);
      timerRef.current.delete(overlayKey);
    }
    setOverlayItems((prev) => prev.filter((x) => x.overlayKey !== overlayKey));
  }

  if (overlayItems.length === 0) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-20 z-[120] flex w-[340px] max-w-[calc(100vw-1rem)] flex-col gap-2 sm:right-6">
      {overlayItems.map((item) => (
        <div
          key={item.overlayKey}
          className={cn(
            "pointer-events-auto rounded-xl border border-[#1F2937] bg-[#121826] p-3 shadow-[0_12px_32px_rgba(0,0,0,0.45)]",
            "animate-in fade-in slide-in-from-right-6 duration-200",
          )}
        >
          <div className="flex items-start gap-3">
            <span
              className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: notificationDotColor(item.type) }}
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#E5E7EB]">
                {item.title}
              </p>
              <p className="mt-0.5 truncate text-xs text-[#9CA3AF]">{item.task}</p>
              <p className="mt-1 text-[11px] text-[#6B7280]">{item.time}</p>
            </div>
            <button
              type="button"
              onClick={() => dismiss(item.overlayKey)}
              className="rounded-md p-1 text-[#6B7280] transition-colors hover:bg-white/[0.04] hover:text-[#E5E7EB]"
              aria-label="Dismiss notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
