# Build Plan

## Core Principle

Full page UI should be built with mock data first and visually verified before any logic is wired.

Every feature must be visible, navigable, and testable from the UI before backend functionality is added. Avoid invisible backend-only phases unless they are required to support the next visible user flow.

Build order:

```txt
UI first
→ visual review
→ validation
→ backend logic
→ real data wiring
→ feedback states
→ final verification
```

---

## Phase 1 — Foundation

### 01 Homepage

Build the complete homepage UI,reference context/designs/landingpage.png

**UI:**

- Top navbar — logo, Features, How It Works, Resources, Log in, Get Started
- Hero section — headline, subheadline, primary CTA that does not repeat “Get Started”
- AI optimization process visual showing document suggestions users can choose from
- Features section — document safety, AI suggestions, version history, export-ready workflow
- How it works section — upload/create, improve with AI, preview changes, export
- Bottom CTA section
- Footer

**Logic:**

- Signed-in users requesting `/` are redirected to `/dashboard` when Clerk is configured
- Primary CTA → `/login` if unauthenticated
- Primary CTA → `/dashboard` if authenticated
- Navbar Get Started → `/login` if unauthenticated
- Navbar Get Started → `/dashboard` if authenticated

---

### 02 Auth

Set up Clerk authentication.

**UI:**

- Login page
- Clerk sign-in/sign-up experience
- Auth loading state
- Auth redirect state

**Logic:**

- Clerk authentication setup
- Middleware protects authenticated routes:
  - `/dashboard`
  - `/documents/new`
  - `/documents/[id]`
  - `/documents/[id]/preview`
  - `/documents/[id]/versions`
  - `/documents/[id]/export`
  - `/account`

- On login → redirect to `/dashboard`
- On logout → redirect to homepage or login page

---

### 03 App Shell

Build authenticated workspace shell with mock content.

**UI:**

- Authenticated collapsed sidebar navigation based on the editor workspace rail pattern
- Main app layout
- Page container
- Shared page header pattern
- User/account menu
- Sidebar collapse and mobile behavior

**Logic:**

- Read Clerk session
- Show authenticated sidebar navigation only inside protected app routes
- Redirect unauthenticated users away from protected routes

---

### 04 Feedback System

Set up reusable loading, empty, error, and toast feedback before feature wiring.

**UI:**

- AppToaster mounted once
- LoadingButton using CometSpinner
- InlineAlert
- ErrorState
- EmptyState
- SkeletonBlock

**Logic:**

- Create centralized toast helpers:
  - success
  - error
  - warning
  - info

- Use Sonner for global notifications
- Use CometSpinner for small loading states
- Use skeletons for page and section loading states

---

### 05 Database Schema

Create the Supabase schema before real data is written.

**Logic:**

- Create `profiles` table
- Create `documents` table
- Create `document_versions` table
- Create `ai_requests` table
- Create `suggestions` table
- Create `exports` table
- Create `usage_ledger` table
- Enable RLS on user-owned tables
- Add ownership policies scoped by Clerk user ID
- Generate Supabase TypeScript types
- Verify schema with Supabase MCP

---

### 06 Private Storage

Create private storage for original files and generated exports.

**Logic:**

- Create private `documents` storage bucket
- Create private `exports` storage bucket
- Store original files at:

```txt
{user_id}/{document_id}/original/{filename}
```

- Store exports at:

```txt
{user_id}/{document_id}/exports/{filename}
```

- Ensure signed URLs are used for downloads
- Ensure database stores file keys only, not file blobs

---

## Phase 2 — Dashboard Workspace

### 07 Dashboard Page — Full UI

Build the complete dashboard UI with mock data,referencing context/designs/dashboard.png

**UI:**

- Page heading and short purpose line
- Quick action cards:
  - Upload Document
  - Paste Text

- Recent documents section
- Document status/fidelity badges
- Usage summary cards
- Recent activity list
- Empty state for users with no documents

