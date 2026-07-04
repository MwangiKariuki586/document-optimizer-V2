create table if not exists public.document_snapshot_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  document_id uuid not null references public.documents(id) on delete cascade,
  source text not null,
  scope text not null,
  scope_id text not null,
  version_id uuid not null references public.document_versions(id) on delete cascade,
  base_content_hash text not null,
  last_content_hash text not null,
  expires_at timestamptz not null default (now() + interval '2 hours'),
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint document_snapshot_sessions_source_check check (
    source in ('ai_apply', 'suggestion_apply', 'restore')
  ),
  constraint document_snapshot_sessions_scope_check check (
    scope in ('ai_request')
  )
);

create unique index if not exists document_snapshot_sessions_active_unique
  on public.document_snapshot_sessions(user_id, document_id, source, scope, scope_id)
  where closed_at is null;

create index if not exists document_snapshot_sessions_document_created_idx
  on public.document_snapshot_sessions(document_id, created_at desc);

alter table public.document_snapshot_sessions enable row level security;

drop policy if exists "document_snapshot_sessions_select_own" on public.document_snapshot_sessions;
drop policy if exists "document_snapshot_sessions_insert_own" on public.document_snapshot_sessions;
drop policy if exists "document_snapshot_sessions_update_own" on public.document_snapshot_sessions;
drop policy if exists "document_snapshot_sessions_delete_own" on public.document_snapshot_sessions;

create policy "document_snapshot_sessions_select_own"
on public.document_snapshot_sessions
for select
to authenticated
using (((select auth.jwt()) ->> 'sub') = user_id);

create policy "document_snapshot_sessions_insert_own"
on public.document_snapshot_sessions
for insert
to authenticated
with check (((select auth.jwt()) ->> 'sub') = user_id);

create policy "document_snapshot_sessions_update_own"
on public.document_snapshot_sessions
for update
to authenticated
using (((select auth.jwt()) ->> 'sub') = user_id)
with check (((select auth.jwt()) ->> 'sub') = user_id);

create policy "document_snapshot_sessions_delete_own"
on public.document_snapshot_sessions
for delete
to authenticated
using (((select auth.jwt()) ->> 'sub') = user_id);
