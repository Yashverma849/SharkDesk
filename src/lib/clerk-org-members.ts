import { clerkClient } from "@clerk/nextjs/server";

export type OrgMemberOption = {
  userId: string;
  label: string;
};

export async function listOrganizationMembers(
  organizationId: string,
): Promise<OrgMemberOption[]> {
  const client = await clerkClient();
  const res = await client.organizations.getOrganizationMembershipList({
    organizationId,
    limit: 100,
  });

  const out: OrgMemberOption[] = [];
  for (const m of res.data ?? []) {
    const u = m.publicUserData;
    if (!u?.userId) continue;
    const label =
      [u.firstName, u.lastName].filter(Boolean).join(" ").trim() ||
      u.identifier ||
      u.userId.slice(0, 8) + "…";
    out.push({ userId: u.userId, label });
  }
  return out;
}