**Logic:**

- Quick action cards navigate to `/documents/new`
- Recent document rows/cards navigate to `/documents/[id]`

---

### 08 Dashboard — Real Data

Wire dashboard to Supabase data for the authenticated user.

**Logic:**

- Fetch recent documents for current Clerk user
- Fetch usage summary from `usage_ledger`
- Fetch recent activity from document, AI, version, and export records
- Show empty state when no documents exist
- Ensure all queries are scoped to the authenticated user

---

## Phase 3 — Upload/Create Document Flow

### 09 Upload/Create Page — Full UI

Build the complete document creation flow with mock states,referencing context/designs/upload document.png

**UI:**

- Two creation options:
  - Upload File
  - Paste Text

- Upload dropzone
- Supported file format notes:
  - PDF
  - DOCX
  - Markdown
  - TXT

- Paste text form
- Upload progress state
- Parsing state
- Success state
- Error state
- Fidelity warning area

---

### 10 Create Blank Document

Removed from the current MVP. Do not expose a blank-document tab, dashboard quick action, documents-library action, or `POST /api/documents` creation branch for `sourceType = blank`.

**Logic:**

- Legacy blank documents and blank versions may still be displayed if they already exist.
- New document creation is limited to upload and paste text flows.

---

### 11 Paste Text Document

Wire paste text document creation.

**Logic:**

- Validate title and pasted content
- Convert pasted text into editor-compatible structure
- Create document with `source_type = paste`
- Store `extracted_text`
- Store `current_markdown`
- Store `editor_json`
- Set fidelity status to `Plain Text Only`
- Create initial document version
- Record usage
- Redirect to `/documents/[id]`

---

### 12 Upload Document

Wire document upload and parsing.

**Logic:**

- Validate file type and file size
- Supported MVP formats:
  - PDF
  - DOCX
  - Markdown
  - TXT

- Store original file privately
- Parse file content
- Extract text
- Extract structure where possible
- Create document record
- Save formatting metadata where available
- Set fidelity status
- Create initial document version
- Record usage
- Redirect to `/documents/[id]`
- Show warning toast if formatting is limited
- Initialize uploads with an idempotency key and browser SHA-256 checksum
- Upload directly to private Storage using signed resumable TUS
- Parse files in the durable Node ingestion worker through `pgmq`
- Detect verified checksum duplicates per authenticated user
- Require an explicit Open Existing or Continue as New decision
- Render queued, processing, failed, retry, and duplicate-review states on `/documents/[id]`
- Finalize document, initial version, usage, and ingestion atomically

---

## Phase 4 — Document Editor Workspace

### 13 Document Editor Page — Full UI

Build the complete editor workspace with mock data,referencing context/designs/editor workspace.png

**UI:**

- Document title area
- Save status
- Layout/fidelity indicator
- Original file preserved indicator
- Editor toolbar
- Main document editor canvas
- AI actions panel
- Suggestions panel or section
- Version history access
- Export access
- Persistent formatting warning area where needed

---

### 14 Document Editor — Real Data

Wire the editor to real document data.

**Logic:**

- Load document by ID
- Verify ownership
- Render document from `editor_json` or fallback content
- Show fidelity status
- Show original file indicator when available
- Support title update
- Support manual content save
- Update `current_markdown`
- Update `editor_json`
- Update word count
- Show save success/error feedback

---

### 15 Manual Version Creation

Support version snapshots from the editor.

**Logic:**

- Create version from current document state
- Store:
  - content markdown
  - editor json
  - formatting metadata
  - source
  - notes

- Show success toast after version creation

---

## Phase 5 — AI Actions and Preview

### 16 AI Actions Panel — Full UI

Build the AI actions panel with mock data,referencing context/designs/results preview.png or editor workspace

**UI:**

- AI action cards/buttons:
  - Proofread & Correct
  - Improve Readability
  - Tone Alignment
  - Structure & Flow
  - Summarize & Shorten
  - Translate Document

