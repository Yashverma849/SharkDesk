-- Add optional detailed comment/description for tasks.
alter table public.tasks
  add column if not exists comment text;

comment on column public.tasks.comment is 'Optional detailed description/comment for the task (shown in My Work and project task lists).';

