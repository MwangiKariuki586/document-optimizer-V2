-- Document Optimizer V2 - Phase 1 database schema draft.
-- Review before applying in Supabase SQL editor or via Supabase MCP.
-- Clerk + Supabase RLS uses auth.jwt()->>'sub' as the Clerk user ID.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  clerk_id text not null unique,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  title text not null,
  status text not null default 'draft',
  source_type text not null,
  file_type text not null default 'none',
  original_file_key text,
  extracted_text text,
  editor_json jsonb,
  current_markdown text,
  formatting_metadata jsonb not null default '{}'::jsonb,
  fidelity_status text not null default 'Plain Text Only',
  word_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint documents_status_check check (
    status in ('draft', 'processing', 'ready', 'failed', 'archived')
  ),
  constraint documents_source_type_check check (
    source_type in ('upload', 'paste', 'blank')
  ),
  constraint documents_file_type_check check (
    file_type in ('pdf', 'docx', 'markdown', 'txt', 'none')
  ),
  constraint documents_fidelity_status_check check (
    fidelity_status in (
      'Structure Preserved',
      'Original Preserved',
      'Limited Formatting',
      'Plain Text Only',
      'Formatting Review Needed'
    )
  ),
  constraint documents_word_count_check check (word_count >= 0)
);

create table if not exists public.document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id text not null,
  title text not null,
  source text not null,
  content_markdown text,
  editor_json jsonb,
  formatting_metadata jsonb not null default '{}'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  constraint document_versions_source_check check (
    source in (
      'upload',
      'paste',
      'blank',
      'manual_save',
      'ai_apply',
      'suggestion_apply',
      'restore'
    )
  )
);

create table if not exists public.ai_requests (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id text not null,
  action text not null,
  status text not null default 'pending',
  input_summary text,
  output jsonb,
  provider text,
  model text,
  input_tokens integer,
  output_tokens integer,
  estimated_cost numeric(12, 6),
  error_message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint ai_requests_action_check check (
    action in (
      'optimize',
      'improve_clarity',
      'fix_grammar',
      'rewrite',
      'summarize',
      'translate',
      'tone_analyze',
      'seo_analyze',
      'simplify_language'
    )
  ),
  constraint ai_requests_status_check check (
    status in ('pending', 'running', 'completed', 'failed')
  ),
  constraint ai_requests_provider_check check (
    provider is null or provider in ('openai', 'gemini')
  ),
  constraint ai_requests_input_tokens_check check (
    input_tokens is null or input_tokens >= 0
  ),
  constraint ai_requests_output_tokens_check check (
    output_tokens is null or output_tokens >= 0
  ),
  constraint ai_requests_estimated_cost_check check (
    estimated_cost is null or estimated_cost >= 0
  )
);

create table if not exists public.suggestions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  ai_request_id uuid references public.ai_requests(id) on delete set null,
  user_id text not null,
  type text not null,
  original_text text not null,
  suggested_text text not null,
  explanation text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint suggestions_type_check check (
    type in (
      'grammar',
      'clarity',
      'tone',
      'conciseness',
      'structure',
      'formatting',
      'seo',
      'style'
    )
  ),
  constraint suggestions_status_check check (
    status in ('pending', 'applied', 'ignored')
  )
);

create table if not exists public.exports (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id text not null,
  format text not null,
  file_key text,
  status text not null default 'pending',
  warning text,
  created_at timestamptz not null default now(),
  constraint exports_format_check check (
    format in ('docx', 'pdf', 'markdown', 'txt', 'html')
  ),
  constraint exports_status_check check (
    status in ('pending', 'completed', 'failed')
  )
);

create table if not exists public.usage_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  document_id uuid references public.documents(id) on delete set null,
  event_type text not null,
  provider text,
  model text,
  input_tokens integer,
  output_tokens integer,
  estimated_cost numeric(12, 6),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint usage_ledger_event_type_check check (
    event_type in (
      'upload',
      'document_create',
      'ai_action',
      'suggestion_apply',
      'export',
      'version_restore',
      'manual_save'
    )
  ),
  constraint usage_ledger_provider_check check (
    provider is null or provider in ('openai', 'gemini')
  ),
  constraint usage_ledger_input_tokens_check check (
    input_tokens is null or input_tokens >= 0
  ),
  constraint usage_ledger_output_tokens_check check (
    output_tokens is null or output_tokens >= 0
  ),
  constraint usage_ledger_estimated_cost_check check (
    estimated_cost is null or estimated_cost >= 0
  )
);

create index if not exists profiles_clerk_id_idx on public.profiles(clerk_id);
create index if not exists documents_user_updated_idx on public.documents(user_id, updated_at desc);
create index if not exists document_versions_document_created_idx on public.document_versions(document_id, created_at desc);
create index if not exists document_versions_user_created_idx on public.document_versions(user_id, created_at desc);
create index if not exists ai_requests_document_created_idx on public.ai_requests(document_id, created_at desc);
create index if not exists ai_requests_user_created_idx on public.ai_requests(user_id, created_at desc);
create index if not exists suggestions_ai_request_idx on public.suggestions(ai_request_id);
create index if not exists suggestions_document_status_idx on public.suggestions(document_id, status);
create index if not exists suggestions_user_status_idx on public.suggestions(user_id, status);
create index if not exists exports_document_created_idx on public.exports(document_id, created_at desc);
create index if not exists exports_user_created_idx on public.exports(user_id, created_at desc);
create index if not exists usage_ledger_user_created_idx on public.usage_ledger(user_id, created_at desc);
create index if not exists usage_ledger_document_created_idx on public.usage_ledger(document_id, created_at desc);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists documents_set_updated_at on public.documents;
create trigger documents_set_updated_at
before update on public.documents
for each row execute function public.set_updated_at();