- Action-specific setup panels:
  - Tone Alignment: target tone and optional audience or purpose
  - Summarize & Shorten: output type and target length
  - Translate Document: supported target language, translation style, and optional preserved terms

- Loading state using CometSpinner
- Disabled state while processing
- Error state when AI fails

---

### 17 AI Provider Abstraction

Create the AI service layer.

**Logic:**

- Create AI router
- Create DeepSeek provider as the primary MVP implementation
- Keep Gemini and OpenAI behind the provider abstraction as optional paths
- Route AI actions through DeepSeek by default
- Normalize AI responses
- Validate AI action input with Zod
- Track provider, model, token usage, and estimated cost
- Do not require OpenAI for MVP completion
- Route handlers must not call providers directly

---

### 18 Run AI Action

Wire AI actions to real backend execution.

**Logic:**

- POST `/api/documents/[id]/ai`
- Verify document ownership
- Validate action and options
- Create `ai_requests` record
- Run AI action through AI router
- Save normalized result
- Record usage
- Return the saved AI request id, persisted suggestions, workflow metadata, and preview route:

```txt
/documents/[id]/preview?requestId={aiRequestId}
```

- Redirect or link users to the preview page before any document mutation
- Inline suggestion workflows can move the user directly to the suggestions rail.
- Result-preview workflows route through `/documents/[id]/preview?requestId={aiRequestId}`.
- Do not expose a final Apply to Document action from the editor or AI actions panel
- Show success/error toast

---

### 19 AI Result Preview

Create or confirm the AI result preview page before wiring preview-first AI flows, referencing `context/designs/results preview.png`.

Required route:

```txt
app/(app)/documents/[id]/preview/page.tsx
```

Purpose: `/documents/[id]/preview` is the required Results page and approval checkpoint for full AI action output and explicit batch suggestion reviews before they can be applied or saved. Direct single-suggestion Apply remains an editor action because the user has already chosen one concrete replacement.

**Implementation rules:**

- If the preview page already exists, reuse and enhance it instead of creating a duplicate page.
- If it does not exist, create it at `/documents/[id]/preview`.
- Before creating any new preview-related component, check `context/ui-registry.md` for an existing similar component.
- Reuse existing components wherever possible.
- If a new reusable component is required, add it to `context/ui-registry.md` after implementation.

**UI:**

- Full AI action output preview
- Single suggestion preview
- Multi-suggestion preview
- Current document read-only pane
- Editable proposed result pane
- Side-by-side comparison mode
- Changed-sections comparison mode as the default review surface when exact anchors are available
- Proposed-only mode
- Sync scrolling toggle, default on
- Original vs proposed content comparison
- AI improvement summary
- Lightweight change summary and navigator where exact anchors are available
- Category counts and source snippets in the change navigator
- Formatting/fidelity warnings where needed
- Apply to Document action
- Copy result button
- Save as new document / translated copy action
- Save summary as version action
- Regenerate action where applicable
- Discard / Return to Editor action
- Loading and error states

**Logic:**

- Load full AI action previews from `ai_requests`:

```txt
/documents/[id]/preview?requestId={aiRequestId}
```

- Load single suggestion previews from `suggestions`:

```txt
/documents/[id]/preview?suggestionId={suggestionId}
```

- For multi-suggestion preview, use a safe server-backed selection instead of storing large payloads in the URL.
- Ensure the AI request, suggestion, or server-backed selection belongs to the authenticated user and document.
- AI actions and batch suggestion reviews must redirect to this page before document mutation.
- Single suggestion Apply may mutate directly from the editor after ownership verification, safe replacement validation, and a preserved rollback point.
- Applying a result or suggestion preserves a rollback point first.
- Applying uses the edited proposed result from the preview page, not necessarily the raw AI response.
- Update document content
- Record usage/activity
- Redirect back to editor after apply
- Show success toast
- Critical rule: full AI action output and batch suggestion review output must not be applied directly from the editor or suggestions panel. The preview page is the only place where those final `Apply to Document` actions should exist.

