import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

function getSupabaseEnv() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.supabase_url;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.supabase_service_role_key;
  if (!url || !serviceKey) {
    throw new Error(
      "Missing Supabase URL or service role key (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).",
    );
  }
  return { url, serviceKey };
}

/**
 * Server-only admin client. RLS is bypassed — every query must scope by Clerk userId from auth().
 * Switch to Clerk-signed JWT + anon key later if you want DB-enforced RLS.
 */
export async function getSupabaseAdminForUser(): Promise<{
  supabase: SupabaseClient;
  userId: string;
} | null> {
  const { userId } = await auth();
  if (!userId) return null;
  const { url, serviceKey } = getSupabaseEnv();
  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return { supabase, userId };
}
