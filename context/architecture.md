# Architecture

## Stack

| Layer              | Tool                              | Purpose                                                     |
| ------------------ | --------------------------------- | ----------------------------------------------------------- |
| Framework          | Next.js App Router                | Full stack application framework                            |
| Language           | TypeScript strict                 | Type safety across frontend and backend                     |
| Auth               | Clerk                             | Authentication and user identity                            |
| Database           | Supabase Postgres                 | Structured application data                                 |
| Backend Access     | Supabase JS Client                | Database and storage access                                 |
| Backend Management | Supabase MCP                      | Schema inspection, migrations, RLS, and verification        |
| Storage            | Supabase Storage or Cloudflare R2 | Private original files and exports                          |
| AI Providers       | DeepSeek primary + Gemini/OpenAI optional | MVP document analysis, rewriting, suggestions, and optimization |
| AI Layer           | Provider abstraction              | Normalized AI calls across providers                        |
| Editor             | TipTap                            | Rich document editing                                       |
| Validation         | Zod                               | Request and form validation                                 |
| Styling            | Tailwind CSS + shadcn/ui + Radix  | UI system and accessible components                         |
| Toasts             | Sonner                            | Success, error, warning, and info notifications             |
| Small Loaders      | Loading UI CometSpinner           | Button and compact processing states                        |
| Testing            | Vitest                            | Unit and service-level testing                              |
| E2E Testing        | Playwright later                  | Full user-flow testing after MVP stabilizes                 |

---

## Folder Structure

```txt
/
├── AGENTS.md
├── context/
│   ├── project-overview.md
│   ├── architecture.md
│   ├── ui-tokens.md
│   ├── ui-rules.md
│   ├── ui-registry.md
│   ├── code-standards.md
│   ├── library-docs.md
│   ├── build-plan.md
│   └── progress-tracker.md
├── app/
│   ├── layout.tsx
│   ├── page.tsx                            → Homepage
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx                    → Auth page
│   ├── (app)/
│   │   ├── dashboard/
│   │   │   └── page.tsx                    → Dashboard workspace
│   │   ├── documents/
│   │   │   ├── new/
│   │   │   │   └── page.tsx                → Upload / paste / create flow
│   │   │   └── [id]/
│   │   │       ├── page.tsx                → Document editor workspace
│   │   │       ├── preview/
│   │   │       │   └── page.tsx            → AI result preview
│   │   │       ├── versions/
│   │   │       │   └── page.tsx            → Version history
│   │   │       └── export/
│   │   │           └── page.tsx            → Export flow
│   │   ├── account/
│   │   │   └── page.tsx                    → Account and usage
│   │   └── coming-soon/
│   │       └── page.tsx                    → Planned feature placeholder
│   └── api/
│       ├── documents/
│       │   ├── route.ts                    → Document list/create
│       │   └── [id]/
│       │       ├── route.ts                → Document read/update/delete
│       │       ├── ai/route.ts             → Run AI action
│       │       ├── suggestions/route.ts    → List/create suggestions
│       │       ├── versions/route.ts       → List/create versions
│       │       └── export/route.ts         → Generate export
│       ├── upload/
│       │   └── route.ts                    → Upload and parse document
│       ├── usage/
│       │   └── route.ts                    → Usage summary
│       └── webhooks/
│           └── clerk/
│               └── route.ts                → Clerk user sync
├── components/
│   ├── ui/                                 → shadcn/ui components only
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── AppSidebar.tsx
│   │   └── Footer.tsx
│   ├── marketing/
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   └── HowItWorks.tsx
│   ├── dashboard/
│   │   ├── DocumentStats.tsx
│   │   ├── RecentDocuments.tsx
│   │   ├── RecentActivity.tsx
│   │   └── UsageSummary.tsx
│   ├── documents/
│   │   ├── DocumentCard.tsx
│   │   ├── DocumentTable.tsx
│   │   ├── DocumentStatusBadge.tsx
│   │   └── FidelityBadge.tsx
│   ├── upload/
│   │   ├── UploadDropzone.tsx
│   │   ├── PasteTextForm.tsx
│   │   └── UploadProgress.tsx
│   ├── editor/
│   │   ├── DocumentEditor.tsx
│   │   ├── EditorToolbar.tsx
│   │   ├── SaveStatus.tsx
│   │   └── DocumentFidelityNotice.tsx
│   ├── ai/
│   │   ├── AIActionsPanel.tsx
│   │   ├── AIResultPreview.tsx
│   │   └── AIActionStatus.tsx
│   ├── suggestions/
│   │   ├── SuggestionCard.tsx
│   │   └── SuggestionsList.tsx
│   ├── versions/
│   │   ├── VersionTimeline.tsx
│   │   └── RestoreVersionDialog.tsx
│   ├── export/
│   │   ├── ExportFormatCard.tsx
│   │   ├── ExportOptions.tsx
│   │   └── ExportWarning.tsx
│   ├── usage/
│   │   ├── UsageCard.tsx
│   │   └── UsageMeter.tsx
│   └── feedback/
│       ├── AppToaster.tsx
│       ├── LoadingButton.tsx
│       ├── InlineAlert.tsx
│       ├── ErrorState.tsx
│       ├── EmptyState.tsx
│       └── SkeletonBlock.tsx
├── lib/
│   ├── auth/
│   │   └── clerk.ts
│   ├── supabase/
│   │   ├── server.ts
│   │   └── types.ts
│   ├── documents/
│   │   ├── document.service.ts
│   │   ├── document.validators.ts
│   │   └── document.types.ts
│   ├── parsing/
│   │   ├── parse-file.ts
│   │   ├── parse-pdf.ts
│   │   ├── parse-docx.ts
│   │   ├── parse-markdown.ts
│   │   └── parse-text.ts
│   ├── storage/
│   │   └── storage.service.ts
│   ├── ai/
│   │   ├── ai-router.ts
│   │   ├── ai.types.ts
│   │   ├── ai.validators.ts
│   │   ├── ai-cost.ts
│   │   └── providers/
│   │       ├── deepseek.provider.ts
│   │       ├── gemini.provider.ts
│   │       └── openai.provider.ts         → Optional future provider placeholder
│   ├── suggestions/
│   │   └── suggestions.service.ts
│   ├── versions/
│   │   └── versions.service.ts
│   ├── export/
│   │   └── export.service.ts
│   ├── usage/
│   │   └── usage.service.ts
│   ├── feedback/
│   │   └── toast.ts
│   ├── errors/
│   │   └── app-error.ts
│   └── utils.ts
└── types/
    └── index.ts
```

