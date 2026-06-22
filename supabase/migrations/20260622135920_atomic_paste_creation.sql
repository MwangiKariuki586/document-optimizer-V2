create or replace function public.create_paste_document_atomic(
  p_user_id text,
  p_title text,
  p_content text,
  p_editor_json jsonb,
  p_word_count integer
)
returns table(document_id uuid, document_title text)
language plpgsql
set search_path = public
as $$
declare
  v_document public.documents%rowtype;
begin
  insert into public.documents (
    user_id, title, status, source_type, file_type, extracted_text,
    editor_json, current_markdown, fidelity_status, word_count
  ) values (
    p_user_id, p_title, 'ready', 'paste', 'none', p_content,
    p_editor_json, p_content, 'Plain Text Only', p_word_count
  ) returning * into v_document;

  insert into public.document_versions (
    document_id, user_id, title, source, content_markdown, editor_json, notes
  ) values (
    v_document.id, p_user_id, p_title, 'paste', p_content, p_editor_json,
    'Document created from pasted text'
  );

  insert into public.usage_ledger (user_id, document_id, event_type, metadata)
  values (
    p_user_id, v_document.id, 'document_create',
    jsonb_build_object('source_type', 'paste')
  );

  return query select v_document.id, v_document.title;
end;
$$;

revoke all on function public.create_paste_document_atomic(text, text, text, jsonb, integer)
  from public, anon, authenticated;
grant execute on function public.create_paste_document_atomic(text, text, text, jsonb, integer)
  to service_role;
