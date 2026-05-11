import type { SupabaseClient } from "@supabase/supabase-js";
import type { DbProjectRow, DbTaskRow } from "@/lib/db/mappers";
import { userHasProjectAccess } from "@/lib/project-access";

export async function fetchOwnedProjects(
  supabase: SupabaseClient,
  ownerClerkUserId: string,
): Promise<DbProjectRow[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("owner_clerk_user_id", ownerClerkUserId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as DbProjectRow[];
}

/** Projects you own or are explicitly added to as a member. */
export async function fetchProjectsForUser(
  supabase: SupabaseClient,
  clerkUserId: string,
): Promise<DbProjectRow[]> {
  const { data: owned, error: e1 } = await supabase
    .from("projects")
    .select("*")
    .eq("owner_clerk_user_id", clerkUserId);

  if (e1) throw e1;

  const { data: memberRows, error: e2 } = await supabase
    .from("project_members")
    .select("project_id")
    .eq("clerk_user_id", clerkUserId);

  if (e2) throw e2;

  const ownedList = (owned ?? []) as DbProjectRow[];
  const ownedIds = new Set(ownedList.map((p) => p.id));

  const memberIds = [
    ...new Set(
      (memberRows ?? []).map((r) => (r as { project_id: string }).project_id),
    ),
  ].filter((id) => !ownedIds.has(id));

  let memberProjects: DbProjectRow[] = [];
  if (memberIds.length > 0) {
    const { data: mp, error: e3 } = await supabase
      .from("projects")
      .select("*")
      .in("id", memberIds);
    if (e3) throw e3;
    memberProjects = (mp ?? []) as DbProjectRow[];
  }

  const merged = [...ownedList, ...memberProjects];
  merged.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
  return merged;
}

export async function fetchProjectRowIfAccessible(
  supabase: SupabaseClient,
  projectId: string,
  clerkUserId: string,
): Promise<DbProjectRow | null> {
  const ok = await userHasProjectAccess(supabase, projectId, clerkUserId);
  if (!ok) return null;
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .maybeSingle();

  if (error) throw error;
  return data as DbProjectRow | null;
}

export async function fetchProjectMemberClerkIds(
  supabase: SupabaseClient,
  projectId: string,
  ownerClerkUserId: string,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("project_members")
    .select("clerk_user_id")
    .eq("project_id", projectId);

  if (error) throw error;
  const ids = new Set(
    (data ?? []).map((r) => (r as { clerk_user_id: string }).clerk_user_id),
  );
  ids.add(ownerClerkUserId);
  return [...ids];
}

export async function countTasksByProjectIds(
  supabase: SupabaseClient,
  projectIds: string[],
): Promise<Record<string, number>> {
  if (projectIds.length === 0) return {};
  const { data, error } = await supabase
    .from("tasks")
    .select("project_id")
    .in("project_id", projectIds);

  if (error) throw error;
  const counts: Record<string, number> = {};
  for (const id of projectIds) counts[id] = 0;
  for (const row of data ?? []) {
    const pid = (row as { project_id: string }).project_id;
    counts[pid] = (counts[pid] ?? 0) + 1;
  }
  return counts;
}


export async function fetchTasksForProject(
  supabase: SupabaseClient,
  projectId: string,
): Promise<DbTaskRow[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as DbTaskRow[];
}

/** Extra collaborators per task (not including primary assignee). */
export async function fetchTaskMembersByTaskIds(
  supabase: SupabaseClient,
  taskIds: string[],
): Promise<Map<string, string[]>> {
  if (taskIds.length === 0) return new Map();
  const { data, error } = await supabase
    .from("task_members")
    .select("task_id, clerk_user_id")
    .in("task_id", taskIds);

  if (error) throw error;
  const map = new Map<string, string[]>();
  for (const row of data ?? []) {
    const r = row as { task_id: string; clerk_user_id: string };
    const list = map.get(r.task_id) ?? [];
    list.push(r.clerk_user_id);
    map.set(r.task_id, list);
  }
  return map;
}

export async function fetchTasksAssignedToUser(
  supabase: SupabaseClient,
  assigneeClerkUserId: string,
): Promise<{ task: DbTaskRow; projectName: string }[]> {
  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("assignee_clerk_user_id", assigneeClerkUserId)
    .order("due_date", { ascending: true, nullsFirst: false });

  if (error) throw error;
  const list = (tasks ?? []) as DbTaskRow[];
  const projectIds = [...new Set(list.map((t) => t.project_id))];
  if (projectIds.length === 0) return [];

  const { data: projects, error: pe } = await supabase
    .from("projects")
    .select("id, name")
    .in("id", projectIds);

  if (pe) throw pe;
  const nameById = Object.fromEntries(
    (projects ?? []).map((p) => [p.id as string, p.name as string]),
  );

  return list.map((task) => ({
    task,
    projectName: nameById[task.project_id] ?? "Unknown project",
  }));
}

export type ActivityEventRow = {
  id: string;
  summary: string;
  created_at: string;
  event_type: string | null;
  project_id: string | null;
};

export async function fetchActivityForOwner(
  supabase: SupabaseClient,
  ownerClerkUserId: string,
  limit = 120,
): Promise<ActivityEventRow[]> {
  const { data, error } = await supabase
    .from("activity_events")
    .select("id, summary, created_at, event_type, project_id")
    .eq("owner_clerk_user_id", ownerClerkUserId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as ActivityEventRow[];
}
