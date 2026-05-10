"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addProjectMemberAction,
  removeProjectMemberAction,
} from "@/app/actions/project-members";
import { Button } from "@/components/ui/Button";
import { ChevronDown, UserMinus, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

const PREVIEW_AVATARS = 3;

type Props = {
  projectId: string;
  ownerUserId: string;
  isOwner: boolean;
  members: { userId: string; label: string; imageUrl: string | null }[];
  addablePeople: { userId: string; label: string }[];
  orgConfigured: boolean;
};

export function ProjectPeoplePanel({
  projectId,
  ownerUserId,
  isOwner,
  members,
  addablePeople,
  orgConfigured,
}: Props) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const [addState, addAction, addPending] = useActionState(
    addProjectMemberAction,
    null,
  );
  const [remState, remAction, remPending] = useActionState(
    removeProjectMemberAction,
    null,
  );

  useEffect(() => {
    if (addState?.ok || remState?.ok) router.refresh();
  }, [addState?.ok, remState?.ok, router]);

  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("pointerdown", handlePointerDown);
      return () =>
        document.removeEventListener("pointerdown", handlePointerDown);
    }
  }, [menuOpen]);

  const err = addState?.error ?? remState?.error;

  const preview = members.slice(0, PREVIEW_AVATARS);
  const overflow = Math.max(0, members.length - PREVIEW_AVATARS);

  return (
    <div ref={wrapRef} className="relative flex items-center gap-2 shrink-0">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] hidden sm:inline">
        Team
      </span>

      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        className={cn(
          "group flex items-center gap-1.5 rounded-full border bg-[#121826]/90 py-1 pl-1 pr-2 transition-all",
          menuOpen
            ? "border-[#14B8A6]/50 shadow-[0_0_20px_rgba(20,184,166,0.12)]"
            : "border-[#1F2937] hover:border-[#374151]",
        )}
        aria-expanded={menuOpen}
        aria-haspopup="dialog"
      >
        <div className="flex items-center pl-0.5">
          {members.length === 0 ? (
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-[#374151] bg-[#0B0F1A] text-[10px] font-medium text-[#6B7280]">
              —
            </div>
          ) : (
            <div className="flex items-center -space-x-2.5">
              {preview.map((m, i) => (
                <div
                  key={m.userId}
                  className="relative size-8 shrink-0 rounded-full ring-2 ring-[#0B0F1A]"
                  style={{ zIndex: i + 1 }}
                >
                  {m.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- Clerk profile URLs
                    <img
                      src={m.imageUrl}
                      alt=""
                      className="size-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="size-8 rounded-full bg-gradient-to-br from-[#1F2937] to-[#121826] border border-[#2d3a52]" />
                  )}
                </div>
              ))}
              {overflow > 0 ? (
                <div
                  className="relative z-[12] flex size-8 shrink-0 items-center justify-center rounded-full bg-[#1a2235] ring-2 ring-[#0B0F1A] text-[11px] font-bold tabular-nums text-[#14B8A6]"
                  title={`${overflow} more`}
                >
                  +{overflow}
                </div>
              ) : null}
            </div>
          )}
        </div>
        <ChevronDown
          className={cn(
            "size-4 text-[#9CA3AF] transition-transform duration-200",
            menuOpen && "rotate-180 text-[#14B8A6]",
          )}
        />
      </button>

      {menuOpen ? (
        <div
          className="absolute right-0 top-[calc(100%+10px)] z-50 w-[min(calc(100vw-2rem),18rem)] origin-top-right animate-in fade-in zoom-in-95 duration-150"
          role="dialog"
          aria-label="Project team"
        >
          <div className="overflow-hidden rounded-xl border border-[#1F2937] bg-[#121826] shadow-[0_24px_64px_rgba(0,0,0,0.55)]">
            <div className="border-b border-[#1F2937] px-3 py-2.5">
              <p className="text-xs font-semibold text-white">People</p>
              <p className="text-[11px] text-[#6B7280] mt-0.5">
                {members.length} on this project
              </p>
            </div>

            <div className="max-h-[min(60vh,280px)] overflow-y-auto custom-scrollbar">
              {members.length === 0 ? (
                <p className="px-3 py-6 text-center text-xs text-[#9CA3AF]">
                  No one on this project yet.
                </p>
              ) : (
                <ul className="py-1">
                  {members.map((m) => {
                    const isOwnerRow = m.userId === ownerUserId;
                    return (
                      <li
                        key={m.userId}
                        className="flex items-center justify-between gap-2 px-3 py-2 hover:bg-[#1F2937]/50"
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          {m.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={m.imageUrl}
                              alt=""
                              className="size-8 shrink-0 rounded-full border border-[#1F2937] object-cover"
                            />
                          ) : (
                            <div className="size-8 shrink-0 rounded-full border border-[#2d3a52] bg-[#1F2937]" />
                          )}
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-[#E5E7EB]">
                              {m.label}
                            </p>
                            <p className="text-[10px] text-[#6B7280]">
                              {isOwnerRow ? "Owner" : "Member"}
                            </p>
                          </div>
                        </div>
                        {isOwner && !isOwnerRow ? (
                          <form action={remAction}>
                            <input type="hidden" name="project_id" value={projectId} />
                            <input type="hidden" name="clerk_user_id" value={m.userId} />
                            <button
                              type="submit"
                              disabled={remPending}
                              className="rounded-md p-1.5 text-[#9CA3AF] hover:bg-rose-400/10 hover:text-rose-400 transition-colors"
                              title="Remove from project"
                            >
                              <UserMinus className="size-3.5" />
                            </button>
                          </form>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {isOwner && !orgConfigured ? (
              <p className="border-t border-[#1F2937] px-3 py-2 text-[11px] leading-snug text-amber-400/95 bg-amber-400/[0.06]">
                Select an organization from Team to add people from your org.
              </p>
            ) : null}

            {isOwner && orgConfigured && addablePeople.length === 0 && members.length > 0 ? (
              <p className="border-t border-[#1F2937] px-3 py-2 text-[11px] text-[#6B7280]">
                Everyone in your org is already here.
              </p>
            ) : null}

            {err ? (
              <p className="border-t border-[#1F2937] px-3 py-2 text-[11px] text-rose-400">
                {err}
              </p>
            ) : null}

            {isOwner && orgConfigured && addablePeople.length > 0 ? (
              <div className="border-t border-[#1F2937] bg-[#0B0F1A]/40 p-3">
                <form action={addAction} className="flex flex-col gap-2">
                  <input type="hidden" name="project_id" value={projectId} />
                  <label className="text-[11px] font-medium uppercase tracking-wide text-[#6B7280]">
                    Add member
                  </label>
                  <div className="flex gap-2">
                    <select
                      name="clerk_user_id"
                      required
                      defaultValue=""
                      disabled={addPending}
                      className="min-h-9 min-w-0 flex-1 rounded-lg border border-[#1F2937] bg-[#0B0F1A] px-2 text-xs text-white focus-visible:outline-none focus-visible:border-[#14B8A6]"
                    >
                      <option value="" disabled>
                        Choose teammate…
                      </option>
                      {addablePeople.map((p) => (
                        <option key={p.userId} value={p.userId}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={addPending}
                      className="h-9 shrink-0 gap-1 px-3"
                    >
                      <UserPlus className="size-3.5" />
                      Add
                    </Button>
                  </div>
                </form>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
