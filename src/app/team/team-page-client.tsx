"use client";

import { useState } from "react";
import {
  OrganizationSwitcher,
  useOrganization,
  useUser,
} from "@clerk/nextjs";
import { Users } from "lucide-react";
import { LogoLoader } from "@/components/ui/LogoLoader";
import { mergeSharkdeskAppearance } from "@/lib/clerk-appearance";
import { cn } from "@/lib/utils";
import { formatOrganizationRole } from "@/lib/clerk-org-role";

const orgSwitcherNoOrgAppearance = mergeSharkdeskAppearance({
  elements: {
    rootBox: "w-full max-w-full",
    organizationSwitcherTrigger:
      "w-full justify-between rounded-lg border border-[#1F2937] bg-[#0B0F1A] px-3 py-2 text-sm !text-white hover:bg-[#121826] focus:shadow-none transition-colors",
    organizationPreviewMainIdentifier: "!text-white font-medium",
    organizationSwitcherTriggerIcon: "!text-[#9CA3AF]",
    organizationPreviewSecondaryIdentifier: "!text-[#9CA3AF]",
  },
});

const orgSwitcherWithOrgAppearance = mergeSharkdeskAppearance({
  elements: {
    organizationSwitcherTrigger:
      "rounded-lg border border-[#1F2937] bg-[#121826] px-3 py-2 text-sm !text-white hover:bg-[#1a2235] focus:shadow-none transition-colors",
    organizationPreviewMainIdentifier: "!text-white font-medium",
    organizationSwitcherTriggerIcon: "!text-[#9CA3AF]",
    organizationPreviewSecondaryIdentifier: "!text-[#9CA3AF]",
  },
});

const TABS = [
  { id: "overview" as const, label: "Overview" },
  { id: "members" as const, label: "Members" },
];

export function TeamPageClient() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("overview");
  const { user } = useUser();
  const {
    organization,
    membership,
    memberships,
    isLoaded,
  } = useOrganization({
    memberships: {
      pageSize: 50,
      keepPreviousData: true,
    },
  });

  if (!isLoaded) {
    return <LogoLoader size="page" />;
  }

  if (!organization) {
    return (
      <div className="max-w-lg">
        <p className="text-[#9CA3AF] text-sm mb-6">
          Choose an organization to see members and manage your team.
        </p>
        <div className="rounded-xl border border-[#1F2937] bg-[#121826] p-6">
          <p className="text-sm font-medium text-[#E5E7EB] mb-4">
            Switch organization
          </p>
          <OrganizationSwitcher
            hidePersonal
            afterSelectOrganizationUrl="/team"
            appearance={orgSwitcherNoOrgAppearance}
          />
        </div>
      </div>
    );
  }

  const memberRows = memberships?.data ?? [];
  const total =
    memberships?.count ?? organization.membersCount ?? memberRows.length;

  return (
    <div className="flex flex-col min-h-full w-full animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-[#9CA3AF] font-bold text-lg tracking-tight">
            {organization.name}
          </p>
        </div>
        <OrganizationSwitcher
          hidePersonal
          afterSelectOrganizationUrl="/team"
          appearance={orgSwitcherWithOrgAppearance}
        />
      </div>

      <div className="flex gap-1 p-1 rounded-xl bg-[#121826] border border-[#1F2937] w-fit mb-8">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              tab === t.id
                ? "bg-[#14B8A6]/15 text-[#14B8A6] shadow-sm"
                : "text-[#9CA3AF] hover:text-white",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid gap-4 sm:grid-cols-2 max-w-3xl">
          <div className="rounded-xl border border-[#1F2937] bg-[#121826] p-6">
            <div className="flex items-center gap-2 text-[#9CA3AF] text-xs font-semibold uppercase tracking-wider mb-3">
              <Users className="w-4 h-4 text-[#14B8A6]" />
              Members
            </div>
            <p className="text-3xl font-bold text-white tabular-nums">
              {organization.membersCount ?? total}
            </p>
            <p className="text-sm text-[#9CA3AF] mt-1">people in this organization</p>
          </div>
          <div className="rounded-xl border border-[#1F2937] bg-[#121826] p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] mb-3">
              Your role
            </p>
            <p className="text-lg font-semibold text-white">
              {formatOrganizationRole(membership?.role)}
            </p>
            <p className="text-sm text-[#9CA3AF] mt-1 truncate" title={user?.primaryEmailAddress?.emailAddress}>
              {user?.primaryEmailAddress?.emailAddress ?? ""}
            </p>
          </div>
        </div>
      )}

      {tab === "members" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {memberRows.length === 0 ? (
            <div className="col-span-full py-20 text-center rounded-2xl border border-dashed border-[#1F2937] bg-[#121826]/50">
              <Users className="w-10 h-10 text-[#1F2937] mx-auto mb-3" />
              <p className="text-[#9CA3AF] text-sm">No members found</p>
            </div>
          ) : (
            memberRows.map((m) => {
              const u = m.publicUserData;
              const label =
                [u?.firstName, u?.lastName].filter(Boolean).join(" ").trim() ||
                u?.identifier ||
                "Member";
              
              return (
                <div 
                  key={m.id} 
                  className="group relative flex flex-col items-center text-center p-6 rounded-2xl bg-[#121826] border border-[#1F2937] hover:border-[#14B8A6]/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(20,184,166,0.1)] overflow-hidden"
                >
                  {/* ID Card Accent */}
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#14B8A6] to-cyan-500 opacity-80" />
                  
                  {/* Avatar Container */}
                  <div className="relative mb-4 mt-2">
                    <div className="absolute inset-0 rounded-full bg-[#14B8A6] blur-lg opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
                    {u?.imageUrl ? (
                      <div className="relative size-20 rounded-full p-1 border-2 border-[#1F2937] group-hover:border-[#14B8A6] transition-colors duration-300">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={u.imageUrl}
                          alt={label}
                          className="size-full rounded-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="size-20 rounded-full bg-[#1F2937] border-2 border-[#2d3a52] flex items-center justify-center">
                        <Users className="size-8 text-[#9CA3AF]" />
                      </div>
                    )}
                  </div>

                  {/* Member Info */}
                  <div className="space-y-1 mb-4">
                    <h3 className="text-lg font-bold text-white tracking-tight leading-tight group-hover:text-[#14B8A6] transition-colors">
                      {label}
                    </h3>
                    {u?.identifier ? (
                      <p className="text-xs text-[#9CA3AF] font-mono opacity-80 uppercase tracking-widest">
                        {u.identifier}
                      </p>
                    ) : null}
                  </div>

                  {/* Role Badge */}
                  <div className="mt-auto w-full pt-4 border-t border-[#1F2937]/50">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#14B8A6]/10 text-[#14B8A6] border border-[#14B8A6]/20 shadow-sm">
                      {formatOrganizationRole(String(m.role))}
                    </span>
                  </div>

                  {/* Card ID "Stamp" for aesthetic */}
                  <div className="absolute bottom-2 right-4 opacity-10 pointer-events-none select-none">
                    <p className="text-[10px] font-mono text-white">SD-ID-{m.id.slice(-6).toUpperCase()}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
