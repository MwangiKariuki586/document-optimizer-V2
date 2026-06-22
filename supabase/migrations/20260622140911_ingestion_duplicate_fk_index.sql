create index if not exists document_ingestions_duplicate_document_idx
  on public.document_ingestions(duplicate_document_id)
  where duplicate_document_id is not null;
