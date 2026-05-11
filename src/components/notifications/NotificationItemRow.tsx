import { cn } from "@/lib/utils";
import {
  type NotificationItem,
  notificationDotColor,
} from "@/lib/notifications";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";

type Props = {
  item: NotificationItem;
  compact?: boolean;
  onMarkAsRead?: (id: string) => Promise<void> | void;
};

export function NotificationItemRow({
  item,
  compact = false,
  onMarkAsRead,
}: Props) {
  const [swipingOut, setSwipingOut] = useState(false);
  const [pendingRead, setPendingRead] = useState(false);

  async function handleMarkAsRead() {
    if (!item.unread || pendingRead) return;
    setPendingRead(true);
    setSwipingOut(true);
    try {
      // Let the swipe-out animation start before removing from list.
      await new Promise((resolve) => window.setTimeout(resolve, 180));
      await onMarkAsRead?.(item.id);
    } catch {
      setSwipingOut(false);
    } finally {
      setPendingRead(false);
    }
  }

  return (
    <div
      className={cn(
        "w-full px-4 py-3.5 text-left transition-all duration-150",
        compact && "border-b border-[#1F2937]",
        "rounded-xl border border-[#1F2937] bg-[#121826]",
        "hover:bg-white/[0.03]",
        item.unread ? "bg-white/[0.025]" : "opacity-90",
        "transform-gpu transition-all duration-300 ease-out",
        swipingOut && "translate-x-8 opacity-0 scale-[0.98]",
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
          <p className="mt-1 text-xs text-[#6B7280]">{item.time}</p>
        </div>
        
        {item.unread ? (
          <button
            type="button"
            onClick={handleMarkAsRead}
            disabled={pendingRead}
            className={cn(
              "mt-1 inline-flex shrink-0 items-center gap-1 rounded-md border border-[#1F2937] px-2 py-1 text-[11px] font-medium text-[#9CA3AF] transition-all",
              "hover:border-[#14B8A6]/50 hover:text-[#14B8A6]",
              pendingRead && "opacity-60",
            )}
            title="Mark as read"
          >
            <CheckCircle2
              className={cn(
                "h-3.5 w-3.5 transition-transform duration-200",
                swipingOut && "scale-110",
              )}
            />
            {pendingRead ? "Saving..." : "Mark read"}
          </button>
        ) : (
          <span className="mt-1 shrink-0 text-[11px] text-[#6B7280]">Read</span>
        )}
      </div>
    </div>
  );
}
