# UI Registry

Living document. Updated after every component is built.

Read this before building any new component. Match existing patterns before inventing new ones.

---

## Purpose

This file tracks reusable UI components, their file paths, usage rules, and exact class patterns.

The goal is to prevent UI drift across sessions.

When a component is built, documented, reused, or changed, this file must be updated.

---

## How to Use

Before building any component:

1. Check if a similar component already exists here
2. If yes, reuse the existing component or match its exact pattern
3. If no, build it following:
   - `ui-rules.md`
   - `ui-tokens.md`
   - `code-standards.md`

4. After building the component, add it to this registry

---

## Registry Update Rule

After building or modifying any component, update this file with:

```txt
Component name
File path
Purpose
Used on
Core classes
Variants if any
Notes or constraints
```

Do not leave completed components undocumented.

---

## Component Entry Template

Use this format for every component added later:

````md
### ComponentName

**Path:** `components/category/ComponentName.tsx`

**Purpose:**

Short description of what the component does.

**Used on:**

- Page or feature area

**Core classes:**

```txt
className=""
```
````

**Variants:**

- variant name — description

**Rules:**

- Usage rule
- Constraint

````

---

## Components

### AuthCtaLink

**Path:** `components/auth/AuthCtaLink.tsx`

**Purpose:**

Auth-aware CTA link that sends signed-in users to `/dashboard` and signed-out users to `/login`.

**Used on:**

- Homepage navbar
- Homepage hero
- Homepage bottom CTA

**Core classes:**

```txt
className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:bg-accent-dark"
className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground"
```

**Variants:**

- Button class is supplied by the caller.

**Rules:**

- Uses Clerk `Show` controls when Clerk keys are configured.
- Falls back to `/login` when Clerk keys are not configured.

### LoginPanel

**Path:** `components/auth/LoginPanel.tsx`

**Purpose:**

Login page auth panel that renders Clerk `SignIn` when keys exist and a setup state when keys are missing.

**Used on:**

- `/login`

**Core classes:**

```txt
className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-card-soft"
```

**Variants:**

- Clerk enabled - renders Clerk sign-in/sign-up experience.
- Clerk missing - renders setup guidance.

**Rules:**

- Uses fallback redirects to `/dashboard` only when no Clerk `redirect_url` is present.
- Do not force redirect from this component; protected-page refreshes should return to the originally requested route after sign-in.
- Keep setup state visible until Clerk environment variables are configured.

---

## Layout Components

### PublicNavbar

**Path:** `components/layout/PublicNavbar.tsx`

**Purpose:**

Public homepage navigation with logo, marketing links, login, and primary Get Started action.

**Used on:**

- Homepage

**Core classes:**

```txt
className="border-b border-border-light bg-background-soft/95 px-4 py-3 backdrop-blur"
className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between rounded-2xl border border-border-light bg-surface px-4 shadow-card-soft md:px-6"
```

**Variants:**

- None

**Rules:**

- Keep public and authenticated navigation visually consistent.
- Get Started points to `/login` until Clerk auth-aware routing is added.

### Footer

**Path:** `components/layout/Footer.tsx`

**Purpose:**

Public footer with product identity, section links, and short product promise.

**Used on:**

- Homepage

**Core classes:**

```txt
className="border-t border-border-light bg-background-soft px-4 py-8"
className="mx-auto flex max-w-[1200px] flex-col gap-5 text-sm text-text-secondary md:flex-row md:items-center md:justify-between"
```

**Variants:**

- None

**Rules:**

- Use project navigation labels and token-based typography only.

### AppHeader

**Path:** `components/layout/AppHeader.tsx`

**Purpose:**

Authenticated workspace header with product identity, primary app navigation, New Document action, user/account control, and mobile menu.

**Used on:**

- Authenticated app layout
- `/dashboard`
- `/documents`
- `/documents/new`
- `/documents/[id]`
- `/account`

**Core classes:**

```txt
className="border-b border-border-light bg-background-soft/95 px-4 py-3 backdrop-blur"
className="mx-auto flex min-h-[72px] max-w-[1200px] items-center justify-between rounded-2xl border border-border-light bg-surface px-4 shadow-card-soft md:px-6"
className="hidden items-center gap-8 md:flex"
className="mx-auto mt-3 max-w-[1200px] rounded-2xl border border-border-light bg-surface p-3 shadow-card-soft md:hidden"
className="border-b border-border-light bg-background-soft/95 px-3 py-2 backdrop-blur md:px-5"
className="mx-auto flex min-h-14 max-w-[1280px] items-center justify-between rounded-2xl border border-border-light bg-surface px-4 shadow-card-soft md:px-5"
```

**Variants:**

- Clerk enabled - shows Clerk `UserButton` for signed-in users and Log in for signed-out users.
- Clerk missing - shows a fallback account avatar.

**Rules:**

- Keep navigation visually consistent with `PublicNavbar`; the editor refinement uses the compact rounded header shell and circular logo mark from the editor design while preserving authenticated app links.
- Active item uses `text-accent`.
- Mobile navigation is a compact dropdown, not a sidebar.

### PageShell

**Path:** `components/layout/PageShell.tsx`

**Purpose:**

Shared authenticated page container with project max-width, page padding, and section gap.

**Used on:**

- Authenticated app pages

**Core classes:**

```txt
className="flex-1 bg-background px-4 py-6 md:px-6 md:py-8"
className="mx-auto flex max-w-[1200px] flex-col gap-6"
```

**Variants:**

- None

**Rules:**

- Use for authenticated pages before feature-specific page content.

### PageHeader

**Path:** `components/layout/PageHeader.tsx`

**Purpose:**

Shared authenticated page header with optional eyebrow and actions.

**Used on:**

- Dashboard shell
- Documents shell
- New document shell
- Document placeholder shell
- Account shell

**Core classes:**

```txt
className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-6 shadow-card-soft md:flex-row md:items-end md:justify-between"
```

**Variants:**

- With actions - displays right-aligned action group on desktop.
- Without actions - title and description only.

**Rules:**

