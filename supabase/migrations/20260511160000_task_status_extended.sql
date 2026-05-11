-- Extend task workflow statuses (keeps existing todo / in_progress / done).

alter table public.tasks drop constraint if exists tasks_status_check;

alter table public.tasks
  add constraint tasks_status_check
  check (
    status in (
      'todo',
      'in_progress',
      'done',
      'under_review',
      'blocked',
      'change_requested',
      'on_hold'
    )
  );

comment on column public.tasks.status is 'Task workflow: todo, in_progress, done, under_review, blocked, change_requested, on_hold.';
