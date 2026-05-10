-- Optional target deadline for projects (create flow + display).
alter table public.projects
  add column if not exists deadline timestamptz null;

comment on column public.projects.deadline is 'Optional project target deadline.';
