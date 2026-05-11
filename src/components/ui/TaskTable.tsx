"use client";

import { User, Calendar, Flag, ChevronDown, Plus, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { createPortal } from "react-dom";
import {
  updateTaskAssigneeAction,
  addTaskMemberAction,
  removeTaskMemberAction,
  updateTaskStatusAction,
} from "@/app/actions/tasks";
import { Button } from "@/components/ui/Button";
import { TASK_STATUSES } from "@/lib/task-status";

export type PersonMini = { label: string; imageUrl: string | null };

export type Task = {
  id: string | number;
  name: string;
  assignee?: string;
  assigneeId?: string | null;
  /** Collaborators beyond primary assignee (Clerk user ids). */
  extraMemberIds?: string[];
  dueDate: string;
  priority: string;
  status: string;
  project?: string;
};

interface TaskTableProps {
  tasks: Task[];
  showAssignee?: boolean;
  assigneeOptions?: { value: string; label: string }[];
  /** Clerk user id → display name + avatar from Clerk */
  peopleByUserId?: Record<string, PersonMini>;
}

function Avatar({
  userId,
  peopleByUserId,
  size = "md",
}: {
  userId: string;
  peopleByUserId?: Record<string, PersonMini>;
  size?: "sm" | "md";
}) {
  const p = peopleByUserId?.[userId];
  const dim = size === "sm" ? "w-7 h-7" : "w-8 h-8";
  const textSize = size === "sm" ? "text-[10px]" : "text-xs";
  if (p?.imageUrl) {
    return (
      <span
        className={`${dim} rounded-full border border-[#1F2937] overflow-hidden bg-[#0B0F1A] shrink-0 block relative`}
        title={p.label}
      >
        <Image
          src={p.imageUrl}
          alt=""
          width={32}
          height={32}
          className="w-full h-full object-cover"
          unoptimized
        />
      </span>
    );
  }
  const initial = (p?.label ?? userId).trim().charAt(0).toUpperCase() || "?";
  return (
    <span
      className={`${dim} rounded-full border border-[#1F2937] bg-[#0B0F1A] shrink-0 flex items-center justify-center ${textSize} font-medium text-[#9CA3AF]`}
      title={p?.label ?? userId}
    >
      {initial}
    </span>
  );
}

export function TaskTable({
  tasks,
  showAssignee = true,
  assigneeOptions,
  peopleByUserId,
}: TaskTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [openMenuTaskId, setOpenMenuTaskId] = useState<string | number | null>(
    null,
  );
  const [menuBox, setMenuBox] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const activeMenuButtonRef = useRef<HTMLButtonElement | null>(null);
  const [showAddMemberPicker, setShowAddMemberPicker] = useState(false);

  useEffect(() => {
    if (openMenuTaskId === null) setShowAddMemberPicker(false);
  }, [openMenuTaskId]);

  useLayoutEffect(() => {
    if (openMenuTaskId === null) return;
    const update = () => {
      const btn = activeMenuButtonRef.current;
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      const width = 288;
      let left = r.left;
      if (left + width > window.innerWidth - 8) {
        left = window.innerWidth - width - 8;
      }
      if (left < 8) left = 8;
      setMenuBox({ top: r.bottom + 6, left, width });
    };
    update();
    const onScrollOrResize = () => update();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [openMenuTaskId]);

  useEffect(() => {
    if (openMenuTaskId === null) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t)) return;
      if (activeMenuButtonRef.current?.contains(t)) return;
      setOpenMenuTaskId(null);
      setMenuBox(null);
      activeMenuButtonRef.current = null;
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [openMenuTaskId]);

  const handleAssigneeChange = (taskId: string | number, newAssigneeId: string) => {
    startTransition(async () => {
      await updateTaskAssigneeAction(
        String(taskId),
        newAssigneeId === "unassigned" ? null : newAssigneeId,
      );
      router.refresh();
    });
  };

  const handleStatusChange = (taskId: string | number, statusUi: string) => {
    startTransition(async () => {
      await updateTaskStatusAction(String(taskId), statusUi);
      router.refresh();
    });
  };

  /** First person on an empty task becomes lead; otherwise added as collaborator. */
  const addSomeoneToTask = (task: Task, clerkUserId: string) => {
    const hasAnyone = orderedMemberIds(task).length > 0;
    if (!task.assigneeId && !hasAnyone) {
      handleAssigneeChange(task.id, clerkUserId);
      return;
    }
    startTransition(async () => {
      await addTaskMemberAction(String(task.id), clerkUserId);
      router.refresh();
    });
  };

  const handleRemoveMember = (taskId: string | number, clerkUserId: string) => {
    startTransition(async () => {
      await removeTaskMemberAction(String(taskId), clerkUserId);
      router.refresh();
    });
  };

  function orderedMemberIds(task: Task): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    if (task.assigneeId) {
      seen.add(task.assigneeId);
      out.push(task.assigneeId);
    }
    for (const id of task.extraMemberIds ?? []) {
      if (!seen.has(id)) {
        seen.add(id);
        out.push(id);
      }
    }
    return out;
  }
  if (tasks.length === 0) {
    return (
      <div className="bg-[#121826] border border-[#1F2937] rounded-xl flex flex-col items-center justify-center p-12 text-center">
        <h3 className="text-[#E5E7EB] font-medium mb-1">No tasks in this project</h3>
        <p className="text-[#9CA3AF] text-sm">Create or assign tasks to get started</p>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress":
        return "text-[#14B8A6]";
      case "Done":
        return "text-emerald-500/70";
      case "Under review":
        return "text-sky-400";
      case "Blocked":
        return "text-rose-400";
      case "Change requested":
        return "text-amber-400";
      case "On hold":
        return "text-violet-400";
      default:
        return "text-[#9CA3AF]";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-rose-400'
      case 'Medium': return 'text-amber-400'
      default: return 'text-[#9CA3AF]' // Low
    }
  }

  const menuTask =
    openMenuTaskId !== null
      ? tasks.find((t) => String(t.id) === String(openMenuTaskId))
      : undefined;

  const menuTaskHasAddableMember =
    menuTask &&
    assigneeOptions?.some((o) => {
      if (o.value === "unassigned") return false;
      return !new Set(orderedMemberIds(menuTask)).has(o.value);
    });

  const teamDropdownPortal =
    typeof document !== "undefined" &&
    menuTask &&
    menuBox &&
    peopleByUserId &&
    assigneeOptions
      ? createPortal(
          <div
            ref={panelRef}
            className="z-[10000] max-h-[min(70vh,28rem)] overflow-y-auto rounded-xl border border-[#1F2937] bg-[#121826] py-2 shadow-xl"
            style={{
              position: "fixed",
              top: menuBox.top,
              left: menuBox.left,
              width: menuBox.width,
            }}
          >
            <div className="px-3 pb-2 pt-1">
              <h2 className="text-sm font-semibold tracking-tight text-[#E5E7EB]">
                Teams on this task
              </h2>
            </div>
            <ul className="max-h-48 space-y-0.5 overflow-y-auto px-2 pb-2">
              {orderedMemberIds(menuTask).map((uid) => {
                const isExtra = menuTask.extraMemberIds?.includes(uid);
                return (
                  <li
                    key={uid}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-[#1F2937]"
                  >
                    <Avatar
                      userId={uid}
                      peopleByUserId={peopleByUserId}
                      size="sm"
                    />
                    <span className="min-w-0 flex-1 truncate text-[#E5E7EB]">
                      {peopleByUserId[uid]?.label ?? uid.slice(0, 8) + "…"}
                    </span>
                    {isExtra ? (
                      <button
                        type="button"
                        className="shrink-0 rounded p-1 text-[#9CA3AF] hover:bg-[#121826] hover:text-rose-400"
                        aria-label="Remove from task"
                        disabled={isPending}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveMember(menuTask.id, uid);
                        }}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <span className="shrink-0 text-[10px] text-[#9CA3AF]">
                        Lead
                      </span>
                    )}
                  </li>
                );
              })}
              {orderedMemberIds(menuTask).length === 0 ? (
                <li className="px-2 py-2 text-sm text-[#9CA3AF]">
                  No one assigned yet.
                </li>
              ) : null}
            </ul>
            <div className="border-t border-[#1F2937] px-3 pt-3 pb-2">
              {!showAddMemberPicker ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={isPending || !menuTaskHasAddableMember}
                  title={
                    !menuTaskHasAddableMember
                      ? "Everyone on this project is already on this task"
                      : undefined
                  }
                  className="w-full border-[#2d3548] bg-[#1a2234] text-[#E5E7EB] hover:bg-[#252f45] disabled:opacity-50"
                  onClick={() => setShowAddMemberPicker(true)}
                >
                  <Plus className="mr-1.5 h-4 w-4 shrink-0" />
                  Add member
                </Button>
              ) : (
                <div className="space-y-2">
                  <select
                    className="w-full rounded-lg border border-[#1F2937] bg-[#0B0F1A] px-2.5 py-2 text-sm text-[#E5E7EB] focus:outline-none focus:ring-1 focus:ring-[#14B8A6]"
                    defaultValue=""
                    disabled={isPending}
                    autoFocus
                    aria-label="Choose member to add"
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v) {
                        addSomeoneToTask(menuTask, v);
                        setShowAddMemberPicker(false);
                      }
                      e.target.selectedIndex = 0;
                    }}
                  >
                    <option value="">Choose project member…</option>
                    {assigneeOptions
                      .filter((o) => o.value !== "unassigned")
                      .filter((o) => {
                        const set = new Set(orderedMemberIds(menuTask));
                        return !set.has(o.value);
                      })
                      .map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                  </select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full text-[#9CA3AF]"
                    onClick={() => setShowAddMemberPicker(false)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="bg-[#121826] border border-[#1F2937] rounded-xl">
      {teamDropdownPortal}
      <div className="overflow-x-auto overflow-y-visible">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-[#121826] border-b border-[#1F2937]">
            <tr>
              <th className="px-4 py-3 font-medium text-[#9CA3AF]">Task Name</th>
              {showAssignee && <th className="px-4 py-3 font-medium text-[#9CA3AF]">Assigned To</th>}
              <th className="px-4 py-3 font-medium text-[#9CA3AF]">Due Date</th>
              <th className="px-4 py-3 font-medium text-[#9CA3AF]">Priority</th>
              <th className="px-4 py-3 font-medium text-[#9CA3AF]">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F2937]">
            {tasks.map((task) => (
              <tr key={task.id} className="h-12 hover:bg-[#1F2937] transition-colors cursor-pointer group">
                <td className="px-4 text-[#E5E7EB] font-medium">{task.name}</td>
                {showAssignee && (
                  <td className="px-4 py-2" onClick={(e) => {
                    if ((e.target as HTMLElement).tagName === 'SELECT') {
                      e.stopPropagation();
                    }
                  }}>
                    {assigneeOptions ? (
                      <div className="flex items-center gap-2 min-w-0 max-w-[min(100%,28rem)]">
                        {!peopleByUserId ? (
                          <select
                            className="bg-[#121826] border border-[#1F2937] rounded-md px-2 py-1.5 text-sm text-[#E5E7EB] focus:outline-none focus:border-[#14B8A6] focus:ring-1 focus:ring-[#14B8A6] cursor-pointer hover:bg-[#1F2937] transition-colors disabled:opacity-50 min-w-[8rem] max-w-[10rem] truncate"
                            value={task.assigneeId || "unassigned"}
                            onChange={(e) =>
                              handleAssigneeChange(task.id, e.target.value)
                            }
                            disabled={isPending}
                          >
                            {assigneeOptions.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        ) : null}
                        {peopleByUserId ? (
                          <div className="relative shrink-0">
                            <button
                              type="button"
                              aria-expanded={openMenuTaskId === task.id}
                              aria-haspopup="dialog"
                              aria-label="Team on this task"
                              disabled={isPending}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (openMenuTaskId === task.id) {
                                  setOpenMenuTaskId(null);
                                  setMenuBox(null);
                                  activeMenuButtonRef.current = null;
                                } else {
                                  activeMenuButtonRef.current = e.currentTarget;
                                  setOpenMenuTaskId(task.id);
                                  const r = e.currentTarget.getBoundingClientRect();
                                  const width = 288;
                                  let left = r.left;
                                  if (left + width > window.innerWidth - 8) {
                                    left = window.innerWidth - width - 8;
                                  }
                                  if (left < 8) left = 8;
                                  setMenuBox({
                                    top: r.bottom + 6,
                                    left,
                                    width,
                                  });
                                }
                              }}
                              className="inline-flex items-center gap-2 rounded-full border border-[#2d3548] bg-[#1a2234] py-1 pl-1.5 pr-2.5 text-left shadow-sm transition-colors hover:border-[#3d4a5f] hover:bg-[#222b3d] disabled:opacity-50"
                            >
                              <div className="flex items-center pl-0.5">
                                {orderedMemberIds(task).length === 0 ? (
                                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#374151] bg-[#2d3748] text-[#d1d5db]">
                                    <User className="h-3.5 w-3.5" />
                                  </span>
                                ) : (
                                  <div className="flex items-center -space-x-2 pr-0.5">
                                    {orderedMemberIds(task)
                                      .slice(0, 3)
                                      .map((uid, i) => (
                                        <div
                                          key={uid}
                                          className="relative shrink-0 rounded-full ring-2 ring-[#1a2234]"
                                          style={{ zIndex: i + 1 }}
                                        >
                                          <Avatar
                                            userId={uid}
                                            peopleByUserId={peopleByUserId}
                                            size="sm"
                                          />
                                        </div>
                                      ))}
                                    {orderedMemberIds(task).length > 3 ? (
                                      <span
                                        className="relative z-[5] flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#4b5563] bg-[#374151] text-[10px] font-semibold text-[#f3f4f6] ring-2 ring-[#1a2234]"
                                        title={`+${
                                          orderedMemberIds(task).length - 3
                                        } more`}
                                      >
                                        +
                                        {orderedMemberIds(task).length - 3}
                                      </span>
                                    ) : null}
                                  </div>
                                )}
                              </div>
                              <ChevronDown
                                className={`h-3.5 w-3.5 shrink-0 text-[#9ca3af] transition-transform duration-200 ${
                                  openMenuTaskId === task.id
                                    ? "rotate-180"
                                    : ""
                                }`}
                              />
                            </button>
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-[#9CA3AF]">
                        <div className="w-5 h-5 rounded-full bg-[#0B0F1A] border border-[#1F2937] flex items-center justify-center">
                          <User className="w-3 h-3 text-[#9CA3AF]" />
                        </div>
                        {task.assignee || 'Unassigned'}
                      </div>
                    )}
                  </td>
                )}
                <td className="px-4 text-[#9CA3AF]">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    {task.dueDate}
                  </div>
                </td>
                <td className="px-4">
                  <div className="flex items-center gap-2">
                    <Flag className={`w-3.5 h-3.5 ${getPriorityColor(task.priority)}`} />
                    <span className={getPriorityColor(task.priority)}>{task.priority}</span>
                  </div>
                </td>
                <td className="px-4">
                  {assigneeOptions ? (
                    <select
                      className={`max-w-[11rem] truncate rounded-md border border-[#1F2937] bg-[#121826] px-2 py-1.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#14B8A6] disabled:opacity-50 ${getStatusColor(task.status)}`}
                      value={task.status}
                      onChange={(e) =>
                        handleStatusChange(task.id, e.target.value)
                      }
                      onClick={(e) => e.stopPropagation()}
                      disabled={isPending}
                    >
                      {TASK_STATUSES.map((s) => (
                        <option key={s.db} value={s.label}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span
                      className={`font-medium ${getStatusColor(task.status)}`}
                    >
                      {task.status}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
