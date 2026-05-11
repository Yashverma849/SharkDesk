/** DB values for `tasks.status` (matches Postgres check constraint). */
export const TASK_STATUSES = [
  { db: "todo", label: "Todo" },
  { db: "in_progress", label: "In Progress" },
  { db: "done", label: "Done" },
  { db: "under_review", label: "Under review" },
  { db: "blocked", label: "Blocked" },
  { db: "change_requested", label: "Change requested" },
  { db: "on_hold", label: "On hold" },
] as const;

export type TaskStatusDb = (typeof TASK_STATUSES)[number]["db"];

export function formatTaskStatusLabel(db: string): string {
  const row = TASK_STATUSES.find((s) => s.db === db);
  return row?.label ?? db;
}

export function parseTaskStatusLabel(label: string): TaskStatusDb | undefined {
  const row = TASK_STATUSES.find((s) => s.label === label);
  return row?.db;
}
