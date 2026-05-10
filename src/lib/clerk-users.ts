import { clerkClient } from "@clerk/nextjs/server";

export type ClerkUserProfile = {
  label: string;
  imageUrl: string | null;
};

export async function resolveUserProfiles(
  ids: (string | null | undefined)[],
): Promise<Record<string, ClerkUserProfile>> {
  const unique = [...new Set(ids.filter(Boolean) as string[])];
  if (unique.length === 0) return {};
  const client = await clerkClient();
  const out: Record<string, ClerkUserProfile> = {};
  await Promise.all(
    unique.map(async (id) => {
      try {
        const u = await client.users.getUser(id);
        const label =
          [u.firstName, u.lastName].filter(Boolean).join(" ").trim() ||
          u.username ||
          u.primaryEmailAddress?.emailAddress ||
          id.slice(0, 8) + "…";
        out[id] = {
          label,
          imageUrl: u.imageUrl ?? null,
        };
      } catch {
        out[id] = {
          label: id.slice(0, 8) + "…",
          imageUrl: null,
        };
      }
    }),
  );
  return out;
}

export async function resolveAssigneeNames(
  ids: (string | null | undefined)[],
): Promise<Record<string, string>> {
  const profiles = await resolveUserProfiles(ids);
  return Object.fromEntries(
    Object.entries(profiles).map(([k, v]) => [k, v.label]),
  );
}