- Use for authenticated workspace pages that need a consistent page title pattern.

---

## Marketing Components

### Hero

**Path:** `components/marketing/Hero.tsx`

**Purpose:**

Homepage hero with product promise, proof points, and primary CTA.

**Used on:**

- Homepage

**Core classes:**

```txt
className="px-4 pb-10 pt-16 md:pb-12 md:pt-20"
className="max-w-4xl text-[34px] font-bold leading-[42px] text-text-primary md:text-[42px] md:leading-[52px] lg:text-[64px] lg:leading-[72px]"
className="flex size-5 items-center justify-center rounded-full bg-accent text-accent-foreground"
```

**Variants:**

- None

**Rules:**

- Primary CTA text must not repeat "Get Started".
- CTA points to `/login` until Clerk auth-aware routing is added.
- Proof points use small accent check markers to match the landing design.

### OptimizationPreview

**Path:** `components/marketing/OptimizationPreview.tsx`

**Purpose:**

Large product-workspace visual showing document suggestions, preview-first editing, document quality, and insights.

**Used on:**

- Homepage

**Core classes:**

```txt
className="mx-auto max-w-[1200px] rounded-2xl border border-border-light bg-surface p-2 shadow-card"
className="grid gap-4 bg-surface-secondary p-4 lg:grid-cols-[270px_minmax(0,1fr)_270px]"
className="relative flex size-20 shrink-0 items-center justify-center rounded-full bg-[conic-gradient(var(--color-accent)_86%,var(--color-accent-light)_0)]"
className="grid grid-cols-[80px_1fr_28px] items-center gap-2 text-xs"
```

**Variants:**

- None

**Rules:**

- Use mock data only during homepage UI phase.
- Must communicate preview-first edits and structure preservation.
- Document Quality card uses a conic score ring, summary progress bar, and score-mapped metric bars.

### HowItWorks

**Path:** `components/marketing/HowItWorks.tsx`

**Purpose:**

Four-step process section for upload/create, analysis, suggestions, and export.

**Used on:**

- Homepage

**Core classes:**

```txt
className="mx-auto max-w-[1200px]"
className="relative mt-7 grid gap-8 md:grid-cols-4 md:gap-6"
className="absolute left-[12.5%] right-[12.5%] top-8 hidden border-t border-dashed border-border-strong md:block"
className="relative z-10 mx-auto flex size-16 items-center justify-center rounded-full border border-border-light bg-accent-lighter text-accent shadow-card-soft"
```

**Variants:**

- None

**Rules:**

- Keep the process to four concise steps from the build plan.
- Desktop uses an unframed timeline with icon circles, numbered chips, and a dotted connector.
- Mobile stacks steps vertically without the connector line.

### Features

**Path:** `components/marketing/Features.tsx`

**Purpose:**

Feature cards for document safety, AI control, versioning, and export workflow.

**Used on:**

- Homepage

**Core classes:**

```txt
className="mx-auto grid max-w-[1200px] gap-4 md:grid-cols-2 lg:grid-cols-4"
className="flex items-center gap-4 rounded-xl border border-border-light bg-surface p-4 shadow-card-soft"
className="flex size-14 shrink-0 items-center justify-center rounded-xl"
```

**Variants:**

- None

**Rules:**

- Use cards only for individual repeated feature items.
- Match the landing reference with compact horizontal cards and colored icon tiles.

### BottomCta

**Path:** `components/marketing/BottomCta.tsx`

**Purpose:**

Final homepage CTA section focused on version-safe document improvement.

**Used on:**

- Homepage

**Core classes:**

```txt
className="mx-auto max-w-[1200px] rounded-2xl border border-border bg-surface p-8 text-center shadow-card md:p-10"
```

**Variants:**

- None

**Rules:**

- CTA points to `/login` until Clerk auth-aware routing is added.

---

## Dashboard Components

### DashboardQuickActions

**Path:** `components/dashboard/DashboardQuickActions.tsx`

**Purpose:**

Three primary dashboard action cards linking users into the document creation flow.

**Used on:**

- `/dashboard`

**Core classes:**

```txt
className="grid min-w-0 gap-4 lg:grid-cols-3"
className="group relative flex min-h-[94px] min-w-0 items-center gap-4 rounded-xl border border-border bg-surface px-5 py-4 shadow-card-soft transition hover:border-border-strong hover:shadow-card"
className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-border-light bg-accent-lighter text-accent shadow-card-soft"
className="block truncate whitespace-nowrap text-xs font-semibold leading-4 text-text-primary"
className="absolute bottom-4 right-4 flex size-6 items-center justify-center rounded-md bg-accent-lighter text-accent"
```

**Variants:**

- None

**Rules:**

- Quick action cards navigate to `/documents/new`.
- Use lucide icons and token-based accent surfaces only.
- Arrow control is a small visual affordance anchored to the lower-right of each card.

### DocumentStats

**Path:** `components/dashboard/DocumentStats.tsx`

**Purpose:**

Dashboard stat card grid for document count, AI actions, exports, and quality score.

**Used on:**

- `/dashboard`

**Core classes:**

```txt
className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-4"
className="flex min-h-[112px] min-w-0 flex-col justify-between rounded-xl border border-border bg-surface px-4 py-4 shadow-card-soft"
className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border-light"
className="whitespace-nowrap text-[11px] font-semibold leading-4 text-text-secondary"
className="mt-1 text-[26px] font-bold leading-8 text-text-primary"
```

**Variants:**

- `accent`, `ai`, `info`, `success` icon/progress variants.

**Rules:**

- Use token variants only.
- Progress widths are supplied as fixed Tailwind width classes.
- Non-progress helpers use a small success arrow indicator.

### RecentDocuments

**Path:** `components/dashboard/RecentDocuments.tsx`

**Purpose:**

Recent document overview with desktop table and mobile document cards.

**Used on:**

- `/dashboard`

**Core classes:**

```txt
className="rounded-2xl border border-border bg-surface p-6 shadow-card-soft"
className="mt-5 space-y-3 md:hidden"
className="mt-5 hidden overflow-x-auto md:block"
```

