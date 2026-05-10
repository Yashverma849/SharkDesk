"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdminForUser } from "@/lib/supabase/server";
import type { DbTaskRow } from "@/lib/db/mappers";
import {
  fetchProjectBasics,
  userHasProjectAccess,
  isValidAssigneeForProject,
} from "@/lib/project-access";

function parsePriority(v: FormDataEntryValue | null): DbTaskRow["priority"] {
  const s = String(v ?? "Medium");
  const map: Record<string, DbTaskRow["priority"]> = {
    Low: "low",
    Medium: "medium",
    High: "high",
    low: "low",
    medium: "medium",
    high: "high",
  };
  return map[s] ?? "medium";
}

export type CreateTaskState = { error?: string; ok?: boolean } | null;

export async function createTaskAction(
  _prev: CreateTaskState,
  formData: FormData,
): Promise<CreateTaskState> {
  const ctx = await getSupabaseAdminForUser();
  if (!ctx) return { error: "Sign in required." };

  const title = String(formData.get("title") ?? "").trim();
  const projectId = String(formData.get("project_id") ?? "").trim();
  if (!title) return { error: "Task title is required." };
  if (!projectId) return { error: "Project is required." };

  const project = await fetchProjectBasics(ctx.supabase, projectId);
  if (!project) return { error: "Project not found." };

  const allowed = await userHasProjectAccess(
    ctx.supabase,
    projectId,
    ctx.userId,
  );
  if (!allowed) return { error: "You don’t have access to this project." };

  const assigneeRaw = String(formData.get("assignee") ?? "");
  let assignee_clerk_user_id: string | null =
    assigneeRaw === "" || assigneeRaw === "unassigned"
      ? null
      : assigneeRaw === "me"
        ? ctx.userId
        : assigneeRaw;

  const assigneeOk = await isValidAssigneeForProject(
    ctx.supabase,
    projectId,
    project.owner_clerk_user_id,
    assignee_clerk_user_id,
  );
  if (!assigneeOk) {
    return {
      error:
        "Choose an assignee who is on this project (add them under People first).",
    };
  }

  const dueRaw = String(formData.get("due_date") ?? "").trim();
  const due_date = dueRaw === "" ? null : dueRaw;

  const priority = parsePriority(formData.get("priority"));

  const { data: task, error: te } = await ctx.supabase
    .from("tasks")
    .insert({
      project_id: projectId,
      title,
      assignee_clerk_user_id,
      due_date,
      priority,
      status: "todo",
      created_by_clerk_user_id: ctx.userId,
    })
    .select("id")
    .single();

  if (te) return { error: te.message };

  await ctx.supabase.from("activity_events").insert({
    owner_clerk_user_id: ctx.userId,
    project_id: projectId,
    task_id: task.id,
    summary: `New task created: ${title}`,
    actor_clerk_user_id: ctx.userId,
    event_type: "task_created",
  });

  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/my-work");
  revalidatePath("/activity");
  return { ok: true };
}
