"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { listOrganizationMembers } from "@/lib/clerk-org-members";
import { getSupabaseAdminForUser } from "@/lib/supabase/server";

export type CreateProjectState = { error?: string; ok?: boolean } | null;

function parseDeadlineDateInput(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
  const d = new Date(`${trimmed}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export async function createProjectAction(
  _prev: CreateProjectState,
  formData: FormData,
): Promise<CreateProjectState> {
  const ctx = await getSupabaseAdminForUser();
  if (!ctx) return { error: "Sign in required." };

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Project name is required." };

  const deadlineRaw = String(formData.get("deadline") ?? "").trim();
  const deadline = deadlineRaw ? parseDeadlineDateInput(deadlineRaw) : null;
  if (deadlineRaw && !deadline) {
    return { error: "Invalid deadline date." };
  }

  const memberIds = [
    ...new Set(
      formData
        .getAll("member_ids")
        .map((v) => String(v).trim())
        .filter(Boolean),
    ),
  ];

  const { orgId } = await auth();
  if (memberIds.length > 0 && !orgId) {
    return {
      error:
        "Select a Clerk organization (Team in the sidebar) to add people to the project.",
    };
  }

  let allowedIds = new Set<string>();
  if (orgId) {
    const orgMembers = await listOrganizationMembers(orgId);
    allowedIds = new Set(orgMembers.map((m) => m.userId));
  }

  for (const uid of memberIds) {
    if (uid === ctx.userId) continue;
    if (!allowedIds.has(uid)) {
      return {
        error:
          "Team selection includes someone who is not in your active organization.",
      };
    }
  }

  const insertPayload: {
    owner_clerk_user_id: string;
    name: string;
    status: string;
    deadline?: string | null;
  } = {
    owner_clerk_user_id: ctx.userId,
    name,
    status: "active",
  };
  if (deadline !== null) insertPayload.deadline = deadline;

  const { data: row, error } = await ctx.supabase
    .from("projects")
    .insert(insertPayload)
    .select("id")
    .single();

  if (error) return { error: error.message };

  const memberRows: { project_id: string; clerk_user_id: string }[] = [
    { project_id: row.id, clerk_user_id: ctx.userId },
  ];
  for (const uid of memberIds) {
    if (uid === ctx.userId) continue;
    memberRows.push({ project_id: row.id, clerk_user_id: uid });
  }

  const { error: memErr } = await ctx.supabase
    .from("project_members")
    .insert(memberRows);

  if (memErr) return { error: memErr.message };

  await ctx.supabase.from("activity_events").insert({
    owner_clerk_user_id: ctx.userId,
    project_id: row.id,
    summary: `Project created: ${name}`,
    actor_clerk_user_id: ctx.userId,
    event_type: "project_created",
  });

  revalidatePath("/projects");
  revalidatePath("/");
  return { ok: true };
}
