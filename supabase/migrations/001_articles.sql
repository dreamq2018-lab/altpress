-- altpress 전용 테이블
-- 다산어보 Supabase 인스턴스에서 SQL Editor로 실행하세요.
-- 이름을 `altpress_articles`로 분리해 다른 프로젝트의 기존 `articles` 테이블과 충돌 회피.

create table if not exists public.altpress_articles (
  id              text primary key,                    -- nanoid(8) — URL slug
  type            text not null,                       -- 'travel' | 'reporter' | 'editor'
  layout          text not null,                       -- 'thermal' | 'tabloid'
  headline        text not null,
  subtitle        text not null,
  body            text not null,
  byline          text not null,
  date            text not null,                       -- YYYY-MM-DD (사용자 입력)
  location        text not null,
  author_name     text not null,
  media_name      text not null,
  media_name_hanja text,
  issue_number    text,
  created_at      timestamptz not null default now()
);

create index if not exists altpress_articles_created_at_idx
  on public.altpress_articles (created_at desc);

-- RLS — 익명 anon 키로 INSERT/SELECT만 허용.
alter table public.altpress_articles enable row level security;

-- 누구나 단건 조회 가능 (QR로 공유되는 게 정상)
drop policy if exists "altpress_articles_select_anon" on public.altpress_articles;
create policy "altpress_articles_select_anon"
  on public.altpress_articles
  for select
  to anon
  using (true);

-- 익명 키로 INSERT 허용
drop policy if exists "altpress_articles_insert_anon" on public.altpress_articles;
create policy "altpress_articles_insert_anon"
  on public.altpress_articles
  for insert
  to anon
  with check (true);