**Variants:**

- Mobile card list.
- Desktop/tablet scanning table.

**Rules:**

- Document rows/cards link to `/documents/[id]`.
- Always show document status and fidelity badges.
- Accepts real dashboard records with DOCX, PDF, MD, TXT, or None file types.

### RecentActivity

**Path:** `components/dashboard/RecentActivity.tsx`

**Purpose:**

Recent dashboard activity list with compact status badges and icons.

**Used on:**

- `/dashboard`

**Core classes:**

```txt
className="min-w-0 rounded-2xl border border-border bg-surface p-6 shadow-card-soft"
className="flex min-w-0 items-center gap-3 py-3"
```

**Variants:**

- `ai`, `info`, `success`, `warning` activity variants.

**Rules:**

- Keep labels short and human-readable.
- Hide secondary badges on small screens when space is tight.
- Activity icons are selected from the activity `kind` prop so data services do not import UI icons.

### SuggestionsReady

**Path:** `components/dashboard/SuggestionsReady.tsx`

**Purpose:**

Dashboard panel showing mock pending improvement suggestions.

**Used on:**

- `/dashboard`

**Core classes:**

```txt
className="min-w-0 rounded-2xl border border-border bg-surface p-6 shadow-card-soft"
className="mt-4 min-w-0 divide-y divide-border-light"
```

**Variants:**

- `ai`, `info`, `warning` suggestion variants.

**Rules:**

- This is dashboard preview UI only; full suggestion review is built in the Suggestions phase.
- Suggestion icons are selected from the suggestion `kind` prop so data services do not import UI icons.

### UsageSummary

**Path:** `components/dashboard/UsageSummary.tsx`

**Purpose:**

Dashboard side panel for usage overview and export-format distribution.

**Used on:**

- `/dashboard`

**Core classes:**

```txt
className="space-y-4"
className="rounded-2xl border border-border bg-surface p-5 shadow-card-soft"
className="mx-auto mt-4 flex size-28 items-center justify-center rounded-full bg-[conic-gradient(var(--color-accent)_68%,var(--color-accent-light)_0)] p-2.5"
className="mx-auto flex size-28 items-center justify-center rounded-full bg-[conic-gradient(var(--color-accent)_0_50%,var(--color-info)_50%_75%,var(--color-success)_75%_87%,var(--color-warning)_87%_95%,var(--color-text-soft)_95%_100%)] p-4"
className="mt-5 grid items-center gap-5 sm:grid-cols-[132px_minmax(0,1fr)]"
className="h-8 appearance-none rounded-md border border-border bg-surface py-1 pl-3 pr-8 text-xs font-medium text-text-secondary"
```

**Variants:**

- Usage progress list.
- Export-format donut chart with PDF, DOCX, TXT, MD, and Other legend rows.
- Native date-range dropdown controls for Today, This Week, This Month, and This Year.

**Rules:**

- Use project accent tokens for chart-like dashboard visuals.
- Date filters are local UI controls only until the real-data phase wires filtered queries.
- Usage counts, AI action total, and export-format distribution are supplied by the dashboard service.

---

## Upload Components

### UploadTabs

**Path:** `components/upload/UploadTabs.tsx`

**Purpose:**

Tabbed container for the three document creation methods (Upload File, Create Blank, Paste Text) on `/documents/new`.

**Used on:**

- `/documents/new`

**Rules:**

- Holds the active-tab state and renders `UploadDropzone`, `BlankDocumentForm`, or `PasteTextForm`.
- Uses `role="tablist"` / `role="tab"` / `role="tabpanel"` for accessibility.

### UploadDropzone

**Path:** `components/upload/UploadDropzone.tsx`

**Purpose:**

Drag-and-drop / choose-file zone that uploads a file to `POST /api/upload`, shows uploading + parsing state, and redirects to the new document.

**Used on:**

- `/documents/new` (Upload File tab)

**Variants:**

- idle — drop zone with Choose File button
- uploading — CometSpinner with "Uploading & analyzing…" and the file name
- error — `InlineAlert` (error) below the zone

**Rules:**

- Client-side validates type/size via `validateUpload` before sending (server re-validates).
- Sends `multipart/form-data`; does not set `Content-Type` manually.
- Shows a warning toast when the API returns formatting warnings.

### BlankDocumentForm

**Path:** `components/upload/BlankDocumentForm.tsx`

**Purpose:**

Creates a blank document via `POST /api/documents` (`sourceType: "blank"`) and redirects to the editor.

**Used on:**

- `/documents/new` (Create Blank tab)

**Rules:**

- Title uses the shared clean-character allowlist (`TITLE_ALLOWED_PATTERN`) with inline error + `aria-invalid`.
- Uses `LoadingButton`; success/error via `appToast`.

### PasteTextForm

**Path:** `components/upload/PasteTextForm.tsx`

**Purpose:**

Creates a document from pasted text via `POST /api/documents` (`sourceType: "paste"`) and redirects to the editor.

**Used on:**

- `/documents/new` (Paste Text tab)

**Rules:**

- Title uses the shared allowlist; content is required and capped at `DOCUMENT_CONTENT_MAX`.
- Shows live word/character count; uses `LoadingButton` and `appToast`.

### SupportedFormats / WhatHappensNext / RecentUploads / UploadTips

**Path:** `components/upload/*.tsx`

**Purpose:**

Informational sidebar and helper sections on the upload page (supported formats, post-upload steps, recent uploads, tips). Presentational only.

**Used on:**

- `/documents/new`

**Rules:**

- Static/presentational; no data wiring required for the current phase.

---

## Document Components

### DocumentStatusBadge

**Path:** `components/documents/DocumentStatusBadge.tsx`

**Purpose:**

Reusable document status badge for ready, draft, processing, failed, and archived states.

**Used on:**

- `/dashboard`
- Future document lists and editor headers

**Core classes:**

```txt
className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium"
```

**Variants:**

- `Ready` - `bg-success-muted text-success-foreground`
- `Draft` - `bg-surface-tertiary text-text-secondary`
- `Processing` - `bg-ai-muted text-ai-dark`
- `Failed` - `bg-error-muted text-error-foreground`
- `Archived` - `bg-surface-secondary text-text-muted`

