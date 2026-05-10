"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TaskTable, type Task } from "@/components/ui/TaskTable";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { LogoLoader } from "@/components/ui/LogoLoader";
import { createTaskAction } from "@/app/actions/tasks";
import { ProjectPeoplePanel } from "./project-people-panel";

type AssigneeOption = { value: string; label: string };

type Props = {
  projectId: string;
  projectName: string;
  projectDeadlineLabel: string;
  projectStatusLabel: string;
  initialTasks: Task[];
  assigneeOptions: AssigneeOption[];
  ownerUserId: string;
  isOwner: boolean;
  people: {
    members: { userId: string; label: string; imageUrl: string | null }[];
    addablePeople: { userId: string; label: string }[];
    orgConfigured: boolean;
  };
};

export function ProjectDetailClient({
  projectId,
  projectName,
  projectDeadlineLabel,
  projectStatusLabel,
  initialTasks,
  assigneeOptions,
  ownerUserId,
  isOwner,
  people,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createTaskAction, null);

  useEffect(() => {
    if (state?.ok) {
      setOpen(false);
      router.refresh();
    }
  }, [state?.ok, router]);

  return (
    <div className="flex flex-col min-h-full w-full animate-in fade-in duration-300">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="min-w-0 flex-1">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-[#9CA3AF] hover:text-[#E5E7EB] mb-4 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Projects
          </Link>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <h1 className="text-2xl font-bold text-white tracking-tight truncate">
              {projectName}
            </h1>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${
                projectStatusLabel === "Active"
                  ? "bg-[#14B8A6]/10 text-[#14B8A6] border-[#14B8A6]/20"
                  : "bg-[#1F2937] text-[#9CA3AF] border-[#1F2937]"
              }`}
            >
              {projectStatusLabel}
            </span>
            {projectDeadlineLabel ? (
              <span className="text-sm text-[#9CA3AF] shrink-0">
                Due {projectDeadlineLabel}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 pt-1">
          <ProjectPeoplePanel
            projectId={projectId}
            ownerUserId={ownerUserId}
            isOwner={isOwner}
            members={people.members}
            addablePeople={people.addablePeople}
            orgConfigured={people.orgConfigured}
          />
          <Button onClick={() => setOpen(true)} size="sm" className="h-9">
            <Plus className="mr-1.5 h-4 w-4" />
            Task
          </Button>
        </div>
      </div>

      <TaskTable tasks={initialTasks} showAssignee={true} />

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Create New Task"
      >
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="project_id" value={projectId} />
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#9CA3AF]">Task name</label>
            <Input
              name="title"
              placeholder="E.g. Update user profile design"
              autoFocus
              required
              disabled={pending}
              className="bg-[#121826] border-[#1F2937] text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#9CA3AF]">Assignee</label>
            <select
              name="assignee"
              disabled={pending}
              defaultValue="unassigned"
              className="flex h-10 w-full rounded-lg border border-[#1F2937] bg-[#121826] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:border-[#14B8A6] transition-fast"
            >
              {assigneeOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#9CA3AF]">Due date</label>
              <Input
                type="date"
                name="due_date"
                disabled={pending}
                className="bg-[#121826] border-[#1F2937] text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#9CA3AF]">Priority</label>
              <select
                name="priority"
                defaultValue="Medium"
                disabled={pending}
                className="flex h-10 w-full rounded-lg border border-[#1F2937] bg-[#121826] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:border-[#14B8A6] transition-fast"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
          </div>
          {state?.error ? (
            <p className="text-sm text-rose-400">{state.error}</p>
          ) : null}
          <div className="pt-6 flex justify-end gap-3 border-t border-[#1F2937] mt-8">
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              type="button"
              className="text-[#9CA3AF] hover:text-white"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending} aria-busy={pending}>
              {pending ? <LogoLoader size="button" /> : "Create task"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