---

## System Boundaries

| Folder             | Owns                                                                        |
| ------------------ | --------------------------------------------------------------------------- |
| `app/`             | Pages, layouts, and API route entry points. No heavy business logic.        |
| `components/`      | UI components only. No direct database calls.                               |
| `lib/auth/`        | Clerk helpers and authenticated user resolution.                            |
| `lib/supabase/`    | Supabase clients and generated database types.                              |
| `lib/documents/`   | Document CRUD logic, validation, and document state handling.               |
| `lib/parsing/`     | File parsing and document extraction logic.                                 |
| `lib/storage/`     | Private file upload, export storage, and signed URL generation.             |
| `lib/ai/`          | AI provider abstraction, prompts, cost tracking, and normalized AI results. |
| `lib/versions/`    | Version creation, restoration, and version safety.                          |
| `lib/suggestions/` | Suggestion generation, apply, and ignore logic.                             |
| `lib/export/`      | Export generation logic.                                                    |
| `lib/rate-limit/`  | Authenticated mutation rate-limit rules, enforcement, and 429 responses.    |
| `lib/usage/`       | Usage ledger writes and usage summaries.                                    |
| `lib/errors/`      | Shared error handling utilities.                                            |
| `types/`           | Global shared TypeScript types.                                             |

---

## Data Flow

### Protected Mutation Rate Limiting

Expensive authenticated mutations enforce rolling-window rate limits after auth
and route parameter/body validation, before provider calls, uploads, export
generation, version creation/restoration, suggestion mutation, or document
creation services run.

```txt
Route validates auth and input
        ↓
Route calls lib/rate-limit enforceRateLimitPreset()
        ↓
Supabase RPC atomically consumes the configured rule counters
        ↓
Allowed requests continue to domain service execution
        ↓
Exceeded requests return 429 with Retry-After and X-RateLimit headers
```

The limiter is server-only. `rate_limit_events` and legacy
`rate_limit_counters` have RLS enabled and no browser/client policies; routes
access them through the service-role Supabase server client and the
`consume_rate_limit()` RPC. Upload active-ingestion limits remain a separate
concurrency guard and are not replaced by request rate limits. Ingestion status
polling is intentionally not rate-limited in the first release so processing UI
refreshes keep working.

