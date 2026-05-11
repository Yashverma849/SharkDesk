import { getSupabaseAdminForUser } from "@/lib/supabase/server";
import {
  fetchActivityForOwner,
  fetchProjectsForUser,
} from "@/lib/db/queries";
import { SignInPrompt } from "@/components/auth/SignInPrompt";
import { ActivityView } from "./activity-view";

export default async function ActivityPage() {
  const ctx = await getSupabaseAdminForUser();
  if (!ctx) return <SignInPrompt />;

  const [items, projects] = await Promise.all([
    fetchActivityForOwner(ctx.supabase, ctx.userId),
    fetchProjectsForUser(ctx.supabase, ctx.userId),
  ]);

  const projectNames = Object.fromEntries(
    projects.map((p) => [p.id, p.name]),
  );

  return (
    <div className="flex h-[calc(100dvh-4rem)] min-h-0 max-h-[calc(100dvh-4rem)] w-full flex-col animate-in fade-in duration-300">
      <ActivityView items={items} projectNames={projectNames} />
    </div>
  );
}
