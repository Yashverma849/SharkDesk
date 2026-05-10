"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getSupabaseAdminForUser } from "@/lib/supabase/server";
import { listOrganizationMembers } from "@/lib/clerk-org-members";
import {
  fetchProjectBasics,
  userIsProjectOwner,
} from "@/lib/project-access";

export type MemberActionState = { error?: string; ok?: boolean } | null;

export async function addProjectMemberAction(
  _prev: MemberActionState,
  formData: FormData,
): Promise<MemberActionState> {
  const ctx = await getSupabaseAdminForUser();
  if (!ctx) return { error: "Sign in required." };

  const projectId = String(formData.get("project_id") ?? "").trim();
  const clerkUserId = String(formData.get("clerk_user_id") ?? "").trim();
  if (!projectId || !clerkUserId)
    return { error: "Choose someone to add." };

  const owner = await userIsProjectOwner(ctx.supabase, projectId, ctx.userId);
  if (!owner) return { error: "Only the project owner can add people." };

  const { orgId } = await auth();
  if (orgId) {
    const orgMembers = await listOrganizationMembers(orgId);
    if (!orgMembers.some((m) => m.userId === clerkUserId)) {
      return {
        error:
          "That user must be in your active Clerk organization. Switch org in Team if needed.",
      };
    }
  } else {
    return {
      error:
        "Select a Clerk organization (Team in the sidebar) so we know who can be added.",
    };
  }

  const { error } = await ctx.supabase.from("project_members").insert({
    project_id: projectId,
    clerk_user_id: clerkUserId,
  });

  if (error?.code === "23505") return { error: "That person is already on this project." };
  if (error) return { error: error.message };

  await ctx.supabase.from("activity_events").insert({
    owner_clerk_user_id: ctx.userId,
    project_id: projectId,
    summary: "Someone was added to the project team",
    actor_clerk_user_id: ctx.userId,
    event_type: "project_member_added",
  });

  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/activity");
  return { ok: true };
}

export async function removeProjectMemberAction(
  _prev: MemberActionState,
  formData: FormData,
): Promise<MemberActionState> {
  const ctx = await getSupabaseAdminForUser();
  if (!ctx) return { error: "Sign in required." };

  const projectId = String(formData.get("project_id") ?? "").trim();
  const clerkUserId = String(formData.get("clerk_user_id") ?? "").trim();
  if (!projectId || !clerkUserId)
    return { error: "Missing fields." };

  const owner = await userIsProjectOwner(ctx.supabase, projectId, ctx.userId);
  if (!owner) return { error: "Only the project owner can remove people." };

  const project = await fetchProjectBasics(ctx.supabase, projectId);
  if (!project) return { error: "Project not found." };
  if (clerkUserId === project.owner_clerk_user_id) {
    return { error: "You can’t remove the project owner from the team." };
  }

  const { error } = await ctx.supabase
    .from("project_members")
    .delete()
    .eq("project_id", projectId)
    .eq("clerk_user_id", clerkUserId);

  if (error) return { error: error.message };

  await ctx.supabase.from("activity_events").insert({
    owner_clerk_user_id: ctx.userId,
    project_id: projectId,
    summary: "Someone was removed from the project team",
    actor_clerk_user_id: ctx.userId,
    event_type: "project_member_removed",
  });

  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/activity");
  return { ok: true };
}
