-- altpress print_jobs 테이블
-- 24시간 만료 + 인쇄 카운터를 가진 인쇄 대기열 테이블.
-- 다산어보 Supabase 인스턴스에서 SQL Editor로 실행하세요.

create table if not exists public.print_jobs (
  id            text primary key,
  article_data  jsonb not null,
  layout_type   text not null,
  created_at    timestamptz not null default now(),
  expires_at    timestamptz not null default (now() + interval '24 hours'),
  printed       boolean not null default false,
  print_count   integer not null default 0
);

create index if not exists print_jobs_expires_at_idx
  on public.print_jobs (expires_at);

alter table public.print_jobs enable row level security;

drop policy if exists "anyone can read print_jobs" on public.print_jobs;
create policy "anyone can read print_jobs"
  on public.print_jobs for select
  using (true);

drop policy if exists "anyone can insert print_jobs" on public.print_jobs;
create policy "anyone can insert print_jobs"
  on public.print_jobs for insert
  with check (true);

drop policy if exists "anyone can update print_jobs" on public.print_jobs;
create policy "anyone can update print_jobs"
  on public.print_jobs for update
  using (true);