### Protected Read Caching

Read-heavy protected workspace pages cache their Supabase-backed service
results on the server with Next.js `unstable_cache`. Cached private data must
always include the authenticated Clerk `userId` in the cache key and tag.

```txt
Protected page resolves Clerk user
        â†“
Page calls cached workspace loader
        â†“
Cache key includes userId and all request filters
        â†“
Cache hit returns the prior service result
        â†“
Successful mutations revalidate the user's workspace tags
```

The current cached surfaces are `/dashboard`, `/documents`, and
`/documents/[id]`. Dashboard cache entries use `workspace:{userId}` and
`dashboard:{userId}` tags. Documents Library cache entries use
`workspace:{userId}` and `documents-library:{userId}` tags, and their keys
include page, page size, search, status, type, fidelity, sort, and tab.
Document editor cache entries use `workspace:{userId}`,
`documents-library:{userId}`, and `document-editor:{userId}:{documentId}` tags.
The document editor keeps ingestion status checks live, then caches the stable
document, suggestions, and AI action history payload. Dashboard and document
editor data revalidate after 60 seconds; the less volatile Documents Library
revalidates after 300 seconds. Each protected page uses the matching
`unstable_dynamicStaleTime` so repeated client-side navigation can reuse the App
Router cache. Successful document, upload, AI, suggestion, version, and
export mutations invalidate the affected user's workspace cache and, when a
document id is known, the affected document editor cache after the domain
service succeeds. Ingestion status polling remains uncached.

The Documents Library adds a browser cache above the server cache using
TanStack Query. The server-rendered first result is dehydrated into the browser
query cache. Pagination, filtering, search, tabs, and sorting update the URL
with the native History API, then fetch `GET /api/documents`; they do not trigger
an App Router RSC navigation. Browser query keys include every normalized table
dimension, remain fresh for 300 seconds, retain previous rows while another page
loads, and prefetch adjacent pages. The API route authenticates with Clerk and
calls `getCachedDocumentsLibrary()`, so the existing Next.js cache remains the
only layer that reads Supabase. Successful library mutations invalidate both the
server tags in the route and the browser `documents-library` query family.

### Document Creation

```txt
User pastes text
        ↓
Route handler validates input
        ↓
Clerk user ID is resolved on the server
        ↓
Document service creates document
        ↓
Initial version is created
        ↓
Dashboard/editor revalidates or redirects
```

### Document Upload

Current uploads use a durable asynchronous ingestion pipeline:

```txt
Browser validates metadata and computes SHA-256
  -> init API creates an idempotent processing document/ingestion
  -> browser uploads directly to private Storage with signed resumable TUS
  -> completion API verifies the object
  -> small TXT/Markdown/DOCX/PDF files attempt inline validation/parsing/finalization
  -> larger, slower, unsupported-for-inline, or timed-out work falls back to pgmq
  -> Node worker validates signature/complexity and parses queued files
  -> transactional finalization checks per-user checksum duplicates
  -> user chooses Open Existing or Continue as New when required
  -> document, initial version, usage, and ingestion finalize atomically
```

`document_ingestions` is the durable state machine. Browser checksums are
preflight hints; only worker-computed SHA-256 is authoritative. Queue messages
contain ingestion IDs only and are accessible exclusively to the service-role
worker. The current MVP also has an inline fast path for portfolio-scale usage:
eligible files up to 5 MB with type TXT, Markdown, DOCX, or PDF are downloaded from
private Storage, checksum-verified, parsed, and finalized inside the upload
completion request with a 4 second processing budget. Permanent safety failures
fail immediately; non-permanent inline failures fall back to the queue. The
older synchronous flow below is retained only as rollback context.

```txt
User uploads file
        ↓
Upload API route validates file type and size
        ↓
Original file is stored privately
        ↓
Parser extracts text and structure where possible
        ↓
Document record is created
        ↓
Initial version is created
        ↓
User is redirected to editor
```

### AI Action

```txt
User runs AI action
        ↓
API route validates action and options
        ↓
Ownership is verified
        ↓
AI request record is created
        ↓
DeepSeek retries one transient failure and may fall back to Gemini
        ↓
Provider returns normalized result
        ↓
Result and generated suggestions are saved
        ↓
Usage is recorded
        ↓
Result and persisted suggestions are returned to the editor
```

