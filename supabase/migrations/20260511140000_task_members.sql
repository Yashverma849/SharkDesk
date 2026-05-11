-- Additional collaborators on a task (primary assignee remains tasks.assignee_clerk_user_id).

create table public.task_members (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  clerk_user_id text not null,
  created_at timestamptz not null default now(),
  unique (task_id, clerk_user_id)
);

create index task_members_task_idx on public.task_members (task_id);
create index task_members_user_idx on public.task_members (clerk_user_id);

comment on table public.task_members is 'Extra collaborators on a task beyond the primary assignee.';

alter table public.task_members enable row level security;

create policy task_members_select
  on public.task_members for select
  using (
    exists (
      select 1
      from public.tasks t
      join public.projects p on p.id = t.project_id
      where t.id = task_members.task_id
        and (
          p.owner_clerk_user_id = public.clerk_sub()
          or t.assignee_clerk_user_id = public.clerk_sub()
          or exists (
            select 1 from public.project_members pm
            where pm.project_id = t.project_id
              and pm.clerk_user_id = public.clerk_sub()
          )
        )
    )
  );

create policy task_members_insert_project
  on public.task_members for insert
  with check (
    exists (
      select 1
      from public.tasks t
      join public.projects p on p.id = t.project_id
      where t.id = task_id
        and (
          p.owner_clerk_user_id = public.clerk_sub()
          or t.assignee_clerk_user_id = public.clerk_sub()
          or exists (
            select 1 from public.project_members pm
            where pm.project_id = t.project_id
              and pm.clerk_user_id = public.clerk_sub()
          )
        )
    )
  );

create policy task_members_delete_project
  on public.task_members for delete
  using (
    exists (
      select 1
      from public.tasks t
      join public.projects p on p.id = t.project_id
      where t.id = task_members.task_id
        and (
          p.owner_clerk_user_id = public.clerk_sub()
          or t.assignee_clerk_user_id = public.clerk_sub()
          or exists (
            select 1 from public.project_members pm
            where pm.project_id = t.project_id
              and pm.clerk_user_id = public.clerk_sub()
          )
        )
    )
  );
