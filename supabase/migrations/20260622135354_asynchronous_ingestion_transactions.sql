alter table public.document_versions
  add column if not exists ingestion_id uuid
    references public.document_ingestions(id) on delete set null;
alter table public.usage_ledger
  add column if not exists ingestion_id uuid
    references public.document_ingestions(id) on delete set null;

create unique index if not exists document_versions_ingestion_unique
  on public.document_versions(ingestion_id)
  where ingestion_id is not null;
create unique index if not exists usage_ledger_ingestion_unique
  on public.usage_ledger(ingestion_id)
  where ingestion_id is not null;

create or replace function public.finalize_document_ingestion(
  p_ingestion_id uuid,
  p_verified_checksum text,
  p_detected_mime_type text,
  p_extracted_text text,
  p_current_markdown text,
  p_editor_json jsonb,
  p_formatting_metadata jsonb,
  p_fidelity_status text,
  p_word_count integer,
  p_metrics jsonb default '{}'::jsonb
)
returns table(result_status text, existing_document_id uuid)
language plpgsql
set search_path = public
as $$
declare
  v_ingestion public.document_ingestions%rowtype;
  v_document public.documents%rowtype;
  v_existing uuid;
begin
  select * into v_ingestion
  from public.document_ingestions
  where id = p_ingestion_id
  for update;

  if not found then
    raise exception 'INGESTION_NOT_FOUND';
  end if;

  if v_ingestion.status = 'completed' then
    return query select 'completed'::text, null::uuid;
    return;
  end if;

  if v_ingestion.document_id is null then
    raise exception 'INGESTION_DOCUMENT_MISSING';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(v_ingestion.user_id || ':' || p_verified_checksum, 0)
  );

  select id into v_existing
  from public.documents
  where user_id = v_ingestion.user_id
    and file_checksum = p_verified_checksum
    and status = 'ready'
    and id <> v_ingestion.document_id
  order by created_at asc
  limit 1;

  if v_existing is not null
     and v_ingestion.duplicate_resolution <> 'continue_as_new' then
    update public.document_ingestions
    set verified_checksum = p_verified_checksum,
        detected_mime_type = p_detected_mime_type,
        status = 'duplicate_pending',
        stage = 'duplicate_review',
        duplicate_document_id = v_existing,
        queue_message_id = null,
        metrics = coalesce(metrics, '{}'::jsonb) || coalesce(p_metrics, '{}'::jsonb),
        completed_at = null
    where id = p_ingestion_id;

    return query select 'duplicate_pending'::text, v_existing;
    return;
  end if;

  update public.documents
  set status = 'ready',
      original_file_name = v_ingestion.original_file_name,
      original_file_size = v_ingestion.file_size,
      original_mime_type = p_detected_mime_type,
      file_checksum = p_verified_checksum,
      original_file_key = v_ingestion.storage_key,
      extracted_text = p_extracted_text,
      current_markdown = p_current_markdown,
      editor_json = p_editor_json,
      formatting_metadata = coalesce(p_formatting_metadata, '{}'::jsonb),
      fidelity_status = p_fidelity_status,
      word_count = p_word_count,
      updated_at = now()
  where id = v_ingestion.document_id
    and user_id = v_ingestion.user_id
  returning * into v_document;

  if not found then
    raise exception 'INGESTION_DOCUMENT_MISSING';
  end if;

  insert into public.document_versions (
    document_id, user_id, title, source, content_markdown, editor_json,
    formatting_metadata, notes, ingestion_id
  ) values (
    v_document.id, v_document.user_id, v_document.title, 'upload',
    p_current_markdown, p_editor_json, coalesce(p_formatting_metadata, '{}'::jsonb),
    'Document uploaded', p_ingestion_id
  ) on conflict (ingestion_id) where ingestion_id is not null do nothing;

  insert into public.usage_ledger (
    user_id, document_id, event_type, metadata, ingestion_id
  ) values (
    v_document.user_id, v_document.id, 'upload',
    jsonb_build_object('source_type', 'upload', 'file_type', v_ingestion.file_type),
    p_ingestion_id
  ) on conflict (ingestion_id) where ingestion_id is not null do nothing;

  update public.document_ingestions
  set verified_checksum = p_verified_checksum,
      detected_mime_type = p_detected_mime_type,
      status = 'completed',
      stage = 'completed',
      queue_message_id = null,
      metrics = coalesce(metrics, '{}'::jsonb) || coalesce(p_metrics, '{}'::jsonb),
      completed_at = now(),
      heartbeat_at = now()
  where id = p_ingestion_id;

  return query select 'completed'::text, null::uuid;
end;
$$;

revoke all on function public.finalize_document_ingestion(
  uuid, text, text, text, text, jsonb, jsonb, text, integer, jsonb
) from public, anon, authenticated;
grant execute on function public.finalize_document_ingestion(
  uuid, text, text, text, text, jsonb, jsonb, text, integer, jsonb
) to service_role;