Default AI actions are outcome-based:

```txt
proofread_correct     -> inline suggestions
improve_readability   -> inline suggestions
tone_alignment        -> setup + inline suggestions
structure_flow        -> inline suggestions for minor changes, result preview for major restructuring
summarize_shorten     -> setup + summary result preview
translate_document    -> setup + translation result preview
```

`POST /api/documents/[id]/ai` performs authentication, validation, ownership
checks, provider execution, persistence, and usage recording in one request.
The completed response includes the suggestions persisted for that AI request,
so the editor avoids a second full suggestions request. A separate AI worker is
out of scope for the current MVP.

Before suggestion persistence, generated suggestions pass a value and safety
gate. No-op replacements, empty replacements, duplicate targets, and
cosmetic whitespace-only changes outside the formatting category are rejected.
Each remaining AI `originalText` is resolved against the exact document
markdown, with harmless whitespace-only differences mapped back to the unique
exact document slice. Missing or ambiguous anchors are discarded and never
exposed as actionable pending suggestions.

Suggestion persistence also enforces action-specific boundaries where the
workflow requires it. Proofread & Correct only saves grammar-category
corrections and is capped to a small high-confidence set so it cannot drift
into readability, tone, structure, or broad style edits.
Improve Readability only saves clarity and conciseness suggestions and is
capped to a small high-confidence set so it cannot drift into proofreading,
tone alignment, formatting, structure, or summarization.
Tone Alignment only saves tone-category suggestions, caps the saved set, and
requires each reason to explain how the wording better fits the selected tone,
audience, or purpose.
Structure & Flow minor runs only save structure-category section or paragraph
suggestions. Major structure runs are result-preview only; any generated
suggestions on that path are ignored by persistence so the user reviews the
full proposed organization before applying it.

AI output records include workflow metadata:

```txt
workflow: inline_suggestions | result_preview
resultMode: optimization | summary | translation
structureChangeLevel: minor | major
```

Summary and translation actions return full result content in
`ai_requests.output.revisedMarkdown` and must not create inline suggestion rows.
Translation copies are saved as separate documents by default using the title
format `{Original Title} - {Language} Translation`.

### Applying AI Result

```txt
User reviews and optionally edits AI result in /documents/[id]/preview
        ↓
Ownership is verified
        ↓
Current document state is saved as version
        ↓
Edited proposed result is applied
        ↓
Document current_markdown, editor_json, and word_count are updated
        ↓
Usage/activity is recorded
```

Full AI action results are finally reviewed from `/documents/[id]/preview`.
Suggestion Apply and Apply All are explicit editor actions. Single Apply loads
the owned pending suggestion and current document in parallel,
validates replacement safety, creates or reuses a grouped pre-change snapshot
for that AI request, updates document content, marks the suggestion applied,
and records usage. The grouped snapshot is reused only while the stored
document content hash still matches the snapshot session; stale or expired
sessions are closed and a fresh rollback point is created. The returned
editor/version state updates the client locally without a second suggestions
fetch or full route refresh. Apply All receives the selected AI action's owned
pending suggestion ids, validates every replacement, creates one pre-change
snapshot, applies the safe batch, and returns the updated editor/version state.
Single suggestion Ignore only marks the pending
suggestion ignored and updates the client suggestion state locally without
refetching the full suggestions list. The preview
workspace compares current vs proposed content, supports editable proposed
results, and supports synchronous proportional scrolling. If the user edits the
proposed result before applying, that edited markdown is the source of truth for
the document update.

Result preview modes:

```txt
Optimization -> may apply to the original document after approval and a snapshot
Summary      -> copy, save as new document, save as version, export after saving, or discard
Translation  -> copy, save as translated document copy, export after saving, or discard
```

### Export

```txt
User selects export format
        ↓
Ownership is verified
        ↓
Export service generates file from structured document content
        ↓
File is stored privately
        ↓
Export record is created
        ↓
Signed download URL is returned
```

---

## Supabase Database Schema

### `profiles`

| Column     | Type        | Notes                  |
| ---------- | ----------- | ---------------------- |
| id         | uuid        | Primary key            |
| clerk_id   | text        | Clerk user ID          |
| email      | text        | User email             |
| full_name  | text        | Optional display name  |
| avatar_url | text        | Optional profile image |
| created_at | timestamptz | Created timestamp      |
| updated_at | timestamptz | Updated timestamp      |