**Rules:**

- Match document status token mappings from `ui-tokens.md`.
- Export `DocumentStatus` for dashboard data type compatibility.

### FidelityBadge

**Path:** `components/documents/FidelityBadge.tsx`

**Purpose:**

Reusable document fidelity badge for formatting and source preservation status.

**Used on:**

- `/dashboard`
- Future document lists and editor headers

**Core classes:**

```txt
className="inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium"
```

**Variants:**

- `Structure Preserved` - `bg-success-muted text-success-foreground`
- `Original Preserved` - `bg-info-muted text-info-foreground`
- `Limited Formatting` - `bg-warning-muted text-warning-foreground`
- `Plain Text Only` - `bg-surface-tertiary text-text-muted`
- `Formatting Review Needed` - `bg-ai-muted text-ai-dark`

**Rules:**

- Match fidelity token mappings from `ui-tokens.md`.
- Export `FidelityStatus` for dashboard data type compatibility.

---

## Editor Components

> Task 13 built the editor workspace UI; Task 14 wired the center column to real document data. Task 16 added the AI Actions panel in the right rail (opened from AI Assistant). Task 20 upgraded the right-rail suggestions UI; Task 21 wired suggestions to Supabase with apply/ignore/apply-all logic. Still mock until later phases: sidebar nav switching, export, AI usage/user card, and bottom metrics bar.

### EditorWorkspace

**Path:** `components/editor/EditorWorkspace.tsx`

**Purpose:**

Client orchestrator for the document editor workspace. Receives a real `EditorDocument` plus server-loaded `initialSuggestions`, owns the TipTap editor instance (`useEditor` + StarterKit), local UI state (title text, save state, word/character counts, right-rail mode, suggestions open/closed, active filter, suggestion action loading), and the save handler. Composes the three-pane layout with a full-width metrics bar. Exports the `SaveState` type.

**Used on:**

- `/documents/[id]`

**Core classes:**

```txt
className="flex min-h-0 flex-1 flex-col bg-background px-3 py-3 md:px-5 xl:max-h-[calc(100vh-73px)] xl:h-[calc(100vh-73px)] xl:overflow-hidden"
className="mx-auto flex h-full min-h-0 max-w-[1280px] flex-col gap-3 xl:overflow-hidden"
className="grid min-h-0 gap-3 xl:min-h-0 xl:flex-1 xl:grid-rows-1 xl:overflow-hidden"
className="lg:grid-cols-[224px_minmax(0,1fr)] xl:grid-cols-[224px_minmax(0,1fr)_300px]"
className="lg:grid-cols-[64px_minmax(0,1fr)] xl:grid-cols-[64px_minmax(0,1fr)_300px]"
className="hidden items-center gap-2 rounded-lg bg-warning-muted px-3 py-1.5 text-xs text-warning-foreground xl:flex"
```

**Rules:**

- Only this file carries `"use client"`; it owns the editor and passes the `editor` instance + handlers down.
- TipTap uses `immediatelyRender: false` (required for Next SSR). Content comes from `editor_json`; save PATCHes `/api/documents/[id]` with `{ title, editorJson, currentMarkdown }` (server recomputes word count).
- Desktop single-viewport rule: at `xl` the workspace is height-capped to `100vh - 73px` (compact app header) with `max-h`, `overflow-hidden`, and `min-h-0` on every flex/grid ancestor. The column grid is the flex-grow row (`xl:flex-1 xl:min-h-0 xl:grid-rows-1`); the metrics bar is `shrink-0`. Each column passes `xl:min-h-0` and `xl:overflow-hidden` (sidebar may use `xl:overflow-y-auto`) so the canvas and suggestions list scroll internally instead of the page. Below `xl` the layout stacks and the page scrolls normally.
- Formatting fidelity warnings stay visible: below `xl` they use the full `InlineAlert`; at `xl` they become a compact one-line warning banner with truncated copy to preserve editor canvas height.
- Sidebar collapse is owned here via `sidebarCollapsed`; expanded desktop grid uses a 224px left rail and collapsed desktop grid uses a 64px icon rail so the editor canvas gains horizontal space.
- On mobile the canvas column comes first (`order-1`), then suggestions, then the sidebar rail.
- Right rail mode: `rightPanel: "suggestions" | "ai-actions"`. Documents that load with no server-side suggestions default to `AIActionsPanel` so users immediately see available AI actions after upload/create; documents with existing suggestions default to the suggestions rail. The suggestions rail does not include Export or a prominent AI Assistant CTA; AI actions are the primary panel when there are no suggestions and cannot collapse back into the empty suggestions placeholder. Back/close controls appear on AI actions only when there are existing suggestions to return to.
- Suggestion Review / Review Selected / Review All route users to `/documents/[id]/preview`; final document mutation happens only from the preview page. Ignore still calls the owned API route because it does not change document content. Initial suggestions are loaded on the server page; client refetch happens after AI runs and suggestion ignore actions.
- Inline AI suggestion highlighting is owned here by composing `SuggestionHighlight` with the base editor extensions. Pending suggestion `originalText` snippets become subtle ProseMirror decorations; card clicks focus the matching text, and highlight clicks focus the matching suggestion card.

### EditorSidebar

**Path:** `components/editor/EditorSidebar.tsx`

**Purpose:**

Left workspace rail: back-to-documents link, vertical workspace nav (Editor, AI Suggestions, Versions, Export, Document Info), AI usage card, and user card. Supports an expanded text rail and a collapsed icon rail. Fills column height (`h-full flex-col`) with usage + user controls pinned to the bottom via `mt-auto`.

**Used on:**

- `/documents/[id]`

**Variants:**

- Active nav item — `bg-accent-light text-accent`; inactive — `text-text-secondary hover:bg-surface-secondary`.
- Expanded rail — text labels, count badges, full AI usage card, and user card.
- Collapsed rail — 64px icon rail with expand/back buttons, icon-only nav, count bubbles, compact AI usage and user controls.

