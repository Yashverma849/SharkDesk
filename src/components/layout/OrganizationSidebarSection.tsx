"use client";

import Link from "next/link";
import { Users } from "lucide-react";
import { Show, useOrganization } from "@clerk/nextjs";
import { useSidebar } from "@/components/layout/sidebar-context";
import { cn } from "@/lib/utils";

export function OrganizationSidebarSection() {
  return (
    <Show when="signed-in">
      <OrganizationSidebarInner />
    </Show>
  );
}

function OrganizationSidebarInner() {
  const { collapsed } = useSidebar();
  const { organization, isLoaded } = useOrganization();

  if (!isLoaded) {
    return (
      <div
        className={cn(
          "mb-3 animate-pulse rounded-xl border border-[#1F2937] bg-[#121826]/60",
          collapsed ? "mx-2 px-2 py-3" : "mx-3 px-3 py-3",
        )}
      >
        <div className="mx-auto h-8 w-8 rounded-full bg-[#1F2937]" />
      </div>
    );
  }

  if (!organization) {
    if (collapsed) {
      return (
        <Link
          href="/team"
          title="Organization — select in Team"
          className="mx-2 mb-3 flex justify-center rounded-xl border border-[#1F2937]/80 bg-[#121826]/40 p-2.5 text-[#6B7280] transition-colors hover:border-[#374151] hover:text-[#9CA3AF]"
        >
          <Users className="h-5 w-5 shrink-0" />
        </Link>
      );
    }
    return (
      <div className="mx-3 mb-3 rounded-xl border border-[#1F2937]/80 bg-[#121826]/40 px-3 py-3">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
          Organization
        </p>
        <p className="text-xs leading-snug text-[#9CA3AF]">
          Select or create an organization in Team to collaborate.
        </p>
      </div>
    );
  }

  const count = organization.membersCount ?? 0;

  if (collapsed) {
    return (
      <Link
        href="/team"
        title={`${organization.name} · ${count} member${count === 1 ? "" : "s"}`}
        className="mx-2 mb-3 flex flex-col items-center gap-0.5 rounded-xl border border-[#1F2937] bg-[#121826]/80 py-2.5 transition-colors hover:border-[#14B8A6]/30 hover:bg-[#121826]"
      >
        <Users className="h-5 w-5 shrink-0 text-[#14B8A6]" />
        <span className="text-[10px] font-semibold tabular-nums text-[#14B8A6]">
          {count}
        </span>
      </Link>
    );
  }

  return (
    <Link
      href="/team"
      className="mx-3 mb-3 block rounded-xl border border-[#1F2937] bg-[#121826]/80 px-3 py-3 transition-colors hover:border-[#14B8A6]/30 hover:bg-[#121826]"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
          Organization
        </p>
        <Users className="h-4 w-4 shrink-0 text-[#14B8A6] opacity-80" />
      </div>
      <p
        className="mb-1 truncate text-sm font-medium text-white"
        title={organization.name}
      >
        {organization.name}
      </p>
      <p className="text-xs text-[#9CA3AF]">
        <span className="font-semibold text-[#14B8A6]">{count}</span>
        {count === 1 ? " member" : " members"}
      </p>
    </Link>
  );
}
