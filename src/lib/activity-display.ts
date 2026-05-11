export type ActivityKind =
  | "new_task"
  | "task_assigned"
  | "status_changed"
  | "other";

export type ActivityFeedItem = {
  id: string;
  summary: string;
  created_at: string;
  event_type: string | null;
  project_id: string | null;
};

export function classifyActivity(row: ActivityFeedItem): ActivityKind {
  const t = row.event_type ?? "";
  if (t === "task_created") return "new_task";
  if (t === "task_assigned") return "task_assigned";
  if (t === "task_status_changed") return "status_changed";
  if (t === "task_updated") {
    const s = row.summary;
    if (/assignee|Teammate/i.test(s)) return "task_assigned";
  }
  return "other";
}

export function kindLabel(kind: ActivityKind): string {
  switch (kind) {
    case "new_task":
      return "New task added";
    case "task_assigned":
      return "Task assigned";
    case "status_changed":
      return "Status changed";
    default:
      return "Other";
  }
}

export type PieDatum = { name: string; value: number };

export function buildPieByProject(
  rows: ActivityFeedItem[],
  kind: Exclude<ActivityKind, "other">,
  projectNames: Record<string, string>,
): PieDatum[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    if (classifyActivity(row) !== kind) continue;
    const pid = row.project_id ?? "_none";
    const label =
      pid === "_none" ? "No project" : projectNames[pid] ?? "Unknown project";
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts.entries()].map(([name, value]) => ({ name, value }));
}
