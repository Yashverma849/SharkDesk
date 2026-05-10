"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GroupedTaskList } from "@/components/ui/GroupedTaskList";
import type { Task } from "@/components/ui/TaskTable";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Plus } from "lucide-react";
import { createTaskAction } from "@/app/actions/tasks";

type Props = {
  initialTasks: Task[];
  projects: { id: string; name: string }[];
};

export function MyWorkClient({ initialTasks, projects }: Props) {
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
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">
            My Work
          </h1>
          <p className="text-[#9CA3AF] font-medium text-sm">
            Tasks assigned to you
          </p>
        </div>
        <Button
          onClick={() => setOpen(true)}
          size="sm"
          className="h-9"
          disabled={projects.length === 0}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Task
        </Button>
      </div>

      <GroupedTaskList tasks={initialTasks} />

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Create New Task">
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="assignee" value="me" />
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
            <label className="text-sm font-medium text-[#9CA3AF]">Project</label>
            <select
              name="project_id"
              required
              disabled={pending || projects.length === 0}
              className="flex h-10 w-full rounded-lg border border-[#1F2937] bg-[#121826] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:border-[#14B8A6] transition-fast"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
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
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Create task"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