**Rules:**

- Takes `fileName`, `fileType`, and `saveState` from real document data for accessible labels/tooltips; AI usage and user card remain mock until Phase 9.
- Controlled by `collapsed` / `onCollapsedChange` from `EditorWorkspace`; collapsed icon buttons must keep `aria-label` and `title` values because visible labels are hidden.
- Exports `EditorNavKey`. Nav buttons are non-functional until later phases.

### EditorTopBar

**Path:** `components/editor/EditorTopBar.tsx`

**Purpose:**

Editor header row with an editable document title, a Save split button (primary Save + caret menu with Save / Save version), a fidelity indicator (via `indicators` slot), a version-history pill (`VersionMenu`), and undo/redo/comment/more controls.

**Used on:**

- `/documents/[id]`

**Rules:**

- `"use client"` (owns `openMenu: "save" | "version" | null` for mutual exclusion). Title is a controlled input (`title` + `onTitleChange`); changes mark the workspace dirty.
- Save is always visible as a split button: primary action saves via `onSave` (PATCH `/api/documents/[id]` with `editor.getMarkdown()`); caret opens an `EditorMenuPanel` with two `EditorMenuItem`s — **Save** (*"Update the working copy"*) and **Save version** (*"Create a recoverable snapshot"*). When clean, primary shows "Saved" with check; when dirty, accent "Save" with unsaved dot; when saving, spinner + "Saving". Caret rotates when open; Escape closes. Opening Save closes Version menu and vice versa.
- The version pill is delegated to `VersionMenu` (`currentVersionNumber`, `documentId`, `refreshKey`, controlled `open` / `onOpenChange`). Restore and preview remain Phase 7.
- Undo/redo are wired to the TipTap `editor` (disabled via `editor.can()`). Comment and more-options controls are visual affordances only and remain unwired until their feature scope exists.

### EditorMenu

**Path:** `components/editor/EditorMenu.tsx`

**Purpose:**

Shared dropdown primitives for editor top-bar menus (Save and Version history).

**Used on:**

- `/documents/[id]` (via `EditorTopBar`, `VersionMenu`)

**Rules:**

- `"use client"`. Exports `EditorMenuBackdrop`, `EditorMenuPanel` (right-aligned, `shadow-popover`, `p-1.5`), `EditorMenuSectionHeader`, `EditorMenuItem` (icon + label + optional description), `EditorMenuFooter`.

### VersionMenu

**Path:** `components/editor/VersionMenu.tsx`

**Purpose:**

Read-only version-history dropdown for the editor top bar. Shows the current version label and, on open, fetches and lists all versions for the document.

**Used on:**

- `/documents/[id]` (via `EditorTopBar`)

**Rules:**

- `"use client"`. Props: `currentVersionNumber`, `documentId`, `refreshKey`, controlled `open` / `onOpenChange`.
- Pill shows `Version N` + inline **Current** chip; chevron rotates when open. Lazy-fetches `GET /api/documents/[id]/versions` when opened. Current row uses subtle left accent border + light tint (not full block fill); source shown as a small pill badge; relative timestamp on the right. `EditorMenuSectionHeader` / `EditorMenuFooter` for consistent chrome. Escape and backdrop close. Rows are non-interactive; footer: *"Restore and preview coming in a later update."*

### EditorToolbar

**Path:** `components/editor/EditorToolbar.tsx`

**Purpose:**

Fully functional formatting toolbar. Receives the TipTap `editor` and wires block type (`<select>`: Normal/H1–H3), font family + font size (`<select>`s via TextStyleKit), bold, italic, underline, text color (`<input type="color">` → `setColor`), highlight, bullet/ordered lists, list indent (sink/lift list item), text align (left/center/right/justify), and inline code.

**Used on:**

- `/documents/[id]`

**Core classes:**

```txt
className="flex items-center gap-1 overflow-x-auto border-t border-border-light px-3 py-1.5"
```

**Rules:**

- Active controls use `bg-accent-light text-accent` via `editor.isActive(...)`; select values come from `editor.getAttributes("textStyle")` / heading state.
- Editor extensions are defined once in `lib/editor/editor-extensions.ts` (StarterKit + TextStyleKit + Highlight + TextAlign) and verified by `lib/editor/editor-extensions.test.ts`.

### EditorCanvas

**Path:** `components/editor/EditorCanvas.tsx`

**Purpose:**

Document canvas hosting the live TipTap `<EditorContent>` (real `editor_json`) plus a footer with word/character counts, language, and zoom controls.

**Used on:**

- `/documents/[id]`

**Core classes:**

```txt
className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-card-soft xl:min-h-0 xl:flex-1"
className="min-h-[320px] flex-1 overflow-y-auto bg-surface-secondary xl:min-h-0"
className="document-editor min-h-[320px] w-full origin-top bg-surface px-5 py-5 ... xl:min-h-0"
```

**Rules:**

- The document area scrolls internally (`overflow-y-auto`). At `xl` the canvas grows to fill the column (`xl:flex-1 xl:min-h-0`) and the document paper drops its fixed minimum height (`xl:min-h-0`) so long content scrolls inside the canvas instead of expanding the page. Below `xl` it keeps `min-h-[320px]` / `md:min-h-[480px]` and grows with content.
- The `.document-editor` wrapper applies token-based `.ProseMirror` styles defined in `app/globals.css` (headings, lists, code, blockquote, links).
- The canvas body intentionally has no outer padding and the document wrapper fills the available width; preserve only a smaller inner text inset to maximize usable editing space.
- Word/character counts are passed in from the workspace.
- This is a client component: zoom is functional (50%–200%, step 10, reset) via local state and a `transform: scale()` on the content wrapper.

### EditorSuggestionsPanel

**Path:** `components/editor/EditorSuggestionsPanel.tsx`

**Purpose:**

Right-rail AI Suggestions panel: panel header with total and pending counts, filter tabs (All/Clarity/Grammar/Tone/Structure/SEO), suggestion cards with original text, suggested text, explanation, type badge, pending/applied/ignored status, direct Apply/Ignore actions, selected/all review actions only when pending suggestions exist, and a compact empty state. Collapses to a "Show AI Suggestions" button when closed.

