import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdminForUser } from "@/lib/supabase/server";
import {
  fetchProjectRowIfAccessible,
  fetchTasksForProject,
  fetchProjectMemberClerkIds,
  fetchTaskMembersByTaskIds,
} from "@/lib/db/queries";
import {
  mapDbTaskToUi,
  formatProjectStatusUi,
  formatProjectDeadline,
} from "@/lib/db/mappers";
import {
  resolveAssigneeNames,
  resolveUserProfiles,
} from "@/lib/clerk-users";
import { listOrganizationMembers } from "@/lib/clerk-org-members";
import { SignInPrompt } from "@/components/auth/SignInPrompt";
import { ProjectDetailClient } from "./project-detail-client";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await getSupabaseAdminForUser();
  if (!ctx) return <SignInPrompt />;

  const project = await fetchProjectRowIfAccessible(
    ctx.supabase,
    id,
    ctx.userId,
  );
  if (!project) notFound();

  const { orgId } = await auth();
  const orgConfigured = !!orgId;

  const memberIds = await fetchProjectMemberClerkIds(
    ctx.supabase,
    id,
    project.owner_clerk_user_id,
  );
  const memberProfiles = await resolveUserProfiles(memberIds);

  const membersOrdered = memberIds
    .map((userId) => {
      const p = memberProfiles[userId];
      const baseLabel = p?.label ?? userId.slice(0, 8) + "…";
      return {
        userId,
        label:
          userId === ctx.userId ? `${baseLabel} (you)` : baseLabel,
        imageUrl: p?.imageUrl ?? null,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));

  const assigneeOptions = [
    { value: "unassigned", label: "Unassigned" },
    ...memberIds
      .map((uid) => {
        const p = memberProfiles[uid];
        const baseLabel = p?.label ?? uid.slice(0, 8) + "…";
        return {
          value: uid,
          label: uid === ctx.userId ? `${baseLabel} (you)` : baseLabel,
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label)),
  ];

  let addablePeople: { userId: string; label: string }[] = [];
  if (orgId) {
    const orgMembers = await listOrganizationMembers(orgId);
    const inProject = new Set(memberIds);
    addablePeople = orgMembers.filter((m) => !inProject.has(m.userId));
  }

  const rows = await fetchTasksForProject(ctx.supabase, id);
  const taskAssigneeIds = rows.map((r) => r.assignee_clerk_user_id);
  const taskNames = await resolveAssigneeNames(taskAssigneeIds);
  const taskMembersMap = await fetchTaskMembersByTaskIds(
    ctx.supabase,
    rows.map((r) => r.id),
  );
  const initialTasks = rows.map((r) => ({
    ...mapDbTaskToUi(r, taskNames),
    extraMemberIds: taskMembersMap.get(r.id) ?? [],
  }));

  const peopleByUserId = Object.fromEntries(
    membersOrdered.map((m) => [
      m.userId,
      { label: m.label, imageUrl: m.imageUrl },
    ]),
  );

  const isOwner = project.owner_clerk_user_id === ctx.userId;

  return (
    <ProjectDetailClient
      projectId={project.id}
      projectName={project.name}
      projectDeadlineLabel={formatProjectDeadline(project.deadline)}
      projectStatusLabel={formatProjectStatusUi(project.status)}
      initialTasks={initialTasks}
      assigneeOptions={assigneeOptions}
      peopleByUserId={peopleByUserId}
      ownerUserId={project.owner_clerk_user_id}
      isOwner={isOwner}
      people={{
        members: membersOrdered,
        addablePeople,
        orgConfigured,
      }}
    />
  );
}
