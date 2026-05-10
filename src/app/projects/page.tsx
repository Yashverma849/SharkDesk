import Link from "next/link";
import { Folder } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdminForUser } from "@/lib/supabase/server";
import { listOrganizationMembers } from "@/lib/clerk-org-members";
import {
  fetchProjectsForUser,
  countTasksByProjectIds,
} from "@/lib/db/queries";
import { formatProjectStatusUi, formatProjectDeadline } from "@/lib/db/mappers";
import { SignInPrompt } from "@/components/auth/SignInPrompt";
import { CreateProjectForm } from "@/components/projects/CreateProjectForm";

export default async function ProjectsPage() {
  const ctx = await getSupabaseAdminForUser();
  if (!ctx) return <SignInPrompt />;

  const { orgId } = await auth();
  let addablePeople: { userId: string; label: string }[] = [];
  if (orgId) {
    const orgMembers = await listOrganizationMembers(orgId);
    addablePeople = orgMembers.filter((m) => m.userId !== ctx.userId);
  }

  const projects = await fetchProjectsForUser(ctx.supabase, ctx.userId);
  const ids = projects.map((p) => p.id);
  const counts = await countTasksByProjectIds(ctx.supabase, ids);

  return (
    <div className="flex flex-col h-full w-full animate-in fade-in duration-500">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            Projects
          </h1>
          <p className="text-text-secondary font-medium">
            Manage and track your active projects
          </p>
        </div>
        <CreateProjectForm
          addablePeople={addablePeople}
          orgConfigured={!!orgId}
        />
      </div>

      {projects.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 border border-navy-border text-center">
          <p className="text-text-secondary text-sm">
            No projects yet. Use{" "}
            <span className="font-medium text-[#E5E7EB]">Create project</span> to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const statusLabel = formatProjectStatusUi(project.status);
            const taskCount = counts[project.id] ?? 0;
            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="glass-panel rounded-2xl p-6 border-t border-l border-white/5 hover:border-white/10 hover:bg-white/[0.03] shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-all group-hover:bg-teal-primary/10" />

                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-navy-surface to-navy-deep border border-navy-border flex items-center justify-center text-teal-primary shadow-inner group-hover:text-cyan-400 group-hover:shadow-[0_0_15px_rgba(20,184,166,0.2)] transition-all">
                    <Folder className="h-6 w-6" />
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-white mb-2 relative z-10 group-hover:text-teal-primary transition-colors">
                  {project.name}
                </h3>

                <div className="flex items-center justify-between mt-auto pt-6 border-t border-navy-border/40 relative z-10">
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-3">
                    <span className="text-sm font-medium text-text-secondary">
                      {taskCount} task{taskCount === 1 ? "" : "s"}
                    </span>
                    {formatProjectDeadline(project.deadline) ? (
                      <span className="text-xs text-[#6B7280]">
                        Due {formatProjectDeadline(project.deadline)}
                      </span>
                    ) : null}
                  </div>
                  <span
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm ${
                      statusLabel === "Active"
                        ? "bg-teal-primary/10 text-teal-primary border border-teal-primary/20"
                        : "bg-navy-surface text-text-muted border border-navy-border"
                    }`}
                  >
                    {statusLabel}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
