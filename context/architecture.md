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
| AI Providers       | OpenAI + Gemini                   | Document analysis, rewriting, suggestions, and optimization |
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
│   │   └── account/
│   │       └── page.tsx                    → Account and usage
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
│   │   ├── AppHeader.tsx
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
│   │   ├── BlankDocumentForm.tsx
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
│   │   ├── client.ts
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
│   │       ├── openai.provider.ts
│   │       └── gemini.provider.ts
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
User creates blank document or pastes text
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
User applies AI result
        ↓
Ownership is verified
        ↓
Current document state is saved as version
        ↓
AI output is applied
        ↓
Document content is updated
        ↓
Usage/activity is recorded
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
| source_type         | text        | upload / paste / blank                                                          |
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

Versioning model: versions are created (1) automatically at document creation (`upload` / `paste` / `blank`), (2) automatically as pre-destructive safety snapshots before AI apply, suggestion apply, or restore via `snapshotDocumentVersion()` in `lib/versions/versions.service.ts`, and (3) on demand via the editor's "Save current version" dropdown action (`manual_save`, `createManualVersion()` + `POST /api/documents/[id]/versions`). The plain Save only overwrites the live document row (no snapshot).

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
- Protected routes: `/dashboard`, `/documents/new`, `/documents/[id]`, `/documents/[id]/preview`, `/documents/[id]/versions`, `/documents/[id]/export`, `/account`
- Public routes: `/`, `/login`
- Middleware protects authenticated app routes
- On login → redirect to `/dashboard`
- Server reads authenticated user from Clerk
- Client never controls `user_id`

---

## Supabase Client Pattern

Two separate Supabase clients should be used.

```typescript
// lib/supabase/client.ts
// Browser-side client for safe frontend reads where allowed.

import { createClient } from "@supabase/supabase-js";

export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
```

```typescript
// lib/supabase/server.ts
// Server-side client for route handlers and service logic.

import { createClient } from "@supabase/supabase-js";

export const createSupabaseServerClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
      },
    },
  );
};
```

The service role key must only be used on the server.

---

## AI Provider Pattern

All AI calls must go through the AI router.

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
OpenAI Provider
        ↓
AI Router
        ↓
Normalized AI Result

Gemini Provider
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
