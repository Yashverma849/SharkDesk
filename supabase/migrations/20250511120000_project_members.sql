-- People on a project (for assignment and collaboration).
-- Owner is also inserted into this table when a project is created (see app + backfill).

create table public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  clerk_user_id text not null,
  created_at timestamptz not null default now(),
  unique (project_id, clerk_user_id)
);

create index project_members_project_idx on public.project_members (project_id);
create index project_members_user_idx on public.project_members (clerk_user_id);

comment on table public.project_members is 'Users who belong to a project (can view/create tasks per app rules).';

-- Backfill: treat existing project owners as members
insert into public.project_members (project_id, clerk_user_id)
select id, owner_clerk_user_id from public.projects
on conflict (project_id, clerk_user_id) do nothing;

alter table public.project_members enable row level security;

create policy project_members_select
  on public.project_members for select
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_members.project_id
        and p.owner_clerk_user_id = public.clerk_sub()
    )
    or project_members.clerk_user_id = public.clerk_sub()
    or exists (
      select 1 from public.project_members pm
      where pm.project_id = project_members.project_id
        and pm.clerk_user_id = public.clerk_sub()
    )
  );

create policy project_members_insert_owner
  on public.project_members for insert
  with check (
    exists (
      select 1 from public.projects p
      where p.id = project_id
        and p.owner_clerk_user_id = public.clerk_sub()
    )
  );

create policy project_members_delete_owner
  on public.project_members for delete
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_members.project_id
        and p.owner_clerk_user_id = public.clerk_sub()
    )
  );
