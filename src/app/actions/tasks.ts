"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdminForUser } from "@/lib/supabase/server";
import type { DbTaskRow } from "@/lib/db/mappers";
import { parseTaskStatusLabel } from "@/lib/task-status";
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

export async function updateTaskAssigneeAction(
  taskId: string,
  newAssigneeId: string | null,
): Promise<{ error?: string; ok?: boolean }> {
  const ctx = await getSupabaseAdminForUser();
  if (!ctx) return { error: "Sign in required." };

  const { data: task, error: te } = await ctx.supabase
    .from("tasks")
    .select("project_id, title")
    .eq("id", taskId)
    .single();

  if (te || !task) return { error: "Task not found." };

  const project = await fetchProjectBasics(ctx.supabase, task.project_id);
  if (!project) return { error: "Project not found." };

  const allowed = await userHasProjectAccess(
    ctx.supabase,
    task.project_id,
    ctx.userId,
  );
  if (!allowed) return { error: "You don't have access to this project." };

  const assigneeOk = await isValidAssigneeForProject(
    ctx.supabase,
    task.project_id,
    project.owner_clerk_user_id,
    newAssigneeId,
  );

  if (!assigneeOk) {
    return { error: "Invalid assignee." };
  }

  const { error: updateError } = await ctx.supabase
    .from("tasks")
    .update({ assignee_clerk_user_id: newAssigneeId })
    .eq("id", taskId);

  if (updateError) return { error: updateError.message };

  await ctx.supabase.from("activity_events").insert({
    owner_clerk_user_id: ctx.userId,
    project_id: task.project_id,
    task_id: taskId,
    summary: `Task "${task.title}" assignee updated.`,
    actor_clerk_user_id: ctx.userId,
    event_type: "task_assigned",
  });

  revalidatePath("/projects");
  revalidatePath(`/projects/${task.project_id}`);
  revalidatePath("/my-work");
  revalidatePath("/activity");

  return { ok: true };
}

export async function addTaskMemberAction(
  taskId: string,
  clerkUserId: string,
): Promise<{ error?: string; ok?: boolean }> {
  const ctx = await getSupabaseAdminForUser();
  if (!ctx) return { error: "Sign in required." };

  const { data: task, error: te } = await ctx.supabase
    .from("tasks")
    .select("project_id, title, assignee_clerk_user_id")
    .eq("id", taskId)
    .single();

  if (te || !task) return { error: "Task not found." };

  const project = await fetchProjectBasics(ctx.supabase, task.project_id);
  if (!project) return { error: "Project not found." };

  const allowed = await userHasProjectAccess(
    ctx.supabase,
    task.project_id,
    ctx.userId,
  );
  if (!allowed) return { error: "You don't have access to this project." };

  if (task.assignee_clerk_user_id === clerkUserId) {
    return { ok: true };
  }

  const assigneeOk = await isValidAssigneeForProject(
    ctx.supabase,
    task.project_id,
    project.owner_clerk_user_id,
    clerkUserId,
  );
  if (!assigneeOk) return { error: "That user is not on this project." };

  const { error: ie } = await ctx.supabase.from("task_members").insert({
    task_id: taskId,
    clerk_user_id: clerkUserId,
  });

  if (ie) {
    if (ie.code === "23505") return { ok: true };
    return { error: ie.message };
  }

  await ctx.supabase.from("activity_events").insert({
    owner_clerk_user_id: ctx.userId,
    project_id: task.project_id,
    task_id: taskId,
    summary: `Teammate added to task "${task.title}".`,
    actor_clerk_user_id: ctx.userId,
    event_type: "task_assigned",
  });

  revalidatePath("/projects");
  revalidatePath(`/projects/${task.project_id}`);
  revalidatePath("/my-work");
  revalidatePath("/activity");

  return { ok: true };
}

export async function removeTaskMemberAction(
  taskId: string,
  clerkUserId: string,
): Promise<{ error?: string; ok?: boolean }> {
  const ctx = await getSupabaseAdminForUser();
  if (!ctx) return { error: "Sign in required." };

  const { data: task, error: te } = await ctx.supabase
    .from("tasks")
    .select("project_id, title")
    .eq("id", taskId)
    .single();

  if (te || !task) return { error: "Task not found." };

  const allowed = await userHasProjectAccess(
    ctx.supabase,
    task.project_id,
    ctx.userId,
  );
  if (!allowed) return { error: "You don't have access to this project." };

  const { error: de } = await ctx.supabase
    .from("task_members")
    .delete()
    .eq("task_id", taskId)
    .eq("clerk_user_id", clerkUserId);

  if (de) return { error: de.message };

  await ctx.supabase.from("activity_events").insert({
    owner_clerk_user_id: ctx.userId,
    project_id: task.project_id,
    task_id: taskId,
    summary: `Teammate removed from task "${task.title}".`,
    actor_clerk_user_id: ctx.userId,
    event_type: "task_assigned",
  });

  revalidatePath("/projects");
  revalidatePath(`/projects/${task.project_id}`);
  revalidatePath("/my-work");
  revalidatePath("/activity");

  return { ok: true };
}

export async function updateTaskStatusAction(
  taskId: string,
  statusUi: string,
): Promise<{ error?: string; ok?: boolean }> {
  const status = parseTaskStatusLabel(statusUi);
  if (!status) return { error: "Invalid status." };

  const ctx = await getSupabaseAdminForUser();
  if (!ctx) return { error: "Sign in required." };

  const { data: task, error: te } = await ctx.supabase
    .from("tasks")
    .select("project_id, title, status")
    .eq("id", taskId)
    .single();

  if (te || !task) return { error: "Task not found." };

  const allowed = await userHasProjectAccess(
    ctx.supabase,
    task.project_id,
    ctx.userId,
  );
  if (!allowed) return { error: "You don't have access to this project." };

  if (task.status === status) return { ok: true };

  const { error: ue } = await ctx.supabase
    .from("tasks")
    .update({ status })
    .eq("id", taskId);

  if (ue) return { error: ue.message };

  await ctx.supabase.from("activity_events").insert({
    owner_clerk_user_id: ctx.userId,
    project_id: task.project_id,
    task_id: taskId,
    summary: `Task "${task.title}" status changed to ${statusUi}.`,
    actor_clerk_user_id: ctx.userId,
    event_type: "task_status_changed",
  });

  revalidatePath("/projects");
  revalidatePath(`/projects/${task.project_id}`);
  revalidatePath("/my-work");
  revalidatePath("/activity");

  return { ok: true };
}
