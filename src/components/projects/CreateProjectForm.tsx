"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createProjectAction } from "@/app/actions/projects";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { LogoLoader } from "@/components/ui/LogoLoader";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, Plus, Search } from "lucide-react";

type AddablePerson = { userId: string; label: string };

type Props = {
  addablePeople: AddablePerson[];
  orgConfigured: boolean;
};

export function CreateProjectForm({ addablePeople, orgConfigured }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createProjectAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const membersWrapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedList = useMemo(() => {
    return addablePeople.filter((p) => selectedIds.has(p.userId));
  }, [addablePeople, selectedIds]);

  const filteredPeople = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return addablePeople;
    return addablePeople.filter((p) => p.label.toLowerCase().includes(q));
  }, [addablePeople, searchQuery]);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      setOpen(false);
      router.refresh();
    }
  }, [state?.ok, router]);

  useEffect(() => {
    if (!open) {
      setDropdownOpen(false);
      setSearchQuery("");
      setSelectedIds(new Set());
    }
  }, [open]);

  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      if (
        membersWrapRef.current &&
        !membersWrapRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("pointerdown", handlePointerDown);
      return () =>
        document.removeEventListener("pointerdown", handlePointerDown);
    }
  }, [dropdownOpen]);

  useEffect(() => {
    if (dropdownOpen) {
      searchInputRef.current?.focus();
    } else {
      setSearchQuery("");
    }
  }, [dropdownOpen]);

  function toggleMember(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const triggerSummary =
    selectedList.length === 0
      ? "Select members…"
      : selectedList.length === 1
        ? selectedList[0].label
        : `${selectedList.length} members selected`;

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        className="shrink-0 gap-2 shadow-[0_0_20px_rgba(20,184,166,0.15)]"
      >
        <Plus className="h-4 w-4" strokeWidth={2} />
        Create project
      </Button>

      <Modal
        isOpen={open}
        onClose={() => !pending && setOpen(false)}
        title="Create project"
        className="max-w-md border-[#1F2937] bg-[#121826]"
      >
        <form ref={formRef} action={formAction} className="flex flex-col gap-5">
          {[...selectedIds].map((id) => (
            <input key={id} type="hidden" name="member_ids" value={id} />
          ))}

          <div className="space-y-2">
            <label htmlFor="create-project-name" className="text-xs font-medium text-[#9CA3AF]">
              Project name <span className="text-rose-400">*</span>
            </label>
            <Input
              id="create-project-name"
              name="name"
              placeholder="e.g. Website redesign"
              required
              disabled={pending}
              autoComplete="off"
              className="border-[#1F2937] bg-[#0B0F1A] text-white placeholder:text-[#6B7280]"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="create-project-deadline" className="text-xs font-medium text-[#9CA3AF]">
              Deadline <span className="font-normal text-[#6B7280]">(optional)</span>
            </label>
            <Input
              id="create-project-deadline"
              name="deadline"
              type="date"
              disabled={pending}
              className="border-[#1F2937] bg-[#0B0F1A] text-white scheme-dark"
            />
          </div>

          <div className="space-y-2">
            <span id="add-members-label" className="text-xs font-medium text-[#9CA3AF]">
              Add members
            </span>
            {!orgConfigured ? (
              <p className="rounded-lg border border-dashed border-[#374151] bg-[#0B0F1A]/80 px-3 py-2.5 text-xs leading-relaxed text-[#9CA3AF]">
                Choose an organization in{" "}
                <span className="font-medium text-[#E5E7EB]">Team</span> in the sidebar to add
                members from your org to this project.
              </p>
            ) : addablePeople.length === 0 ? (
              <p className="rounded-lg border border-dashed border-[#374151] bg-[#0B0F1A]/80 px-3 py-2.5 text-xs leading-relaxed text-[#9CA3AF]">
                You&apos;re the only member in this organization. Invite teammates from{" "}
                <span className="font-medium text-[#E5E7EB]">Team</span>, then you can add them
                here when creating a project.
              </p>
            ) : (
              <div ref={membersWrapRef} className="relative">
                <button
                  type="button"
                  id="add-members-trigger"
                  disabled={pending}
                  onClick={() => setDropdownOpen((v) => !v)}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="listbox"
                  aria-labelledby="add-members-label add-members-trigger"
                  className={cn(
                    "flex h-10 w-full items-center justify-between gap-2 rounded-md border border-[#1F2937] bg-[#0B0F1A] px-3 text-left text-sm text-[#E5E7EB] transition-colors",
                    "hover:border-[#374151] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]/50",
                    pending && "cursor-not-allowed opacity-50",
                  )}
                >
                  <span
                    className={cn(
                      "truncate",
                      selectedList.length === 0 && "text-[#6B7280]",
                    )}
                  >
                    {triggerSummary}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-[#9CA3AF] transition-transform",
                      dropdownOpen && "rotate-180",
                    )}
                  />
                </button>

                {dropdownOpen ? (
                  <div
                    className="absolute left-0 right-0 top-[calc(100%+4px)] z-[120] overflow-hidden rounded-lg border border-[#1F2937] bg-[#0B0F1A] shadow-[0_16px_40px_rgba(0,0,0,0.45)]"
                    role="listbox"
                    aria-multiselectable="true"
                  >
                    <div className="border-b border-[#1F2937] p-2">
                      <div className="relative">
                        <Search
                          className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]"
                          aria-hidden
                        />
                        <Input
                          ref={searchInputRef}
                          type="search"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search by name…"
                          autoComplete="off"
                          className="border-[#1F2937] bg-[#121826] py-2 pl-9 text-white placeholder:text-[#6B7280]"
                          onKeyDown={(e) => {
                            if (e.key === "Escape") setDropdownOpen(false);
                          }}
                        />
                      </div>
                    </div>
                    <ul className="max-h-48 overflow-y-auto custom-scrollbar p-1">
                      {filteredPeople.map((p) => {
                        const isOn = selectedIds.has(p.userId);
                        return (
                          <li key={p.userId} role="option" aria-selected={isOn}>
                            <button
                              type="button"
                              onClick={() => toggleMember(p.userId)}
                              className={cn(
                                "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-[#E5E7EB] transition-colors",
                                isOn
                                  ? "bg-[#14B8A6]/15 text-white"
                                  : "hover:bg-[#121826]",
                              )}
                            >
                              <span
                                className={cn(
                                  "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                                  isOn
                                    ? "border-[#14B8A6] bg-[#14B8A6]"
                                    : "border-[#374151] bg-[#0B0F1A]",
                                )}
                                aria-hidden
                              >
                                {isOn ? (
                                  <Check className="h-3 w-3 text-[#0B0F1A]" strokeWidth={3} />
                                ) : null}
                              </span>
                              <span className="min-w-0 truncate">{p.label}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                    {filteredPeople.length === 0 ? (
                      <p className="border-t border-[#1F2937] px-3 py-3 text-center text-xs text-[#6B7280]">
                        No members match your search.
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {state?.error ? (
            <p className="text-sm text-rose-400" role="alert">
              {state.error}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              disabled={pending}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending} aria-busy={pending}>
              {pending ? <LogoLoader size="button" /> : "Create project"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