---

## Phase 6 — Suggestions

### 20 Suggestions UI

Build suggestions UI with mock data,referencing context/designs/editor workspace.png

**UI:**

- Suggestions list
- Suggestion card
- Suggestion type badge
- Category-based inline optimization highlights in the document editor
- Highlight legend/filter for Grammar, Clarity, Tone, Conciseness, Structure, and Formatting
- Original text
- Suggested text
- Explanation
- Apply button
- Ignore button
- Applied/ignored state
- Empty state when no suggestions exist

---

### 21 Suggestions Logic

Wire suggestions to real data.

**Logic:**

- Generate suggestions from AI result where applicable
- Do not generate or persist inline suggestions for Summarize & Shorten or Translate Document
- Save suggestions to `suggestions`
- Fetch suggestions for document
- Render pending suggestions as a temporary TipTap/ProseMirror decoration layer
  when `original_text` can be matched safely in the current editor document
- Keep unmatched suggestions visible in the rail with a review-needed note
- Link highlight clicks to suggestion cards and card clicks to editor ranges
- Apply single suggestion:
  - verify ownership
  - apply only after an explicit card-level Apply click
  - optimistically replace the matched editor range locally and roll back if persistence fails
  - fail safely when the source text is missing or ambiguous
  - preserve a rollback point where needed
  - update document content
  - mark suggestion as applied
- Review/apply all pending suggestions:
  - store the pending suggestion ids server-side
  - send the user to `/documents/[id]/preview` with a compact server-backed selection reference
  - do not store large payloads in the URL
  - apply the pending batch only from the preview page

- Ignore suggestion:
  - verify ownership
  - remove the local highlight/card from the pending working list immediately
  - mark suggestion as ignored

- Show success/error feedback

---

### 21a Batch Suggestion Review Flow

Update the completed suggestions flow so batch review fully obeys the preview checkpoint rule before continuing to Version History.

Single suggestion Apply is intentionally immediate from the editor after explicit user action and a server-side rollback point. Review Applied Suggestions opens a read-only preview comparison, and Review All is the batch review path that must route through `/documents/[id]/preview`.

**UI:**

- Reuse and enhance `AIResultPreview` instead of creating a duplicate preview screen.
- Support preview mode labels for:
  - full AI action output
  - single suggestion
  - multi-suggestion batch

- Keep original vs proposed comparison visible for every applyable AI change.
- Show AI improvement summary and formatting/fidelity warnings where applicable.
- Keep single-card `Apply` in the editor rail for immediate one-suggestion mutation.
- Keep explicit review actions:
  - `Review Applied Suggestions`
  - `Review All`

- Keep `Ignore` available from the suggestions rail when it does not mutate document content.
- Keep `Discard / Return to Editor` available on preview.
- Keep `Regenerate` available only where the source supports regeneration.

**Logic:**

- Single suggestion review route:

```txt
/documents/[id]/preview?suggestionId={suggestionId}
```

- Multi-suggestion review must use a safe server-backed selection:
  - store authenticated user id
  - store document id
  - store pending suggestion ids for Review All
  - store short expiry if persistence is required
  - pass only a compact selection reference in the URL

- Do not store large suggestion payloads in the URL.
- Ensure the suggestion or selection belongs to the authenticated Clerk user and document.
- Single-card Apply from the editor must:
  - verify ownership
  - create or reuse a safe AI-run rollback snapshot before mutation
  - apply exactly one safe replacement
  - mark the suggestion as applied
  - record `suggestion_apply` usage
- Final Review All batch apply from preview must:
  - verify ownership
  - snapshot the current document first
  - apply the pending suggestion batch
  - mark applied suggestions as applied
  - record `suggestion_apply` usage
  - redirect back to the editor
  - show success/error feedback

**Verification:**

