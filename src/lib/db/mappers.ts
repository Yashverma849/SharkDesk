import type { Task } from "@/components/ui/TaskTable";
import type { TaskStatusDb } from "@/lib/task-status";
import { formatTaskStatusLabel } from "@/lib/task-status";

export type DbProjectRow = {
  id: string;
  owner_clerk_user_id: string;
  name: string;
  status: "active" | "completed";
  deadline: string | null;
  created_at: string;
  updated_at: string;
};

export type DbTaskRow = {
  id: string;
  project_id: string;
  title: string;
  comment: string | null;
  assignee_clerk_user_id: string | null;
  due_date: string | null;
  priority: "low" | "medium" | "high";
  status: TaskStatusDb;
  created_by_clerk_user_id: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export function formatProjectStatusUi(status: DbProjectRow["status"]): string {
  return status === "completed" ? "Completed" : "Active";
}

export function formatProjectDeadline(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

export function formatDueDate(isoDate: string | null): string {
  if (!isoDate) return "—";
  const d = new Date(isoDate + "T12:00:00");
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(d);
}

export function formatPriorityUi(p: DbTaskRow["priority"]): string {
  const map = { low: "Low", medium: "Medium", high: "High" } as const;
  return map[p];
}

export function formatTaskStatusUi(s: DbTaskRow["status"]): string {
  return formatTaskStatusLabel(s);
}

export function mapDbTaskToUi(
  row: DbTaskRow,
  assigneeNames: Record<string, string>,
): Task {
  return {
    id: row.id,
    name: row.title,
    comment: row.comment,
    assignee: row.assignee_clerk_user_id
      ? assigneeNames[row.assignee_clerk_user_id] ??
        row.assignee_clerk_user_id.slice(0, 8) + "…"
      : "Unassigned",
    assigneeId: row.assignee_clerk_user_id,
    dueDate: formatDueDate(row.due_date),
    priority: formatPriorityUi(row.priority),
    status: formatTaskStatusUi(row.status),
  };
}

export function mapDbTaskToUiWithProject(
  row: DbTaskRow,
  projectName: string,
  assigneeNames: Record<string, string>,
): Task {
  return {
    ...mapDbTaskToUi(row, assigneeNames),
    project: projectName,
  };
}

export function formatActivityWhen(iso: string): string {
  const d = new Date(iso);
  const now = Date.now();
  const diffMs = now - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  }).format(d);
}