**Used on:**

- `/documents/[id]`

**Variants:**

- Type badges: `Clarity` → info, `Grammar` → success, `Tone` → ai, `Structure` → warning, `SEO` → accent.
- Suggestion card status: `pending` → AI muted card, `applied` → success muted card, `ignored` → secondary surface card.
- Empty state: dashed bordered surface with a document icon and guidance to run an AI action.

**Rules:**

- Exports `EditorSuggestion`, `SuggestionType`, `SuggestionStatus`, `SuggestionFilter`.
- At `xl` the panel fills the column (`xl:h-full xl:min-h-0`); the header, filters, and Apply-All footer are `shrink-0` and the card list scrolls internally (`xl:flex-1 xl:min-h-0 overflow-y-auto`).
- Single-card Apply posts to `POST /api/documents/[id]/suggestions/[suggestionId]/apply` and updates the editor content, counts, version number, save state, selected IDs, and suggestion list in place after the server creates a version snapshot. Review Selected and Review All still open `/documents/[id]/preview` through a server-backed selection before batch mutation. Ignore still calls the owned route because it only changes suggestion status.
- Export is not rendered in this rail; export belongs to the later preview/export flow.
- The selected/all review footer is hidden when there are no pending suggestions so disabled review controls do not consume panel space.
- Suggestion cards accept `activeSuggestionId` / `onFocusSuggestion` from `EditorWorkspace`. Active cards use `border-accent bg-accent-muted shadow-card-soft` and scroll into view when a highlighted document range is clicked.

### EditorStatusBar

**Path:** `components/editor/EditorStatusBar.tsx`

**Purpose:**

Compact center-column editor metric strip: Health, Readability, and SEO as small name + percentage pills.

**Used on:**

- `/documents/[id]`

**Core classes:**

```txt
className="flex shrink-0 flex-wrap items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 shadow-card-soft"
className="inline-flex min-w-0 items-center gap-2 rounded-full border border-border-light bg-surface px-3 py-1.5 shadow-card-soft"
```

**Rules:**

- AI and version status are intentionally not shown in this strip.
- Render inside the center editor column only, not across the full workspace width, so the sidebar and suggestions rail keep their own vertical space.
- Each pill shows only name + percentage.
- Percentage color threshold: red below 65, yellow from 65 to 79, green from 80 and above.
- Health derives its fallback score from `fidelityStatus`; readability and SEO remain estimated placeholders until real scoring exists.

---

## AI Components

### AIActionsPanel

**Path:** `components/ai/AIActionsPanel.tsx`

**Purpose:**

Right-rail AI action picker for the document editor. Shows nine compact AI action rows, collapsed optional settings (tone, audience, language, preserve-structure), processing/ready/error states, and preview-first reassurance. Wired in Phase 5 / 18 to run the selected action through `POST /api/documents/[id]/ai`.

**Used on:**

- `/documents/[id]` (via `EditorWorkspace`, opened from `EditorSuggestionsPanel` AI Assistant button)

**Core classes:**

```txt
className="flex flex-col rounded-xl border border-border bg-surface shadow-card-soft xl:min-h-0 xl:flex-1"
className="rounded-xl border p-3 ... border-ai bg-ai-muted" (selected action card)
className="rounded-lg border border-border-light bg-surface-secondary px-3 py-2" (collapsed settings disclosure)
```

**Variants:**

- Action cards with category-tinted icon tiles (ai, info, success, warning, accent).
- Status: idle, processing (`LoadingButton` + CometSpinner), ready (success strip + saved request id), error (`InlineAlert` + retry).

**Rules:**

- `"use client"`. Exports `AIActionSettings`, `AIActionStatus`.
- Props: optional `onBack` (return to suggestions when suggestions exist), optional `onClose` (collapse right rail when suggestions exist), `onRunAction` (provided by `EditorWorkspace`).
- `EditorWorkspace` sends the current `editor.getMarkdown()` and selected options to `POST /api/documents/[id]/ai`; the panel shows returned summary/id on success.
- Action settings are collapsed by default behind a settings disclosure with a one-line summary. Expanding exposes tone, audience, language, and preserve-structure controls; select controls use explicit right-side chevrons because native select appearance is suppressed.
- AI output remains preview-first. View preview links to `/documents/[id]/preview?requestId=...`; no document mutation happens from this panel.

### AIResultPreview

**Path:** `components/ai/AIResultPreview.tsx`

**Purpose:**

Client preview orchestrator for AI-generated document changes. Composes the premium review workflow as a full-width result workspace: editor-style document rail, top preview controls, metrics strip, current vs proposed comparison, editable proposed result, right insight rail, and preview-only Apply to Document.

**Used on:**

- `/documents/[id]/preview?requestId=...`
- `/documents/[id]/preview?suggestionId=...`
- `/documents/[id]/preview?selectionId=...`

**Core classes:**

```txt
className="flex min-h-0 flex-1 flex-col bg-background px-3 py-3 md:px-5 xl:h-[calc(100vh-73px)] xl:max-h-[calc(100vh-73px)] xl:overflow-hidden"
className="mx-auto grid h-full min-h-0 w-full max-w-[1600px] gap-3 xl:grid-cols-[252px_minmax(0,1fr)] xl:overflow-hidden"
className="order-2 rounded-xl border border-border bg-surface p-4 shadow-card-soft xl:order-1 xl:flex xl:h-full xl:min-h-0 xl:flex-col xl:overflow-hidden"
className="order-1 min-w-0 xl:order-2 xl:flex xl:h-full xl:min-h-0 xl:flex-col xl:overflow-hidden"
className="mt-3 grid min-h-0 gap-3 xl:flex-1 xl:grid-cols-[minmax(0,1fr)_300px] xl:overflow-hidden"
className="grid min-h-0 gap-3 rounded-xl border border-accent-light bg-accent-muted p-3 shadow-card-soft xl:flex xl:h-full xl:flex-col xl:overflow-hidden"
className="grid h-full min-h-[540px] gap-3 lg:grid-cols-2 xl:min-h-0 xl:overflow-hidden"
```

