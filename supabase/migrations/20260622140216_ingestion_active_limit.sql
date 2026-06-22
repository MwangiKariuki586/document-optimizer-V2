create or replace function public.enforce_document_ingestion_active_limit()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_active_count integer;
begin
  perform pg_advisory_xact_lock(hashtextextended('ingestion:' || new.user_id, 0));
  select count(*) into v_active_count
  from public.document_ingestions
  where user_id = new.user_id
    and status in ('awaiting_upload', 'queued', 'processing', 'duplicate_pending');

  if v_active_count >= 3 then
    raise exception 'ACTIVE_INGESTION_LIMIT';
  end if;
  return new;
end;
$$;

drop trigger if exists document_ingestions_active_limit on public.document_ingestions;
create trigger document_ingestions_active_limit
before insert on public.document_ingestions
for each row execute function public.enforce_document_ingestion_active_limit();
