import type { SupabaseClient } from "@supabase/supabase-js";

export async function fetchProjectBasics(
  supabase: SupabaseClient,
  projectId: string,
): Promise<{ id: string; owner_clerk_user_id: string } | null> {
  const { data, error } = await supabase
    .from("projects")
    .select("id, owner_clerk_user_id")
    .eq("id", projectId)
    .maybeSingle();

  if (error) throw error;
  return data as { id: string; owner_clerk_user_id: string } | null;
}

/** User can access project if they own it or are in project_members. */
export async function userHasProjectAccess(
  supabase: SupabaseClient,
  projectId: string,
  clerkUserId: string,
): Promise<boolean> {
  const project = await fetchProjectBasics(supabase, projectId);
  if (!project) return false;
  if (project.owner_clerk_user_id === clerkUserId) return true;

  const { data, error } = await supabase
    .from("project_members")
    .select("id")
    .eq("project_id", projectId)
    .eq("clerk_user_id", clerkUserId)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}

export async function userIsProjectOwner(
  supabase: SupabaseClient,
  projectId: string,
  clerkUserId: string,
): Promise<boolean> {
  const project = await fetchProjectBasics(supabase, projectId);
  return project?.owner_clerk_user_id === clerkUserId;
}

/** Assignee must be unset, the owner, or a row in project_members. */
export async function isValidAssigneeForProject(
  supabase: SupabaseClient,
  projectId: string,
  ownerId: string,
  assigneeClerkId: string | null,
): Promise<boolean> {
  if (assigneeClerkId === null) return true;
  if (assigneeClerkId === ownerId) return true;

  const { data, error } = await supabase
    .from("project_members")
    .select("id")
    .eq("project_id", projectId)
    .eq("clerk_user_id", assigneeClerkId)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}
