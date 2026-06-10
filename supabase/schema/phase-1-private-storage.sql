-- Document Optimizer V2 - Phase 1 private storage.
-- Private buckets:
-- documents: {user_id}/{document_id}/original/{filename}
-- exports:   {user_id}/{document_id}/exports/{filename}

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values
  (
    'documents',
    'documents',
    false,
    null,
    array[
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/markdown',
      'text/plain'
    ]
  ),
  (
    'exports',
    'exports',
    false,
    null,
    array[
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/markdown',
      'text/plain',
      'text/html'
    ]
  )
on conflict (id) do update
set
  name = excluded.name,
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types,
  updated_at = now();

drop policy if exists "documents_bucket_select_own" on storage.objects;
drop policy if exists "documents_bucket_insert_own" on storage.objects;
drop policy if exists "documents_bucket_update_own" on storage.objects;
drop policy if exists "documents_bucket_delete_own" on storage.objects;
drop policy if exists "exports_bucket_select_own" on storage.objects;
drop policy if exists "exports_bucket_insert_own" on storage.objects;
drop policy if exists "exports_bucket_update_own" on storage.objects;
drop policy if exists "exports_bucket_delete_own" on storage.objects;

create policy "documents_bucket_select_own"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'documents'
  and (storage.foldername(name))[1] = ((select auth.jwt()) ->> 'sub')
  and (storage.foldername(name))[3] = 'original'
);

create policy "documents_bucket_insert_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'documents'
  and (storage.foldername(name))[1] = ((select auth.jwt()) ->> 'sub')
  and (storage.foldername(name))[3] = 'original'
);

create policy "documents_bucket_update_own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'documents'
  and (storage.foldername(name))[1] = ((select auth.jwt()) ->> 'sub')
  and (storage.foldername(name))[3] = 'original'
)
with check (
  bucket_id = 'documents'
  and (storage.foldername(name))[1] = ((select auth.jwt()) ->> 'sub')
  and (storage.foldername(name))[3] = 'original'
);

create policy "documents_bucket_delete_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'documents'
  and (storage.foldername(name))[1] = ((select auth.jwt()) ->> 'sub')
  and (storage.foldername(name))[3] = 'original'
);

create policy "exports_bucket_select_own"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'exports'
  and (storage.foldername(name))[1] = ((select auth.jwt()) ->> 'sub')
  and (storage.foldername(name))[3] = 'exports'
);

create policy "exports_bucket_insert_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'exports'
  and (storage.foldername(name))[1] = ((select auth.jwt()) ->> 'sub')
  and (storage.foldername(name))[3] = 'exports'
);

create policy "exports_bucket_update_own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'exports'
  and (storage.foldername(name))[1] = ((select auth.jwt()) ->> 'sub')
  and (storage.foldername(name))[3] = 'exports'
)
with check (
  bucket_id = 'exports'
  and (storage.foldername(name))[1] = ((select auth.jwt()) ->> 'sub')
  and (storage.foldername(name))[3] = 'exports'
);

create policy "exports_bucket_delete_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'exports'
  and (storage.foldername(name))[1] = ((select auth.jwt()) ->> 'sub')
  and (storage.foldername(name))[3] = 'exports'
);
