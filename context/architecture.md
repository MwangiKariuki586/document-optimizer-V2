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
| AI Providers       | Gemini primary + OpenAI future    | MVP document analysis, rewriting, suggestions, and optimization |
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
| `lib/usage/`       | Usage ledger writes and usage summaries.                                    |
| `lib/errors/`      | Shared error handling utilities.                                            |
| `types/`           | Global shared TypeScript types.                                             |

---

## Data Flow

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
  -> completion API verifies the object and enqueues pgmq work
  -> Node worker validates signature/complexity and parses the file
  -> transactional finalization checks per-user checksum duplicates
  -> user chooses Open Existing or Continue as New when required
  -> document, initial version, usage, and ingestion finalize atomically
```

`document_ingestions` is the durable state machine. Browser checksums are
preflight hints; only worker-computed SHA-256 is authoritative. Queue messages
contain ingestion IDs only and are accessible exclusively to the service-role
worker. The older synchronous flow below is retained only as rollback context.

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
AI router selects provider
        ↓
Provider returns normalized result
        ↓
Result is saved for preview
        ↓
Usage is recorded
        ↓
Preview is shown to user
```

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

Full AI action results and explicit batch suggestion reviews are finally applied
from `/documents/[id]/preview`. Single suggestion Apply is an explicit editor
action: it loads the owned pending suggestion and current document in parallel,
validates replacement safety, snapshots the pre-change state, updates document
content, marks the suggestion applied, and records usage. The returned
editor/version state updates the client locally without a second suggestions
fetch or full route refresh. Single suggestion Ignore only marks the pending
suggestion ignored and updates the client suggestion state locally without
refetching the full suggestions list. The preview
workspace compares current vs proposed content, supports editable proposed
results, and supports synchronous proportional scrolling. If the user edits the
proposed result before applying, that edited markdown is the source of truth for
the document update.

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
| provider       | text        | openai / gemini                                      |
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
| type           | text        | clarity / grammar / tone / structure / seo |
| original_text  | text        | Text being improved                        |
| suggested_text | text        | Suggested replacement                      |
| explanation    | text        | Reason for suggestion                      |
| status         | text        | pending / applied / ignored                |
| created_at     | timestamptz | Created timestamp                          |
| updated_at     | timestamptz | Updated timestamp                          |

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
Primary MVP provider: Gemini
Optional future provider: OpenAI
```

The default interactive document model is `gemini-2.5-flash-lite` with
thinking disabled and a provider-side JSON response schema. This keeps preview
actions latency-oriented while preserving reliable normalization and the
provider abstraction. A transient capacity failure or malformed response on the
default path may fall back once to stable `gemini-3.1-flash-lite`; explicitly
requested models remain pinned and do not fall back. AI service logs separate provider,
persistence, and total duration so latency regressions can be attributed.

The provider abstraction stays in place so OpenAI can be re-enabled later without changing route handlers, services, or components. `lib/ai/providers/gemini.provider.ts` is the first real provider implementation for MVP. `lib/ai/providers/openai.provider.ts`, if present, is deferred/future-only and must not block MVP completion.

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
- Full AI action output and explicit batch suggestion reviews can only be finally applied from AI Result Preview.
- Single suggestion Apply is allowed from the editor after explicit user action and must snapshot first.
- AI Result Preview must support current vs proposed comparison before apply.
- The proposed AI result must be editable before applying.
- The edited proposed result is what gets applied.
- Comparison view supports synchronous proportional scrolling.
- Applying AI output creates a version snapshot first.
- Applying a suggestion creates a version snapshot where needed.
- Restoring a version preserves the current state first.
- Exports are generated server-side.
- Export downloads use signed URLs.
- Usage is recorded for AI actions, exports, and important document mutations.
- Use Sonner for global toasts.
- Use CometSpinner for small processing states.
- Use skeletons for large loading areas.
- Do not introduce an ORM during MVP unless explicitly approved.
- Do not add billing, teams, collaboration, or admin tables during MVP unless explicitly requested.