- Run typecheck, lint, and focused tests for suggestion replacement/apply behavior.
- Manually verify:
- single suggestion Apply updates the editor immediately after the server preserves a rollback point
- Review All opens preview through server-backed selection
- editor rail only routes to preview when the user chooses Review Applied Suggestions or Review All
  - AI action previews still work with `requestId`

---

## Phase 7 — Version History

### 22 Version History Page — Full UI

Build the complete version history UI with mock data,referencing context/designs/version history.png

**UI:**

- Version timeline
- Version source labels
- Timestamp
- Version notes
- Preview selected version
- Restore button
- Restore confirmation dialog
- Empty state

---

### 23 Version History Logic

Wire version history to real data.

**Logic:**

- Fetch document versions
- Show versions for authenticated user only
- Preview selected version
- Restore version:
  - verify ownership
  - save current document state as version first
  - restore selected version content
  - update document
  - record usage/activity

- Show success/error toast

---

## Phase 8 — Export Flow

### 24 Export Page — Full UI

Build the export flow with mock data,referencing context/designs/export document.png

**UI:**

- Export format cards:
  - DOCX
  - PDF
  - Markdown
  - TXT
  - HTML

- Export options
- Formatting warning area
- Export summary panel
- Generate export button
- Loading state using CometSpinner
- Download ready state
- Error state

---

### 25 Export Logic

Wire export generation.

**Logic:**

- POST `/api/documents/[id]/export`
- Verify ownership
- Validate export format
- Generate export from structured document content where possible
- Store export privately
- Create export record
- Record usage
- Return signed download URL
- Show formatting warning where needed
- Show success/error toast

---

## Phase 9 — Account and Usage

### 26 Account and Usage Page — Full UI

Build account and usage page with mock data,referencing context/designs/account and usage.png

**UI:**

- Profile summary
- Free workspace summary
- Usage cards
- AI usage summary
- Document usage summary
- Export usage summary
- Storage usage summary
- Recent usage activity
- Sign out action

---

### 27 Account and Usage Logic

Wire account and usage page to real data.

**Logic:**

- Load Clerk profile details
- Load usage summary from `usage_ledger`
- Count documents created
- Count uploads
- Count AI actions
- Count suggestions applied
- Count exports generated
- Show empty usage state where needed
- Do not add pricing, subscription, invoice, renewal, upgrade, or paid-plan controls

---

## Phase 10 — Final Review and Hardening

### 28 Security Review

Verify private access rules.

**Checks:**

- Protected routes require authentication
- All document queries are scoped to current user
- All mutations verify ownership
- Service role key is server-only
- Original files are private
- Exports are private
- Signed URLs are used for downloads
- Client never controls `user_id`

---

### 29 UI State Review

Verify all core UI states.

**Checks:**

- Loading states
- Empty states
- Error states
- Success toasts
- Warning toasts
- Info toasts
- Button loading states
- Upload progress states
- AI processing states
- Export processing states

---

### 30 MVP Testing Pass

Add and run MVP-level tests.

**Checks:**

- Document creation works
- Paste text creation works
- Upload validation works
- Document ownership is enforced
- AI action validation works
- Version creation works
- Version restore works
- Export format validation works
- Usage records are created
- Critical UI components render correctly

---

## Feature Count

| Phase                                 | Features |
| ------------------------------------- | -------- |
| Phase 1 — Foundation                  | 6        |
| Phase 2 — Dashboard Workspace         | 2        |
| Phase 3 — Upload/Create Document Flow | 4        |
| Phase 4 — Document Editor Workspace   | 3        |
| Phase 5 — AI Actions and Preview      | 4        |
| Phase 6 — Suggestions                 | 2        |
| Phase 7 — Version History             | 2        |
| Phase 8 — Export Flow                 | 2        |
| Phase 9 — Account and Usage           | 2        |
| Phase 10 — Final Review and Hardening | 3        |
| **Total**                             | **30**   |
