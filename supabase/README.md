# Supabase Schema

This folder contains SQL drafts for Document Optimizer V2.

`schema/phase-1-database-schema.sql` defines the Phase 1 application tables, constraints, indexes, triggers, and RLS policies.

The RLS policy shape follows the current Clerk Supabase integration guidance: user-owned rows store the Clerk user ID, and policies compare it with the authenticated JWT `sub` claim through `auth.jwt()->>'sub'`.

Applied migrations:

1. `20260610065455_phase_1_database_schema`
2. `20260610065627_phase_1_database_schema_advisor_fixes`
3. `20260610070246_phase_1_private_storage`

Verification completed through Supabase MCP:

1. Confirmed all Phase 1 public tables exist.
2. Confirmed RLS is enabled on all user-owned tables.
3. Confirmed ownership policies exist for authenticated access.
4. Ran security advisors with no remaining lints.
5. Ran performance advisors; only expected unused-index info notices remain because the tables are new and empty.
6. Generated committed Supabase TypeScript types at `lib/supabase/types.ts`.

Private storage:

- `documents` bucket is private and accepts PDF, DOCX, Markdown, and TXT uploads.
- `exports` bucket is private and accepts PDF, DOCX, Markdown, TXT, and HTML exports.
- `documents` object policies allow authenticated access only at `{user_id}/{document_id}/original/{filename}`.
- `exports` object policies allow authenticated access only at `{user_id}/{document_id}/exports/{filename}`.
- The first path segment must match the Clerk user ID from `auth.jwt()->>'sub'`.
- Downloads should use short-lived signed URLs after application-level ownership checks.

Before app data wiring:

1. Confirm the Clerk Supabase integration is enabled so `auth.jwt()->>'sub'` contains the Clerk user ID.
2. Verify RLS behavior with separate Clerk users once authenticated app flows can issue Supabase requests.

References:

- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Clerk Supabase integration: https://clerk.com/docs/guides/development/integrations/databases/supabase