**Variants:**

- Full AI action output preview via `requestId`.
- Single suggestion preview via `suggestionId`.
- Multi-suggestion preview via server-backed `selectionId`.
- Summary metric strip for total proposed changes, category counts, and preview-only safety copy.
- Right insight rail with AI Summary, Change Navigator, and Document Safety cards.
- Empty revised result branch for analysis-only outputs.
- Formatting/fidelity warning branch when selected suggestions no longer match safely.

**Rules:**

- `"use client"`. Receives a discriminated preview payload from the server page.
- Apply sends `{ editedMarkdown }` to the relevant apply endpoint so the edited proposed result is what gets persisted.
- AI request apply calls `POST /api/documents/[id]/ai/[requestId]/apply`.
- Single suggestion apply calls `POST /api/documents/[id]/suggestions/[suggestionId]/apply`.
- Multi-suggestion apply calls `POST /api/documents/[id]/suggestions/selections/[selectionId]/apply`.
- Every apply path snapshots the current document before updating content.
- Regenerate appears only for full AI request previews; suggestion previews return to the editor.
- View modes: `side-by-side` default and `proposed-only`; sync scrolling defaults on in side-by-side mode and uses proportional scroll syncing.
- The proposed pane is a TipTap editor seeded from Markdown and marks `Edited preview` when changed.
- Desktop layout follows the editor workspace viewport pattern: fixed app-height shell below the header, `min-h-0` through the grid, hidden outer overflow, and internal scrolling in side rails plus original/proposed panes.
- Top and bottom Apply buttons share `canApply`, `isApplying`, and `handleApply`; both must stay disabled/loading together.
- Preview chrome is intentionally compact: view/sync controls live in a collapsed Comparison settings disclosure in the right AI rail, not above the document panes; warning strip and comparison gaps are reduced; and the bottom action bar stays short so the document panes get maximum vertical space. Change-count context belongs in the right AI Summary rail, not above the document panes.
- The right insight rail uses a tinted accent container to separate AI Summary, Changes, and Document Safety from the document comparison panes.
- The right insight rail order is Comparison settings, Changes, AI Summary. Changes is collapsed by default and shows a subtle count badge in the header so proposed edits remain visible without consuming rail height. Document Safety belongs in the bottom action bar, not the rail.
- The right insight rail itself should not scroll on desktop; let only long AI Summary content consume remaining space while Document Safety stays visible.

### PreviewComparison

**Path:** `components/ai/PreviewComparison.tsx`

**Purpose:**

Comparison workspace body for AI Result Preview. Hosts the read-only current pane and editable proposed pane, supports side-by-side/proposed-only view modes, and synchronizes scrolling proportionally when enabled.

**Used on:**

- `/documents/[id]/preview`

**Rules:**

- `"use client"`. Owns pane scroll refs and feedback-loop protection for sync scroll.
- Side-by-side is the default desktop review mode. Proposed-only hides the current pane for focused editing or smaller layouts.
- Change navigator anchors use approximate scroll ratios when exact section mapping is unavailable.
- Current and proposed pane bodies avoid outer padding so document content gets maximum horizontal space; keep a smaller readable inset inside the document surface itself.

### ReadOnlyCurrentDocument

**Path:** `components/ai/ReadOnlyCurrentDocument.tsx`

**Purpose:**

Read-only current document pane for preview comparison.

**Used on:**

- `/documents/[id]/preview` via `PreviewComparison`

**Rules:**

- Uses the existing `.document-editor` surface pattern for document-like reading.
- Never mutates document content.

### EditableProposedResult

**Path:** `components/ai/EditableProposedResult.tsx`

**Purpose:**

Editable TipTap proposed result pane. Seeds content from Markdown, serializes edited content with `editor.getMarkdown()`, and reports whether the preview was modified.

**Used on:**

- `/documents/[id]/preview` via `PreviewComparison`

**Rules:**

- `"use client"`. Uses shared `editorExtensions` with `contentType: "markdown"`.
- Shows `Edited preview` when the proposed result differs from the initial AI output.
- Header includes functional undo/redo controls wired to the TipTap editor history; controls are disabled when no undo/redo step is available.
- Apply must use this edited markdown.

### ChangeSummary / ChangeNavigator

**Path:** `components/ai/ChangeSummary.tsx`, `components/ai/ChangeNavigator.tsx`

**Purpose:**

Compact summary and lightweight change navigation for AI Result Preview.

**Used on:**

- `/documents/[id]/preview`

**Rules:**

- `ChangeSummary` remains available as a standalone component, but AI Result Preview does not render it above the document panes; preview change-count context is summarized inside the right AI Summary rail.
- `ChangeNavigator` is a collapsed-by-default disclosure with a subtle change-count badge; it only renders when useful text anchors are available and should not block preview if exact mapping is unavailable.

### PreviewModeToggle / SyncScrollToggle / PreviewActionBar

**Path:** `components/ai/PreviewModeToggle.tsx`, `components/ai/SyncScrollToggle.tsx`, `components/ai/PreviewActionBar.tsx`

**Purpose:**

Reusable preview controls for view mode, sync scrolling, and final preview actions.

**Used on:**

- `/documents/[id]/preview`

**Rules:**

- `PreviewModeToggle` supports `side-by-side` and `proposed-only`.
- `SyncScrollToggle` displays `Sync scrolling: On / Off`.
- `PreviewActionBar` renders the compact bottom action bar with Regenerate, Return to Editor, Apply to Document, and a `Safety checks passed` popover. The safety popover is absolutely positioned above the button so opening it does not increase footer height. It is scoped to the document comparison column only, not below the AI rail, so the AI rail keeps independent vertical space.

### SuggestionHighlight

**Path:** `lib/editor/suggestion-highlight.ts`

**Purpose:**

TipTap/ProseMirror extension for inline AI suggestion highlights in the editor.

**Used on:**

- `/documents/[id]` via `EditorWorkspace`

