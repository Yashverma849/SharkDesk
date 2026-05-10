"use client";

import { useState } from "react";
import {
  OrganizationSwitcher,
  useOrganization,
  useUser,
} from "@clerk/nextjs";
import { Users } from "lucide-react";
import { LogoLoader } from "@/components/ui/LogoLoader";
import { cn } from "@/lib/utils";
import { formatOrganizationRole } from "@/lib/clerk-org-role";

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
        <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Team</h1>
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
            appearance={{
              elements: {
                rootBox: "w-full max-w-full",
                organizationSwitcherTrigger:
                  "w-full justify-between rounded-lg border border-[#1F2937] bg-[#0B0F1A] px-3 py-2 text-sm text-white",
              },
            }}
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
          <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">
            Team
          </h1>
          <p className="text-[#9CA3AF] font-medium text-sm">
            {organization.name}
          </p>
        </div>
        <OrganizationSwitcher
          hidePersonal
          afterSelectOrganizationUrl="/team"
          appearance={{
            elements: {
              organizationSwitcherTrigger:
                "rounded-lg border border-[#1F2937] bg-[#121826] px-3 py-2 text-sm text-white hover:bg-[#1a2235]",
            },
          }}
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
        <div className="bg-[#121826] border border-[#1F2937] rounded-xl overflow-hidden max-w-4xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#1F2937] bg-[#0B0F1A]/50">
                <tr>
                  <th className="px-4 py-3 font-medium text-[#9CA3AF]">Member</th>
                  <th className="px-4 py-3 font-medium text-[#9CA3AF]">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2937]">
                {memberRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={2}
                      className="px-4 py-10 text-center text-[#9CA3AF] text-sm"
                    >
                      No members loaded. Ensure organization memberships are enabled in Clerk.
                    </td>
                  </tr>
                ) : (
                  memberRows.map((m) => {
                    const u = m.publicUserData;
                    const label =
                      [u?.firstName, u?.lastName].filter(Boolean).join(" ").trim() ||
                      u?.identifier ||
                      "Member";
                    return (
                      <tr key={m.id} className="hover:bg-[#1F2937]/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {u?.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element -- Clerk-hosted avatar URLs
                              <img
                                src={u.imageUrl}
                                alt=""
                                width={32}
                                height={32}
                                className="rounded-full border border-[#1F2937] size-8 object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-[#1F2937] border border-[#2d3a52]" />
                            )}
                            <div>
                              <p className="font-medium text-[#E5E7EB]">{label}</p>
                              {u?.identifier ? (
                                <p className="text-xs text-[#9CA3AF]">{u.identifier}</p>
                              ) : null}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[#9CA3AF]">
                          {formatOrganizationRole(String(m.role))}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
