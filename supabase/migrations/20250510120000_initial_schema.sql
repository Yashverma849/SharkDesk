-- SharkDesk core schema (no Supabase Auth users — identities come from Clerk).
-- Row Level Security expects JWT `sub` = Clerk user id after Supabase ↔ Clerk JWT is configured.
-- See: https://supabase.com/docs/guides/auth/third-party/clerk

-- -----------------------------------------------------------------------------
-- Helpers
-- -----------------------------------------------------------------------------

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.clerk_sub()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((auth.jwt()->>'sub'), '');
$$;

comment on function public.clerk_sub() is 'JWT subject; must match Clerk user id when using Supabase with Clerk-issued tokens.';

-- -----------------------------------------------------------------------------
-- projects
-- -----------------------------------------------------------------------------

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_clerk_user_id text not null,
  name text not null,
  status text not null default 'active'
    check (status in ('active', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index projects_owner_idx on public.projects (owner_clerk_user_id);
create index projects_owner_status_idx on public.projects (owner_clerk_user_id, status);

comment on table public.projects is 'Workspace projects; ownership is Clerk user id (no local auth table).';
comment on column public.projects.owner_clerk_user_id is 'Clerk user id of the owner (matches JWT sub when RLS applies).';

drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at
  before update on public.projects
  for each row execute function public.handle_updated_at();

-- -----------------------------------------------------------------------------
-- tasks
-- -----------------------------------------------------------------------------

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  title text not null,
  assignee_clerk_user_id text,
  due_date date,
  priority text not null default 'medium'
    check (priority in ('low', 'medium', 'high')),
  status text not null default 'todo'
    check (status in ('todo', 'in_progress', 'done')),
  created_by_clerk_user_id text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tasks_project_idx on public.tasks (project_id);
create index tasks_assignee_idx on public.tasks (assignee_clerk_user_id)
  where assignee_clerk_user_id is not null;
create index tasks_project_sort_idx on public.tasks (project_id, sort_order);

comment on table public.tasks is 'Tasks belong to a project; assignee is optional Clerk user id.';
comment on column public.tasks.title is 'Shown as Task name in UI.';
comment on column public.tasks.sort_order is 'Optional ordering within a project board/list.';

drop trigger if exists set_tasks_updated_at on public.tasks;
create trigger set_tasks_updated_at
  before update on public.tasks
  for each row execute function public.handle_updated_at();

-- -----------------------------------------------------------------------------
-- activity_events (Activity feed)
-- -----------------------------------------------------------------------------

create table public.activity_events (
  id uuid primary key default gen_random_uuid(),
  owner_clerk_user_id text not null,
  project_id uuid references public.projects (id) on delete set null,
  task_id uuid references public.tasks (id) on delete set null,
  summary text not null,
  actor_clerk_user_id text,
  event_type text,
  created_at timestamptz not null default now()
);

-- CHECK cannot reference other rows; enforce owner/project consistency with a trigger.
create or replace function public.enforce_activity_project_owner()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.project_id is not null then
    if not exists (
      select 1 from public.projects p
      where p.id = new.project_id
        and p.owner_clerk_user_id = new.owner_clerk_user_id
    ) then
      raise exception 'activity_events.owner_clerk_user_id must match owning project';
    end if;
  end if;
  if new.task_id is not null and new.project_id is not null then
    if not exists (
      select 1 from public.tasks t
      where t.id = new.task_id
        and t.project_id = new.project_id
    ) then
      raise exception 'activity_events.task_id must belong to activity_events.project_id';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists activity_events_check_project_owner on public.activity_events;
create trigger activity_events_check_project_owner
  before insert or update on public.activity_events
  for each row execute function public.enforce_activity_project_owner();

create index activity_owner_created_idx on public.activity_events (owner_clerk_user_id, created_at desc);

comment on table public.activity_events is 'Append-only feed rows scoped to a workspace owner (denormalized for RLS).';
comment on column public.activity_events.owner_clerk_user_id is 'Workspace owner whose Activity tab lists this row (usually project owner).';

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------

alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.activity_events enable row level security;

-- Projects: full access for owner
create policy projects_select_own
  on public.projects for select
  using (owner_clerk_user_id = public.clerk_sub());

create policy projects_insert_own
  on public.projects for insert
  with check (owner_clerk_user_id = public.clerk_sub());

create policy projects_update_own
  on public.projects for update
  using (owner_clerk_user_id = public.clerk_sub())
  with check (owner_clerk_user_id = public.clerk_sub());

create policy projects_delete_own
  on public.projects for delete
  using (owner_clerk_user_id = public.clerk_sub());

-- Tasks: project owner or assignee may read; owner creates/deletes; owner or assignee updates
create policy tasks_select_visible
  on public.tasks for select
  using (
    exists (
      select 1 from public.projects p
      where p.id = tasks.project_id
        and (
          p.owner_clerk_user_id = public.clerk_sub()
          or tasks.assignee_clerk_user_id = public.clerk_sub()
        )
    )
  );

create policy tasks_insert_owner
  on public.tasks for insert
  with check (
    exists (
      select 1 from public.projects p
      where p.id = project_id
        and p.owner_clerk_user_id = public.clerk_sub()
    )
  );

create policy tasks_update_visible
  on public.tasks for update
  using (
    exists (
      select 1 from public.projects p
      where p.id = tasks.project_id
        and (
          p.owner_clerk_user_id = public.clerk_sub()
          or tasks.assignee_clerk_user_id = public.clerk_sub()
        )
    )
  )
  with check (
    exists (
      select 1 from public.projects p
      where p.id = project_id
        and (
          p.owner_clerk_user_id = public.clerk_sub()
          or tasks.assignee_clerk_user_id = public.clerk_sub()
        )
    )
  );

create policy tasks_delete_owner
  on public.tasks for delete
  using (
    exists (
      select 1 from public.projects p
      where p.id = tasks.project_id
        and p.owner_clerk_user_id = public.clerk_sub()
    )
  );

-- Activity: readable by workspace owner; inserts only by owner (app/server writes)
create policy activity_select_own
  on public.activity_events for select
  using (owner_clerk_user_id = public.clerk_sub());

create policy activity_insert_own
  on public.activity_events for insert
  with check (owner_clerk_user_id = public.clerk_sub());