**Rules:**

- This is an editor utility, not a visual component. Pending suggestions are matched by snippet and rendered as subtle `.suggestion-highlight` decorations.
- Clicking a decoration reports the suggestion id to `EditorWorkspace`; active highlights use `.is-active`.
- Multi-paragraph or missing snippets are skipped gracefully.

---

## Suggestion Components

### SuggestionsList (service-backed editor rail)

The editor suggestions rail is implemented by `EditorSuggestionsPanel` inside `EditorWorkspace`. Reusable suggestion domain logic lives in `lib/suggestions/` and is consumed by the editor page, API routes, dashboard pending-suggestions query, AI persistence flow, direct single-suggestion apply, and preview-gated batch suggestion apply flow.

**Rules:**

- Single-card Apply mutates the document through the owned server apply route, then refreshes editor content and suggestion state in place.
- Single suggestion preview remains supported by `/documents/[id]/preview?suggestionId=...`, but the editor rail no longer uses it for the default card action.
- Review Selected and Review All create a short-lived server-backed selection, then navigate to `/documents/[id]/preview?selectionId=...`.
- Ignore remains available in the rail because it only marks suggestion status and does not change document content.
- Empty suggestions state must not strand users: show a compact `Choose AI Action` control that switches the right rail back to `AIActionsPanel`.
- After an AI action, `EditorWorkspace` reloads suggestions and only switches to the suggestions rail when fresh pending suggestions exist; otherwise it keeps the AI Actions panel visible with the preview-ready result.

---

## Version Components

_Empty._

---

## Export Components

_Empty._

---

## Usage Components

_Empty._

---

## Feedback Components

### AppToaster

**Path:** `components/feedback/AppToaster.tsx`

**Purpose:**

Global Sonner toaster mounted once in the root layout.

**Used on:**

- Root app layout

**Core classes:**

```txt
classNames.toast="border border-border bg-surface text-text-primary shadow-popover"
```

**Variants:**

- Sonner success, error, warning, and info toasts.

**Rules:**

- Mount once only.
- Use `appToast` helper instead of calling Sonner directly across feature components.

### LoadingButton

**Path:** `components/feedback/LoadingButton.tsx`

**Purpose:**

Async action button with disabled state and CometSpinner.

**Used on:**

- Future upload, save, AI, suggestion, and export actions

**Core classes:**

```txt
className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-70"
```

**Variants:**

- Default primary styling.
- Caller can extend classes for size or placement.

**Rules:**

- Use for async button actions.
- Disable while loading.

### InlineAlert

**Path:** `components/feedback/InlineAlert.tsx`

**Purpose:**

Persistent inline feedback for actionable notices, warnings, successes, and errors.

**Used on:**

- `/documents/new` shell placeholder
- Future upload, editor, AI, export, and warning states

**Core classes:**

```txt
className="flex gap-3 rounded-xl p-4"
```

**Variants:**

- `info` - `bg-info-muted text-info-foreground`
- `success` - `bg-success-muted text-success-foreground`
- `warning` - `bg-warning-muted text-warning-foreground`
- `error` - `bg-error-muted text-error-foreground`

**Rules:**

- Use for warnings or critical feedback that should not be toast-only.

### EmptyState

**Path:** `components/feedback/EmptyState.tsx`

**Purpose:**

Reusable calm empty state with icon, title, description, and optional action.

**Used on:**

- `/documents`
- `/documents/[id]` placeholder
- Future dashboard, suggestions, version, and usage empty states

**Core classes:**

```txt
className="rounded-2xl border border-border bg-surface p-8 text-center shadow-card-soft"
```

**Variants:**

- Optional custom icon.
- Optional action.

**Rules:**

- Use when a page or section has no data.
- Include a logical next action where useful.

### ErrorState

**Path:** `components/feedback/ErrorState.tsx`

**Purpose:**

Reusable page or section error state with recovery action.

**Used on:**

- Authenticated app error boundary
- Future failed page and section loads

**Core classes:**

```txt
className="rounded-2xl border border-error-light bg-error-muted p-8 text-center shadow-card-soft"
```

**Variants:**

- Optional action.

**Rules:**

- Use for critical errors that must be visible inline.
- Never show raw provider, SQL, or stack-trace errors.

### SkeletonBlock

**Path:** `components/feedback/SkeletonBlock.tsx`

**Purpose:**

Reusable card-shaped skeleton for page and section loading states.

**Used on:**

- Authenticated app loading boundary
- Login loading boundary
- Future dashboard, document list, editor, and account loading states

**Core classes:**

```txt
className="rounded-2xl border border-border bg-surface p-6 shadow-card-soft"
className="h-3 rounded-full bg-surface-tertiary"
```

**Variants:**

- `lines` controls number of skeleton rows.
- `className` extends container layout.

**Rules:**

- Use for page-level and section-level loading areas.
- Do not use CometSpinner for large page loading.

### CometSpinner

**Path:** `components/loading-ui/comet-spinner.tsx`

**Purpose:**

Small animated inline loading spinner.

**Used on:**

- LoadingButton
- Future compact loading states

**Core classes:**

```txt
className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-current"
```

**Variants:**

- `className` controls size.

**Rules:**

- Use only for compact inline or button loading states.

---

## UI Primitive Notes

Base shadcn/ui primitives should remain in:

```txt
components/ui/
````

Domain-specific components should not be placed in `components/ui/`.

Examples:

```txt
Correct:
components/documents/DocumentCard.tsx
components/ai/AIActionsPanel.tsx
components/feedback/LoadingButton.tsx

Avoid:
components/ui/DocumentCard.tsx
components/ui/AIActionsPanel.tsx
```

---

## Invariants

- Reuse existing components before creating new ones
- Do not create duplicate card, badge, button, alert, loading, or empty-state patterns
- Do not add one-off visual styles without registering the pattern
- Use project tokens from `ui-tokens.md`
- Follow UI rules from `ui-rules.md`
- Keep public and authenticated navigation visually consistent
- Register every completed reusable component
- Update this file when component classes or variants change
