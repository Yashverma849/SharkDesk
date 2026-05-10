/**
 * Maps Clerk organization role keys to display labels.
 * Default Clerk roles use keys like `org:admin` and `org:member`.
 * Add a **Manager** role in Clerk Dashboard (Organizations → Roles), e.g. `org:manager`.
 */
const LABELS: Record<string, string> = {
  "org:admin": "Admin",
  "org:member": "Member",
  "org:manager": "Manager",
};

export function formatOrganizationRole(
  role: string | undefined | null,
): string {
  if (!role) return "Member";
  if (LABELS[role]) return LABELS[role];
  const tail = role.startsWith("org:") ? role.slice(4) : role;
  return tail
    .split(/[:_]/)
    .filter(Boolean)
    .map(
      (s) =>
        s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(),
    )
    .join(" ");
}
