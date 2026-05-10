import { getSupabaseAdminForUser } from "@/lib/supabase/server";
import { fetchActivityForOwner } from "@/lib/db/queries";
import { formatActivityWhen } from "@/lib/db/mappers";
import { SignInPrompt } from "@/components/auth/SignInPrompt";

export default async function ActivityPage() {
  const ctx = await getSupabaseAdminForUser();
  if (!ctx) return <SignInPrompt />;

  const items = await fetchActivityForOwner(ctx.supabase, ctx.userId);

  return (
    <div className="flex flex-col min-h-full w-full animate-in fade-in duration-300">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">
          Activity
        </h1>
        <p className="text-[#9CA3AF] font-medium text-sm">
          Recent updates and changes
        </p>
      </div>

      <div className="bg-[#121826] border border-[#1F2937] rounded-xl overflow-hidden">
        {items.length === 0 ? (
          <div className="p-12 text-center text-[#9CA3AF] text-sm">
            No activity yet. Creating projects and tasks will show up here.
          </div>
        ) : (
          <ul className="divide-y divide-[#1F2937]">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-4 p-4 hover:bg-[#1F2937] transition-colors group"
              >
                <div className="h-2 w-2 rounded-full bg-[#14B8A6] shrink-0" />
                <span className="text-sm font-medium text-[#E5E7EB] flex-1">
                  {item.summary}
                </span>
                <span className="text-xs text-[#9CA3AF] shrink-0">
                  {formatActivityWhen(item.created_at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