### `documents`

| Column              | Type        | Notes                                                                           |
| ------------------- | ----------- | ------------------------------------------------------------------------------- |
| id                  | uuid        | Primary key                                                                     |
| user_id             | text        | Clerk user ID                                                                   |
| title               | text        | Document title                                                                  |
| status              | text        | draft / processing / ready / failed / archived                                  |
| source_type         | text        | upload / paste / blank (blank is legacy-display only in the current MVP)        |
| file_type           | text        | pdf / docx / markdown / txt / none                                              |
| original_file_key   | text        | Private storage key                                                             |
| extracted_text      | text        | Plain extracted text                                                            |
| editor_json         | jsonb       | TipTap document content                                                         |
| current_markdown    | text        | Portable document content                                                       |
| formatting_metadata | jsonb       | Structure and formatting hints                                                  |
| fidelity_status     | text        | Structure Preserved / Original Preserved / Limited Formatting / Plain Text Only |
| word_count          | integer     | Document word count                                                             |
| created_at          | timestamptz | Created timestamp                                                               |
| updated_at          | timestamptz | Updated timestamp                                                               |

### `document_versions`

| Column              | Type        | Notes                                                                        |
| ------------------- | ----------- | ---------------------------------------------------------------------------- |
| id                  | uuid        | Primary key                                                                  |
| document_id         | uuid        | References documents                                                         |
| user_id             | text        | Clerk user ID                                                                |
| title               | text        | Version label                                                                |
| source              | text        | upload / paste / blank / manual_save / ai_apply / suggestion_apply / restore |
| content_markdown    | text        | Version markdown content                                                     |
| editor_json         | jsonb       | Version editor content                                                       |
| formatting_metadata | jsonb       | Version formatting metadata                                                  |
| notes               | text        | Optional version notes                                                       |
| version_number      | integer     | Per-document sequential number; auto-assigned by a BEFORE INSERT trigger      |
| created_at          | timestamptz | Created timestamp                                                            |

`version_number` is assigned automatically by the `set_document_version_number()` trigger (max+1 per `document_id`) and is unique per `(document_id, version_number)`. Application code never sets it. See `supabase/schema/phase-4-version-number.sql`.

Versioning model: versions are created (1) automatically at document creation (`upload` / `paste`; `blank` remains legacy-display only), (2) automatically as pre-destructive safety snapshots before AI apply or suggestion apply via `snapshotDocumentVersion()` in `lib/versions/versions.service.ts`, and (3) on demand via the editor's "Save current version" dropdown action (`manual_save`, `createManualVersion()` + `POST /api/documents/[id]/versions`). Restore/switch updates the live document row to an existing saved version and does not create a new `document_versions` row. The editor resolves the current version label by preferring the latest validated `version_restore` usage metadata when the selected version content still matches the live document, then falling back to saved-version content matching. The plain Save only overwrites the live document row (no snapshot).

Single suggestion Apply uses `document_snapshot_sessions` to group repeated
card-level applies from the same AI request behind one visible rollback version.
If a later apply sees a different stored content hash, an expired session, or no
AI request scope, it creates a new version instead of reusing the old session.

### `document_snapshot_sessions`

Short-lived optimization records that allow repeated single suggestion applies
from the same AI request to reuse one pre-change version row without weakening
rollback safety.

| Column            | Type        | Notes                                                     |
| ----------------- | ----------- | --------------------------------------------------------- |
| id                | uuid        | Primary key                                               |
| user_id           | text        | Clerk user ID                                             |
| document_id       | uuid        | References documents                                      |
| source            | text        | suggestion_apply / ai_apply / restore                     |
| scope             | text        | Grouping scope; currently `ai_request`                    |
| scope_id          | text        | Scope identifier; currently the AI request id             |
| version_id        | uuid        | References the rollback row in `document_versions`        |
| base_content_hash | text        | Hash of the document state captured by the rollback row   |
| last_content_hash | text        | Hash after the latest successful mutation in this session |
| expires_at        | timestamptz | Session expiry                                            |
| closed_at         | timestamptz | Set when the session is stale or no longer reusable       |
| created_at        | timestamptz | Created timestamp                                         |
| updated_at        | timestamptz | Updated timestamp                                         |

