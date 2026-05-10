import { getSupabaseAdminForUser } from "@/lib/supabase/server";
import {
  fetchProjectsForUser,
  fetchTasksAssignedToUser,
} from "@/lib/db/queries";
import {
  mapDbTaskToUiWithProject,
} from "@/lib/db/mappers";
import { resolveAssigneeNames } from "@/lib/clerk-users";
import { SignInPrompt } from "@/components/auth/SignInPrompt";
import { MyWorkClient } from "./my-work-client";

export default async function MyWorkPage() {
  const ctx = await getSupabaseAdminForUser();
  if (!ctx) return <SignInPrompt />;

  const projects = await fetchProjectsForUser(ctx.supabase, ctx.userId);
  const projectOptions = projects.map((p) => ({ id: p.id, name: p.name }));

  const assigned = await fetchTasksAssignedToUser(ctx.supabase, ctx.userId);
  const assigneeIds = assigned.map((a) => a.task.assignee_clerk_user_id);
  const names = await resolveAssigneeNames(assigneeIds);

  const initialTasks = assigned.map(({ task, projectName }) =>
    mapDbTaskToUiWithProject(task, projectName, names),
  );

  return (
    <MyWorkClient initialTasks={initialTasks} projects={projectOptions} />
  );
}
