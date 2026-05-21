-- altpress 광고 테이블
-- 다산어보 Supabase 인스턴스에서 SQL Editor로 실행하세요.

create table if not exists public.altpress_ads (
  id          uuid primary key default gen_random_uuid(),
  advertiser  text not null,
  message     text not null,
  sub_message text,
  locations   text[] not null,
  active      boolean not null default true,
  starts_at   date,
  ends_at     date,
  created_at  timestamptz not null default now()
);

create index if not exists ads_active_locations_idx
  on public.altpress_ads (active, locations);

alter table public.altpress_ads enable row level security;

drop policy if exists "anyone can read ads" on public.altpress_ads;
create policy "anyone can read ads"
  on public.altpress_ads for select using (true);

drop policy if exists "anyone can insert ads" on public.altpress_ads;
create policy "anyone can insert ads"
  on public.altpress_ads for insert with check (true);

drop policy if exists "anyone can update ads" on public.altpress_ads;
create policy "anyone can update ads"
  on public.altpress_ads for update using (true);

drop policy if exists "anyone can delete ads" on public.altpress_ads;
create policy "anyone can delete ads"
  on public.altpress_ads for delete using (true);