### `ai_requests`

| Column         | Type        | Notes                                                |
| -------------- | ----------- | ---------------------------------------------------- |
| id             | uuid        | Primary key                                          |
| document_id    | uuid        | References documents                                 |
| user_id        | text        | Clerk user ID                                        |
| action         | text        | optimize / rewrite / summarize / translate / analyze |
| status         | text        | pending / running / completed / failed               |
| input_summary  | text        | Summary of AI input                                  |
| output         | jsonb       | Normalized AI output                                 |
| provider       | text        | deepseek / gemini / openai                           |
| model          | text        | Model used                                           |
| input_tokens   | integer     | Input token count                                    |
| output_tokens  | integer     | Output token count                                   |
| estimated_cost | numeric     | Estimated AI cost                                    |
| error_message  | text        | Safe failure message                                 |
| created_at     | timestamptz | Created timestamp                                    |
| completed_at   | timestamptz | Completion timestamp                                 |

### `suggestions`

| Column         | Type        | Notes                                      |
| -------------- | ----------- | ------------------------------------------ |
| id             | uuid        | Primary key                                |
| document_id    | uuid        | References documents                       |
| ai_request_id  | uuid        | Optional AI request reference              |
| user_id        | text        | Clerk user ID                              |
| type           | text        | grammar / clarity / tone / conciseness / structure / formatting |
| original_text  | text        | Text being improved                        |
| suggested_text | text        | Suggested replacement                      |
| explanation    | text        | Reason for suggestion                      |
| status         | text        | pending / applied / ignored                |
| created_at     | timestamptz | Created timestamp                          |
| updated_at     | timestamptz | Updated timestamp                          |

Suggestion metadata is stored separately from document content. Inline editor
highlights are temporary TipTap/ProseMirror decorations derived from pending
suggestions and must not be persisted into `editor_json` or exported content.
Legacy `seo` and `style` suggestion rows are tolerated and normalized into the
current optimization categories when read.

### `suggestion_preview_selections`

Short-lived server-backed selections for multi-suggestion preview. This table prevents storing large or client-trusted suggestion payloads in preview URLs.

| Column         | Type        | Notes                                           |
| -------------- | ----------- | ----------------------------------------------- |
| id             | uuid        | Primary key / compact preview `selectionId`     |
| user_id        | text        | Clerk user ID                                   |
| document_id    | uuid        | References documents                            |
| suggestion_ids | uuid[]      | Pending suggestions selected for preview        |
| expires_at     | timestamptz | Selection expiry, default 30 minutes            |
| consumed_at    | timestamptz | Set after successful preview apply              |
| created_at     | timestamptz | Created timestamp                               |

RLS is enabled. Owner-scoped select/insert/update/delete policies require Clerk JWT `sub` to match `user_id`.

### `exports`

| Column      | Type        | Notes                              |
| ----------- | ----------- | ---------------------------------- |
| id          | uuid        | Primary key                        |
| document_id | uuid        | References documents               |
| user_id     | text        | Clerk user ID                      |
| format      | text        | docx / pdf / markdown / txt / html |
| file_key    | text        | Private export storage key         |
| status      | text        | pending / completed / failed       |
| warning     | text        | Optional formatting warning        |
| created_at  | timestamptz | Created timestamp                  |

### `usage_ledger`

| Column         | Type        | Notes                                                            |
| -------------- | ----------- | ---------------------------------------------------------------- |
| id             | uuid        | Primary key                                                      |
| user_id        | text        | Clerk user ID                                                    |
| document_id    | uuid        | Optional document reference                                      |
| event_type     | text        | upload / ai_action / suggestion_apply / export / version_restore |
| provider       | text        | Optional AI provider                                             |
| model          | text        | Optional model                                                   |
| input_tokens   | integer     | Optional input tokens                                            |
| output_tokens  | integer     | Optional output tokens                                           |
| estimated_cost | numeric     | Optional estimated cost                                          |
| metadata       | jsonb       | Extra usage metadata                                             |
| created_at     | timestamptz | Created timestamp                                                |

### `rate_limit_events`

Server-only rolling-window event log for expensive authenticated mutations.

| Column        | Type        | Notes                                                   |
| ------------- | ----------- | ------------------------------------------------------- |
| id            | bigint      | Primary key                                             |
| rule_key      | text        | Logical rule, such as `ai_action:user:minute`           |
| subject_key   | text        | User or user/document scoped subject                    |
| created_at    | timestamptz | Created timestamp                                       |

