-- Document Optimizer V2 - Phase 6 migration: preview-gated suggestion batches.
-- Stores short-lived, user-owned suggestion selections so multi-suggestion
-- preview URLs carry only a compact selection id.

create table if not exists public.suggestion_preview_selections (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  document_id uuid not null references public.documents(id) on delete cascade,
  suggestion_ids uuid[] not null,
  expires_at timestamptz not null default (now() + interval '30 minutes'),
  consumed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint suggestion_preview_selections_suggestion_ids_check
    check (cardinality(suggestion_ids) > 0 and cardinality(suggestion_ids) <= 100)
);

create index if not exists suggestion_preview_selections_user_created_idx
  on public.suggestion_preview_selections(user_id, created_at desc);

create index if not exists suggestion_preview_selections_document_created_idx
  on public.suggestion_preview_selections(document_id, created_at desc);

create index if not exists suggestion_preview_selections_expires_idx
  on public.suggestion_preview_selections(expires_at);

alter table public.suggestion_preview_selections enable row level security;

drop policy if exists "suggestion_preview_selections_select_own"
  on public.suggestion_preview_selections;
drop policy if exists "suggestion_preview_selections_insert_own"
  on public.suggestion_preview_selections;
drop policy if exists "suggestion_preview_selections_update_own"
  on public.suggestion_preview_selections;
drop policy if exists "suggestion_preview_selections_delete_own"
  on public.suggestion_preview_selections;

create policy "suggestion_preview_selections_select_own"
on public.suggestion_preview_selections
for select
to authenticated
using (((select auth.jwt()) ->> 'sub') = user_id);

create policy "suggestion_preview_selections_insert_own"
on public.suggestion_preview_selections
for insert
to authenticated
with check (((select auth.jwt()) ->> 'sub') = user_id);

create policy "suggestion_preview_selections_update_own"
on public.suggestion_preview_selections
for update
to authenticated
using (((select auth.jwt()) ->> 'sub') = user_id)
with check (((select auth.jwt()) ->> 'sub') = user_id);

create policy "suggestion_preview_selections_delete_own"
on public.suggestion_preview_selections
for delete
to authenticated
using (((select auth.jwt()) ->> 'sub') = user_id);

grant select, insert, update, delete
on public.suggestion_preview_selections
to authenticated;
