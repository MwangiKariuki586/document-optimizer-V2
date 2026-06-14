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

- Top navbar — logo, Features, How It Works, Pricing, Resources, Log in, Get Started
- Hero section — headline, subheadline, primary CTA that does not repeat “Get Started”
- AI optimization process visual showing document suggestions users can choose from
- Features section — document safety, AI suggestions, version history, export-ready workflow
- How it works section — upload/create, improve with AI, preview changes, export
- Bottom CTA section
- Footer

**Logic:**

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

- Authenticated top navigation visually consistent with public navbar
- Main app layout
- Page container
- Shared page header pattern
- User/account menu
- Mobile navigation behavior

**Logic:**

- Read Clerk session
- Show authenticated navigation only for logged-in users
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
  - Create Blank Document

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

- Three creation options:
  - Upload File
  - Paste Text
  - Create Blank

- Upload dropzone
- Supported file format notes:
  - PDF
  - DOCX
  - Markdown
  - TXT

- Paste text form
- Blank document form
- Upload progress state
- Parsing state
- Success state
- Error state
- Fidelity warning area

---

### 10 Create Blank Document

Wire blank document creation.

**Logic:**

- POST document creation request
- Validate title
- Create document with `source_type = blank`
- Set status to `ready`
- Create initial document version
- Record usage
- Redirect to `/documents/[id]`
- Show success/error toast

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
  - Optimize
  - Improve Clarity
  - Fix Grammar
  - Rewrite
  - Summarize
  - Translate
  - Tone Analyze
  - SEO Analyze
  - Simplify Language

- Optional action settings:
  - tone
  - audience
  - language
  - preserve structure toggle

- Loading state using CometSpinner
- Disabled state while processing
- Error state when AI fails

---

### 17 AI Provider Abstraction

Create the AI service layer.

**Logic:**

- Create AI router
- Create Gemini provider first as the primary MVP implementation
- Keep OpenAI provider deferred as an optional future provider
- Route AI actions through Gemini by default
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
- Return preview result
- Show success/error toast

---

### 19 AI Result Preview

Build and wire the AI result preview page.

**UI:**

- Original content panel
- AI result panel
- Improvement summary
- Formatting preservation notice
- Apply changes button
- Copy result button
- Regenerate button
- Discard button
- Loading and error states

**Logic:**

- Load AI result from `ai_requests`
- Ensure result belongs to authenticated user
- Applying result creates a version snapshot first
- Apply result to document
- Update document content
- Record usage/activity
- Redirect back to editor after apply
- Show success toast

---

## Phase 6 — Suggestions

### 20 Suggestions UI

Build suggestions UI with mock data,referencing context/designs/editor workspace.png

**UI:**

- Suggestions list
- Suggestion card
- Suggestion type badge
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
- Save suggestions to `suggestions`
- Fetch suggestions for document
- Apply suggestion:
  - verify ownership
  - create version snapshot where needed
  - update document content
  - mark suggestion as applied

- Ignore suggestion:
  - verify ownership
  - mark suggestion as ignored

- Show success/error feedback

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
- Current plan placeholder
- Usage cards
- AI usage summary
- Document usage summary
- Export usage summary
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