RLS is enabled with no anon/authenticated direct policies. The
`consume_rate_limit(rule_key, subject_key, max_count, window_seconds)` RPC uses
a transaction-scoped advisory lock per rule/subject, removes expired rows for
that subject, counts events in the trailing window, inserts one event when
allowed, and returns `allowed`, `remaining`, `reset_at`, and `limit_count`.
`rate_limit_counters` remains as legacy migration/backfill state only.

---

## Storage

| Bucket    | Path                                          | Contents                |
| --------- | --------------------------------------------- | ----------------------- |
| documents | `{user_id}/{document_id}/original/{filename}` | Original uploaded files |
| exports   | `{user_id}/{document_id}/exports/{filename}`  | Generated exports       |

Access rules:

- Files are private by default
- Users can only access their own files
- Downloads use signed URLs
- Database stores file keys only
- Raw files are not stored in Postgres

---

## Authentication

- Provider: Clerk
- Protected routes: `/dashboard`, `/documents/new`, `/documents/[id]`, `/documents/[id]/preview`, `/documents/[id]/versions`, `/documents/[id]/export`, `/account`, `/coming-soon`
- Public routes: `/`, `/login`
- Middleware protects authenticated app routes
- On login → redirect to `/dashboard`
- Server reads authenticated user from Clerk
- Client never controls `user_id`

---

## Supabase Client Pattern

The MVP routes all database and storage access through server components, API
routes, and service-layer functions. There is currently no browser Supabase
client because client components must not perform sensitive writes.

```typescript
// lib/supabase/server.ts
// Server-side client for route handlers and service logic.

import "server-only";
import { createClient } from "@supabase/supabase-js";

export const createSupabaseServerClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!,
    {
      auth: {
        persistSession: false,
      },
    },
  );
};
```

The service role key must only be used on the server. If a future safe browser
read path is needed, add `lib/supabase/client.ts` deliberately and keep all
sensitive writes behind API routes.

---

## AI Provider Pattern

All AI calls must go through the AI router.

AI provider strategy:

```txt
Primary MVP provider: DeepSeek
Optional providers: Gemini and OpenAI
```

The default interactive document model is `deepseek-v4-flash` through DeepSeek's
OpenAI-compatible Chat Completions API with JSON output enabled and thinking
disabled for latency-oriented document transforms. The provider abstraction stays
in place so Gemini and OpenAI can be explicitly selected later without changing
route handlers, services, or components. AI service logs separate provider,
persistence, and total duration so latency regressions can be attributed.
DeepSeek retries one transient network, rate-limit, or 5xx failure after a short
delay. If the default unpinned DeepSeek path remains transiently unavailable and
Gemini is configured, the router uses the low-latency Gemini path as a fallback.
Explicit provider/model requests do not switch providers.

`lib/ai/providers/deepseek.provider.ts` is the default provider implementation.
`lib/ai/providers/gemini.provider.ts` remains available for explicit Gemini
testing. `lib/ai/providers/openai.provider.ts`, if present, is deferred/future-only
and must not block MVP completion.

```typescript
// lib/ai/ai-router.ts

export async function runAIAction(
  input: AIActionInput,
): Promise<AIActionResult> {
  const provider = selectProvider(input);

  return provider.run(input);
}
```

Provider implementations must normalize their response into the same result shape.

```txt
Gemini Provider
        ↓
AI Router
        ↓
Normalized AI Result

OpenAI Provider (future optional)
        ↓
AI Router
        ↓
Normalized AI Result
```

Route handlers must not call OpenAI or Gemini directly.

---

## Document Fidelity Pattern

Documents should preserve structure where technically possible.

The system should track fidelity through:

```txt
original_file_key
editor_json
current_markdown
formatting_metadata
fidelity_status
```

Expected fidelity behavior:

```txt
DOCX      → preserve logical structure where possible
Markdown  → preserve logical structure
TXT       → plain text only
PDF       → preserve original file, editable formatting may be limited
```

If formatting is limited, the UI must show a clear warning.

`editor_json` is the canonical rich editable document model. `current_markdown`
is a derived portable representation used for AI prompts, previews, and fallback
export paths. DOCX uploads should convert mammoth HTML into TipTap JSON for new
documents; successful rich conversion uses `Structure Preserved`, while degraded
fallback conversion uses `Limited Formatting`.
Preview comparisons should pass and render `editor_json` for both current and
proposed panes whenever available, using Markdown only as a fallback.