drop trigger if exists suggestions_set_updated_at on public.suggestions;
create trigger suggestions_set_updated_at
before update on public.suggestions
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.documents enable row level security;
alter table public.document_versions enable row level security;
alter table public.ai_requests enable row level security;
alter table public.suggestions enable row level security;
alter table public.exports enable row level security;
alter table public.usage_ledger enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "documents_select_own" on public.documents;
drop policy if exists "documents_insert_own" on public.documents;
drop policy if exists "documents_update_own" on public.documents;
drop policy if exists "documents_delete_own" on public.documents;
drop policy if exists "document_versions_select_own" on public.document_versions;
drop policy if exists "document_versions_insert_own" on public.document_versions;
drop policy if exists "document_versions_update_own" on public.document_versions;
drop policy if exists "document_versions_delete_own" on public.document_versions;
drop policy if exists "ai_requests_select_own" on public.ai_requests;
drop policy if exists "ai_requests_insert_own" on public.ai_requests;
drop policy if exists "ai_requests_update_own" on public.ai_requests;
drop policy if exists "suggestions_select_own" on public.suggestions;
drop policy if exists "suggestions_insert_own" on public.suggestions;
drop policy if exists "suggestions_update_own" on public.suggestions;
drop policy if exists "suggestions_delete_own" on public.suggestions;
drop policy if exists "exports_select_own" on public.exports;
drop policy if exists "exports_insert_own" on public.exports;
drop policy if exists "exports_update_own" on public.exports;
drop policy if exists "exports_delete_own" on public.exports;
drop policy if exists "usage_ledger_select_own" on public.usage_ledger;
drop policy if exists "usage_ledger_insert_own" on public.usage_ledger;

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (((select auth.jwt()) ->> 'sub') = clerk_id);

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (((select auth.jwt()) ->> 'sub') = clerk_id);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (((select auth.jwt()) ->> 'sub') = clerk_id)
with check (((select auth.jwt()) ->> 'sub') = clerk_id);

create policy "documents_select_own"
on public.documents
for select
to authenticated
using (((select auth.jwt()) ->> 'sub') = user_id);

create policy "documents_insert_own"
on public.documents
for insert
to authenticated
with check (((select auth.jwt()) ->> 'sub') = user_id);

create policy "documents_update_own"
on public.documents
for update
to authenticated
using (((select auth.jwt()) ->> 'sub') = user_id)
with check (((select auth.jwt()) ->> 'sub') = user_id);

create policy "documents_delete_own"
on public.documents
for delete
to authenticated
using (((select auth.jwt()) ->> 'sub') = user_id);

create policy "document_versions_select_own"
on public.document_versions
for select
to authenticated
using (((select auth.jwt()) ->> 'sub') = user_id);

create policy "document_versions_insert_own"
on public.document_versions
for insert
to authenticated
with check (((select auth.jwt()) ->> 'sub') = user_id);

create policy "document_versions_update_own"
on public.document_versions
for update
to authenticated
using (((select auth.jwt()) ->> 'sub') = user_id)
with check (((select auth.jwt()) ->> 'sub') = user_id);

create policy "document_versions_delete_own"
on public.document_versions
for delete
to authenticated
using (((select auth.jwt()) ->> 'sub') = user_id);

create policy "ai_requests_select_own"
on public.ai_requests
for select
to authenticated
using (((select auth.jwt()) ->> 'sub') = user_id);

create policy "ai_requests_insert_own"
on public.ai_requests
for insert
to authenticated
with check (((select auth.jwt()) ->> 'sub') = user_id);

create policy "ai_requests_update_own"
on public.ai_requests
for update
to authenticated
using (((select auth.jwt()) ->> 'sub') = user_id)
with check (((select auth.jwt()) ->> 'sub') = user_id);

create policy "suggestions_select_own"
on public.suggestions
for select
to authenticated
using (((select auth.jwt()) ->> 'sub') = user_id);

create policy "suggestions_insert_own"
on public.suggestions
for insert
to authenticated
with check (((select auth.jwt()) ->> 'sub') = user_id);

create policy "suggestions_update_own"
on public.suggestions
for update
to authenticated
using (((select auth.jwt()) ->> 'sub') = user_id)
with check (((select auth.jwt()) ->> 'sub') = user_id);

create policy "suggestions_delete_own"
on public.suggestions
for delete
to authenticated
using (((select auth.jwt()) ->> 'sub') = user_id);

create policy "exports_select_own"
on public.exports
for select
to authenticated
using (((select auth.jwt()) ->> 'sub') = user_id);

create policy "exports_insert_own"
on public.exports
for insert
to authenticated
with check (((select auth.jwt()) ->> 'sub') = user_id);

create policy "exports_update_own"
on public.exports
for update
to authenticated
using (((select auth.jwt()) ->> 'sub') = user_id)
with check (((select auth.jwt()) ->> 'sub') = user_id);

create policy "exports_delete_own"
on public.exports
for delete
to authenticated
using (((select auth.jwt()) ->> 'sub') = user_id);

create policy "usage_ledger_select_own"
on public.usage_ledger
for select
to authenticated
using (((select auth.jwt()) ->> 'sub') = user_id);

create policy "usage_ledger_insert_own"
on public.usage_ledger
for insert
to authenticated
with check (((select auth.jwt()) ->> 'sub') = user_id);
