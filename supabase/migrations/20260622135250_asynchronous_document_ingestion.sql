-- Durable asynchronous upload ingestion with per-user duplicate detection.

create extension if not exists pgmq cascade;

do $$
begin
  if not exists (
    select 1 from pgmq.meta where queue_name = 'document_ingestion'
  ) then
    perform pgmq.create('document_ingestion');
  end if;
end;
$$;

alter table public.documents
  add column if not exists original_file_name text,
  add column if not exists original_file_size bigint,
  add column if not exists original_mime_type text,
  add column if not exists file_checksum text;

alter table public.documents
  drop constraint if exists documents_original_file_size_check,
  add constraint documents_original_file_size_check
    check (original_file_size is null or original_file_size between 1 and 10485760),
  drop constraint if exists documents_file_checksum_check,
  add constraint documents_file_checksum_check
    check (file_checksum is null or file_checksum ~ '^[0-9a-f]{64}$');

create index if not exists documents_user_file_checksum_idx
  on public.documents(user_id, file_checksum)
  where file_checksum is not null;

create table if not exists public.document_ingestions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references public.documents(id) on delete set null,
  user_id text not null,
  idempotency_key uuid not null,
  original_file_name text not null,
  file_size bigint not null,
  declared_mime_type text not null,
  detected_mime_type text,
  file_type text not null,
  storage_key text,
  client_checksum text not null,
  verified_checksum text,
  status text not null default 'awaiting_upload',
  stage text not null default 'initializing',
  duplicate_document_id uuid references public.documents(id) on delete set null,
  duplicate_resolution text not null default 'pending',
  attempt_count integer not null default 0,
  queue_message_id bigint,
  error_code text,
  error_message text,
  metrics jsonb not null default '{}'::jsonb,
  upload_completed_at timestamptz,
  processing_started_at timestamptz,
  heartbeat_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint document_ingestions_file_size_check
    check (file_size between 1 and 10485760),
  constraint document_ingestions_file_type_check
    check (file_type in ('pdf', 'docx', 'markdown', 'txt')),
  constraint document_ingestions_client_checksum_check
    check (client_checksum ~ '^[0-9a-f]{64}$'),
  constraint document_ingestions_verified_checksum_check
    check (verified_checksum is null or verified_checksum ~ '^[0-9a-f]{64}$'),
  constraint document_ingestions_status_check
    check (status in (
      'awaiting_upload', 'queued', 'processing', 'duplicate_pending',
      'completed', 'failed', 'duplicate_resolved'
    )),
  constraint document_ingestions_duplicate_resolution_check
    check (duplicate_resolution in ('pending', 'open_existing', 'continue_as_new')),
  constraint document_ingestions_attempt_count_check
    check (attempt_count between 0 and 100),
  unique(user_id, idempotency_key)
);

create unique index if not exists document_ingestions_document_unique
  on public.document_ingestions(document_id)
  where document_id is not null;
create index if not exists document_ingestions_user_created_idx
  on public.document_ingestions(user_id, created_at desc);
create index if not exists document_ingestions_active_idx
  on public.document_ingestions(user_id, status)
  where status in ('awaiting_upload', 'queued', 'processing', 'duplicate_pending');
create index if not exists document_ingestions_duplicate_idx
  on public.document_ingestions(user_id, verified_checksum)
  where verified_checksum is not null;

alter table public.document_ingestions enable row level security;

drop policy if exists "document_ingestions_select_own" on public.document_ingestions;
create policy "document_ingestions_select_own"
on public.document_ingestions for select to authenticated
using (((select auth.jwt()) ->> 'sub') = user_id);

drop trigger if exists document_ingestions_set_updated_at on public.document_ingestions;
create trigger document_ingestions_set_updated_at
before update on public.document_ingestions
for each row execute function public.set_updated_at();

-- Prevent concurrent version inserts from selecting the same max(version_number).
create or replace function public.set_document_version_number()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  perform pg_advisory_xact_lock(hashtextextended(new.document_id::text, 0));
  select coalesce(max(version_number), 0) + 1
  into new.version_number
  from public.document_versions
  where document_id = new.document_id;
  return new;
end;
$$;

-- Service-role queue wrappers. They are security-invoker functions and are not
-- executable by browser roles.
create or replace function public.enqueue_document_ingestion(
  p_ingestion_id uuid,
  p_delay_seconds integer default 0
)
returns bigint
language plpgsql
set search_path = public, pgmq
as $$
declare
  v_message_id bigint;
begin
  select queue_message_id into v_message_id
  from public.document_ingestions
  where id = p_ingestion_id
  for update;

  if not found then
    raise exception 'INGESTION_NOT_FOUND';
  end if;

  if v_message_id is not null then
    return v_message_id;
  end if;

  select pgmq.send(
    'document_ingestion',
    jsonb_build_object('ingestionId', p_ingestion_id),
    greatest(p_delay_seconds, 0)
  ) into v_message_id;

  update public.document_ingestions
  set queue_message_id = v_message_id,
      status = 'queued',
      stage = 'queued',
      error_code = null,
      error_message = null
  where id = p_ingestion_id;

  return v_message_id;
end;
$$;

create or replace function public.read_document_ingestion_queue(
  p_visibility_timeout integer default 300,
  p_quantity integer default 1
)
returns table(
  message_id bigint,
  read_count integer,
  enqueued_at timestamptz,
  visible_at timestamptz,
  message jsonb
)
language sql
set search_path = public, pgmq
as $$
  select msg_id, read_ct, enqueued_at, vt, message
  from pgmq.read('document_ingestion', p_visibility_timeout, p_quantity);
$$;

create or replace function public.archive_document_ingestion_message(p_message_id bigint)
returns boolean
language sql
set search_path = public, pgmq
as $$
  select pgmq.archive('document_ingestion', p_message_id);
$$;

revoke all on function public.enqueue_document_ingestion(uuid, integer) from public, anon, authenticated;
revoke all on function public.read_document_ingestion_queue(integer, integer) from public, anon, authenticated;
revoke all on function public.archive_document_ingestion_message(bigint) from public, anon, authenticated;
grant execute on function public.enqueue_document_ingestion(uuid, integer) to service_role;
grant execute on function public.read_document_ingestion_queue(integer, integer) to service_role;
grant execute on function public.archive_document_ingestion_message(bigint) to service_role;

-- Keep Storage and application validation aligned.
update storage.buckets
set file_size_limit = 10485760,
    updated_at = now()
where id = 'documents';
