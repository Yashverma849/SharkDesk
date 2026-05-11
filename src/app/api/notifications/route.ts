import { NextResponse } from "next/server";
import { getSupabaseAdminForUser } from "@/lib/supabase/server";
import {
  fetchActivityForOwner,
  fetchReadActivityIdsForUser,
  markNotificationReadForUser,
} from "@/lib/db/queries";
import { mapActivityToNotifications } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const ctx = await getSupabaseAdminForUser();
    if (!ctx) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const [activityRows, readIds] = await Promise.all([
      fetchActivityForOwner(ctx.supabase, ctx.userId, 120),
      fetchReadActivityIdsForUser(ctx.supabase, ctx.userId),
    ]);
    const notifications = mapActivityToNotifications(activityRows, readIds);
    const unreadCount = notifications.filter((n) => n.unread).length;

    return NextResponse.json(
      {
        notifications,
        unreadCount,
        fetchedAt: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load notifications";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await getSupabaseAdminForUser();
    if (!ctx) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = (await request.json()) as { notificationId?: string };
    const notificationId = String(body.notificationId ?? "").trim();
    if (!notificationId) {
      return NextResponse.json(
        { error: "notificationId is required" },
        { status: 400 },
      );
    }

    await markNotificationReadForUser(ctx.supabase, ctx.userId, notificationId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update notification";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