---

## Invariants

Rules the AI agent must never violate:

- App routes and pages do not contain heavy business logic.
- Components do not perform direct database writes.
- Route handlers validate input before calling services.
- Every private route resolves the current user from Clerk on the server.
- Never trust `user_id` from the frontend.
- Always scope document queries to the authenticated user.
- Raw uploaded files are stored in private storage, not Postgres.
- AI providers are only called through the AI router.
- AI output never overwrites document content automatically.
- Full AI action output can only be reviewed, saved, or applied from AI Result Preview.
- Single suggestion Apply is allowed from the editor after explicit user action and must preserve a rollback point first.
- Apply All Suggestions is allowed from the editor after explicit user action,
  safe replacement validation, and one pre-change version snapshot.
- AI Result Preview must support current vs proposed comparison before apply or save.
- Summary and translation results must not overwrite the original document by default.
- Translation saves should create a separate translated document copy.
- Comparison view supports synchronous proportional scrolling.
- Applying AI output creates a version snapshot first.
- Applying a suggestion preserves a rollback point where needed; repeated single applies from the same AI request may reuse a safe grouped snapshot.
- Restoring a version preserves the current state first.
- Expensive authenticated mutations must consume the configured server-side rate limit before running domain services.
- Exports are generated server-side.
- Export downloads use signed URLs.
- Usage is recorded for AI actions, exports, and important document mutations.
- Use Sonner for global toasts.
- Use CometSpinner for small processing states.
- Use skeletons for large loading areas.
- Do not introduce an ORM during MVP unless explicitly approved.
- Do not add billing, teams, collaboration, or admin tables during MVP unless explicitly requested.

---

## Progressive Onboarding

Progressive onboarding is mounted once in the authenticated app layout and is
non-blocking. `GET /api/onboarding` authenticates with Clerk, initializes the
server-only `user_onboarding` row, and derives milestones from owned documents,
completed AI requests, applied suggestions/AI usage, and completed exports.
`PATCH /api/onboarding` persists only UI state: welcome dismissal, stable tip
keys, checklist dismissal, and replay state. TanStack Query holds the browser
state and is invalidated after successful document creation, AI completion,
suggestion apply, and export generation.
When `ONBOARDING_VERSION` advances, the service resets only persisted guide UI
state for older rows; domain-derived milestones remain authoritative.

`user_onboarding` uses Clerk `user_id` as its primary key, has RLS enabled, and
grants no browser access. Real workflow milestones are never duplicated into
the onboarding row. The resolver exposes exactly one stage at a time: welcome,
create document, run AI, review result, version safety, export, or complete.
Route-specific first-visit tips cover the preview, version history, export, and
account workspaces independently of milestone stage, while the shell still
renders at most one onboarding surface at a time.
Onboarding fetch/update failures must never block core product workflows.

### Responsive Shell Contract

Authenticated navigation uses the collapsed sidebar at `md` and above. Below
`md`, the desktop rail is removed from layout and replaced by a safe-area-aware
fixed bottom navigation. General routes expose Dashboard, Documents, New
Document, and Account; document routes expose Documents, Editor, New Document,
Versions, and Export. The content column reserves matching bottom space only on
mobile.

Public navigation uses the full inline navigation at `md` and above and a
button-controlled menu below `md`. Mobile menus preserve every homepage section
plus login and Get Started actions.

Editor, preview, versions, and export workspaces use normal page scrolling below
`xl`. Height caps, hidden outer overflow, and internal pane scrolling apply only
from `xl`, where the single-viewport desktop workspace is active.

The editor keeps its 300px AI rail from `xl`; below `xl`, the same AI Actions
and Suggestions content is mounted in a modal bottom sheet with focus
management and body-scroll locking. Result preview switches to a single-pane
Proposed/Current/Changes review surface below `lg`, remains side-by-side from
`lg`, and allocates a desktop change-navigation rail only when change anchors
exist. These layout changes do not alter document, AI, suggestion, version, or
export service contracts.

Result preview is a review-and-export surface: it keeps a single back-to-editor
control in the header and an Export action below the internally scrolling
document pane. Copy and direct Apply controls are intentionally not exposed in
this workspace.
