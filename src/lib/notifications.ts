import { formatActivityWhen } from "@/lib/db/mappers";
import type { ActivityEventRow } from "@/lib/db/queries";

export type NotificationType =
  | "assigned"
  | "under_review"
  | "changes_requested"
  | "completed"
  | "blocked";

export type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  task: string;
  time: string;
  unread: boolean;
  createdAt: string;
};

function extractTaskName(summary: string): string {
  const quoted = summary.match(/"([^"]+)"/);
  if (quoted?.[1]) return quoted[1];
  const parts = summary.split(":");
  if (parts.length > 1) return parts.slice(1).join(":").trim();
  return summary;
}

function inferTypeFromActivity(row: ActivityEventRow): NotificationType | null {
  const summary = row.summary.toLowerCase();

  if (summary.includes("under review")) return "under_review";
  if (summary.includes("change requested")) return "changes_requested";
  if (summary.includes("blocked")) return "blocked";
  if (summary.includes("completed") || summary.includes("status changed to done")) {
    return "completed";
  }

  if (row.event_type === "task_assigned" || row.event_type === "task_created") {
    return "assigned";
  }

  return null;
}

function titleForType(type: NotificationType): string {
  switch (type) {
    case "assigned":
      return "Task assigned to you";
    case "under_review":
      return "Task moved to Under Review";
    case "changes_requested":
      return "Changes requested";
    case "completed":
      return "Task completed";
    case "blocked":
      return "Blocked task alert";
    default:
      return "Task update";
  }
}

export function mapActivityToNotifications(
  rows: ActivityEventRow[],
  readIds: Set<string> = new Set(),
): NotificationItem[] {
  return rows
    .map((row) => {
      const type = inferTypeFromActivity(row);
      if (!type) return null;
      return {
        id: row.id,
        type,
        title: titleForType(type),
        task: extractTaskName(row.summary),
        time: formatActivityWhen(row.created_at),
        unread: !readIds.has(row.id),
        createdAt: row.created_at,
      };
    })
    .filter((n): n is NotificationItem => n !== null);
}

export function notificationDotColor(type: NotificationType): string {
  switch (type) {
    case "assigned":
      return "#14B8A6";
    case "under_review":
      return "#8B5CF6";
    case "changes_requested":
      return "#F59E0B";
    case "blocked":
      return "#EF4444";
    case "completed":
      return "#22C55E";
    default:
      return "#14B8A6";
  }
}

export function unreadCountLabel(count: number): string {
  if (count <= 0) return "";
  if (count >= 10) return "9+";
  return String(count);
}
