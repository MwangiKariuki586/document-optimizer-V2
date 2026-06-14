-- Document Optimizer V2 - Phase 4 migration: document_versions.version_number.
-- Adds a per-document sequential version number so the editor can show a real
-- "Version N (Current)" label and Phase 7 can list versions in order.
--
-- STATUS: already applied to the project (dotbzqdqqlnxhhajljkq). This file mirrors
-- the deployed objects exactly and is idempotent, so it can be re-run safely and
-- serves as the repo's source-of-truth record for the change.

-- 1. Add the column. `default 0` keeps the generated Insert type optional; the
--    BEFORE INSERT trigger below always sets the real value, so application code
--    never sets version_number.
alter table public.document_versions
  add column if not exists version_number integer not null default 0;

-- 2. Backfill existing rows per document, ordered by creation time (id breaks ties).
with ordered as (
  select
    id,
    row_number() over (
      partition by document_id
      order by created_at, id
    ) as rn
  from public.document_versions
)
update public.document_versions dv
set version_number = ordered.rn
from ordered
where ordered.id = dv.id
  and dv.version_number = 0;

-- 3. Enforce uniqueness of (document_id, version_number).
create unique index if not exists document_versions_document_version_number_unique
  on public.document_versions(document_id, version_number);

-- 4. Auto-assign the next version number on insert (max+1 per document).
--    Concurrency note: simultaneous inserts for the same document can collide on
--    the unique index (rare); the failed insert can simply be retried.
create or replace function public.set_document_version_number()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  next_number integer;
begin
  select coalesce(max(version_number), 0) + 1
  into next_number
  from public.document_versions
  where document_id = new.document_id;

  new.version_number := next_number;
  return new;
end;
$$;

drop trigger if exists document_versions_set_version_number on public.document_versions;
create trigger document_versions_set_version_number
before insert on public.document_versions
for each row execute function public.set_document_version_number();
