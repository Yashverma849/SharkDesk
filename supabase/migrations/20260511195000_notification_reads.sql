-- Persist per-user read state for activity-backed notifications.
create table if not exists public.notification_reads (
  activity_event_id uuid not null references public.activity_events(id) on delete cascade,
  clerk_user_id text not null,
  read_at timestamptz not null default now(),
  primary key (activity_event_id, clerk_user_id)
);

create index if not exists notification_reads_user_read_at_idx
  on public.notification_reads (clerk_user_id, read_at desc);

comment on table public.notification_reads is 'Tracks which activity events have been marked as read by each Clerk user.';

alter table public.notification_reads enable row level security;

drop policy if exists notification_reads_select_own on public.notification_reads;
create policy notification_reads_select_own
  on public.notification_reads for select
  using (clerk_user_id = public.clerk_sub());

drop policy if exists notification_reads_insert_own on public.notification_reads;
create policy notification_reads_insert_own
  on public.notification_reads for insert
  with check (clerk_user_id = public.clerk_sub());
