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
className="auth-modal rounded-2xl border border-border bg-surface p-2 shadow-popover"
className="border-b border-border-light px-6 py-5 text-center"
```

**Variants:**

- Clerk enabled - renders Clerk sign-in/sign-up experience.
- Clerk enabled - renders a centered, platform-themed modal-style auth surface.
- Clerk missing - renders setup guidance.

**Rules:**

- Uses fallback redirects to `/dashboard` only when no Clerk `redirect_url` is present.
- Do not force redirect from this component; protected-page refreshes should return to the originally requested route after sign-in.
- Keep setup state visible until Clerk environment variables are configured.
- The `/login` page should not render a split marketing layout; keep the focus on the Clerk auth modal.
- Scoped `.auth-modal .cl-*` overrides in `app/globals.css` flatten Clerk's injected card/header/footer styles so the default Clerk modal chrome is not visible inside the project shell.

---

## Layout Components

### PublicNavbar

**Path:** `components/layout/PublicNavbar.tsx`

**Purpose:**

Public homepage navigation with logo, active landing links, login, and primary Get Started action.

**Used on:**

- Homepage

**Core classes:**

```txt
className="px-4 py-3 backdrop-blur"
className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between rounded-2xl border border-border-light bg-surface px-4 shadow-card-soft md:px-6"
```

**Variants:**

- None

**Rules:**

- Keep public and authenticated navigation visually consistent.
- Get Started points to `/login` until Clerk auth-aware routing is added.
- Only include middle navigation links for active homepage sections.

### Footer

**Path:** `components/layout/Footer.tsx`

**Purpose:**

Public footer with product identity, product links, safety reassurance, and copyright.

**Used on:**

- Homepage

**Core classes:**

```txt
className="border-t border-border-light bg-surface px-4 py-10"
className="mx-auto grid max-w-[1200px] gap-8 text-sm text-text-secondary md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-start"
className="border-t border-border-light pt-5 text-xs text-text-muted md:col-span-3 md:flex md:items-center md:justify-between"
```

**Variants:**

- None

**Rules:**

- Do not mirror the navbar as a single horizontal strip.
- Keep footer links limited to active homepage sections.
- Use the footer for product promise, safety reassurance, and muted legal copy.

### AppSidebar

**Path:** `components/layout/AppSidebar.tsx`

**Purpose:**

Collapsed-by-default authenticated workspace sidebar with product identity, primary app navigation, contextual document links, usage shortcut, and Clerk account control.

**Used on:**

- Authenticated app layout
- `/dashboard`
- `/documents/new`
- `/documents/[id]`
- `/account`

**Core classes:**

```txt
className="sticky top-0 flex h-screen shrink-0 flex-col border-r border-border-light bg-background-soft px-3 py-3 transition-[width]"
className="w-[64px] items-center"
className="w-[224px]"
className="flex size-9 items-center justify-center rounded-md"
className="flex items-center gap-3 rounded-md px-3 py-2"
```

**Variants:**

- Collapsed rail - 64px icon-only navigation with accessible labels and tooltips.
- Expanded rail - 224px text navigation with section labels.
- Document context - shows Editor, Versions, and Export links when the current route is a document workspace.
- Clerk enabled - shows Clerk `UserButton` for signed-in users.
- Clerk missing - shows a fallback account avatar.

**Rules:**

- Used by `app/(app)/layout.tsx`; all authenticated gated pages inherit it.
- Collapsed is the default state.
- Active item uses `text-accent`.
- `/documents` is the Documents Library and is a primary navigation target in the sidebar.
- Do not add a second persistent page-level navigation rail inside authenticated pages.
- Clerk `UserButton` uses platform-token appearance overrides for the account popover and profile modal. The expanded sidebar account chip shows the signed-in user's name beside the avatar, centered as a compact row. Portal-rendered Clerk surfaces are backed by `.cl-userButton*`, `.cl-popover*`, `.cl-userProfile*`, and `.cl-navbar*` overrides in `app/globals.css` to remove default footer/card/sidebar chrome, keep the account popover at a compact 292px width with truncated identifiers, and align borders, shadows, hover states, active nav, and modal backdrop with the app theme.

### PageShell

**Path:** `components/layout/PageShell.tsx`

**Purpose:**

Shared authenticated page container with project max-width, page padding, and section gap.

**Used on:**

- Authenticated app pages

**Core classes:**

```txt
className="flex-1 bg-background px-4 py-5 md:px-6 md:py-6"
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
- New document shell
- Account shell
- Version history workspace
- Export workspace

**Core classes:**

```txt
className="flex flex-col gap-5 rounded-2xl md:flex-row md:items-end md:justify-between"
className="text-xs font-semibold uppercase tracking-normal text-text-muted"
className="mt-2 text-[28px] font-bold leading-9 text-text-primary md:text-[40px] md:leading-[48px]"
className="mt-3 text-base leading-[26px] text-text-secondary"
```

**Variants:**

- With eyebrow - renders compact uppercase context label above the title.
- With actions - displays right-aligned action group on desktop.
- Without actions - title and description only.

**Rules:**

- Use for authenticated workspace pages that need a consistent page title pattern.
- Required for authenticated pages except the full document editor and AI result preview workspaces.

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

Large product-workspace screenshot showing the editor, AI actions, and document quality metrics.

**Used on:**

- Homepage

**Core classes:**

```txt
className="mx-auto max-w-[1200px] overflow-hidden rounded-2xl border border-border-light bg-surface p-2 shadow-card"
className="aspect-[1822/1078] w-full rounded-xl object-cover"
```

**Variants:**

- None

**Rules:**

- Uses the static image at `public/May_riley_resume.png`.
- Keep the screenshot framed in the same token-based landing card shell.
- Preserve the image aspect ratio so the workspace chrome does not stretch.

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

### DocumentSafety

**Path:** `components/marketing/DocumentSafety.tsx`

**Purpose:**

Confidence section explaining preview-first AI, original-file preservation, version-safe edits, and private file handling.

**Used on:**

- Homepage

**Core classes:**

```txt
className="px-4 pt-16"
className="mx-auto grid max-w-[1200px] gap-10 border-t border-border-light pt-16 lg:grid-cols-[0.72fr_1fr] lg:gap-14"
className="grid border-border-light md:grid-cols-2 md:border-l"
className="border-border-light py-7 md:border-r md:px-9 md:py-9 lg:min-h-[210px]"
```

**Variants:**

- None

**Rules:**

- Use this as the `#document-safety` navbar/footer destination.
- Keep claims concrete and aligned with implemented preview/version/private-storage behavior.
- Match the confidence reference layout: left copy column, right 2x2 divider grid, no individual cards.

### SupportedFormats

**Path:** `components/marketing/SupportedFormats.tsx`

**Purpose:**

Homepage confidence section that sets clear expectations for DOCX, PDF, Markdown, and TXT support.

**Used on:**

- Homepage

**Core classes:**

```txt
className="px-4 pt-12"
className="mx-auto grid max-w-[1200px] gap-10 border-t border-border-light pt-12 lg:grid-cols-[0.72fr_1fr] lg:items-center lg:gap-14"
className="overflow-hidden rounded-xl border border-border bg-surface shadow-card-soft"
className="grid gap-4 border-b border-border-light p-4 last:border-b-0 md:grid-cols-[64px_92px_minmax(0,1fr)_160px]"
```

**Variants:**

- None

**Rules:**

- Use this as the `#supported-formats` navbar/footer destination.
- Be explicit about PDF formatting limits; do not imply pixel-perfect PDF editing.
- Render formats as one bordered list with row dividers, not separate cards.
- Status pills should wrap inside the row and not force horizontal overflow.

### UseCases

**Path:** `components/marketing/UseCases.tsx`

**Purpose:**

Homepage confidence section showing concrete document scenarios for resumes, reports, academic writing, and long-form drafts.

**Used on:**

- Homepage

**Core classes:**

```txt
className="px-4 pt-12"
className="mx-auto max-w-[1200px] border-t border-border-light pt-12"
className="mt-10 grid gap-0 md:grid-cols-2 lg:grid-cols-4"
className="border-border-light py-5 md:px-8 lg:min-h-[210px] lg:border-r lg:last:border-r-0"
```

**Variants:**

- None

**Rules:**

- Use this as the `#use-cases` navbar/footer destination.
- Keep use cases concrete and document-focused.
- Match the reference layout with centered copy and divided columns rather than cards.

### Features

**Path:** `components/marketing/Features.tsx`

**Purpose:**

Feature cards for document safety, AI control, versioning, and export workflow.

**Used on:**

- Homepage

**Core classes:**

```txt
className="mx-auto grid max-w-[1200px] overflow-hidden rounded-xl border border-border bg-surface shadow-card-soft md:grid-cols-2 lg:grid-cols-4"
className="flex items-center gap-4 border-b border-border-light p-5 last:border-b-0 md:[&:nth-child(n+3)]:border-b-0 md:[&:nth-child(odd)]:border-r lg:border-b-0 lg:border-r lg:last:border-r-0"
className="flex size-14 shrink-0 items-center justify-center rounded-full"
```

**Variants:**

- None

**Rules:**

- Use a single bordered feature band, not separate cards.
- Match the landing reference with compact horizontal items and colored circular icon tiles.

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

### StatCardGrid

**Path:** `components/workspace/StatCardGrid.tsx`

**Purpose:**

Shared KPI stat card grid used by the dashboard and account usage workspace.

**Used on:**

- `/dashboard` via `DocumentStats`
- `/account` via `AccountUsageWorkspace`

**Core classes:**

```txt
className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-4"
className="flex min-h-[152px] min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-card-soft"
className="flex size-7 shrink-0 items-center justify-center rounded-full"
className="truncate text-sm font-semibold leading-5 text-text-primary"
className="truncate text-xs leading-4 text-text-muted"
className="border-t border-border-light"
className="text-[2rem] font-bold leading-9 tracking-tight text-text-primary"
className="mt-1 truncate text-sm leading-5 text-text-secondary"
className="border-t border-border-light bg-surface-secondary px-4 py-2.5"
className="h-1.5 rounded-full bg-surface-tertiary"
```

**Variants:**

- `accent`, `ai`, `info`, `success` tone variants for icon surfaces, footer actions, and progress bars.
- Optional `meta` for the small header subtitle (for example `Status`, `Usage`).
- Optional `action` for the muted footer link row with arrow and chevron.
- Optional `progressClass` width utility for usage progress rows in the footer.
- Values may render as a single stat or split on ` / ` for paired counts.

**Rules:**

- Dashboard and account pages must use this component for KPI stat rows; do not fork separate stat card markup.
- Icons are supplied by the page or workspace adapter that maps service data into `StatCardItem`.
- `helper` is supporting copy below the metric; `action` is optional footer link text.
- Progress cards render the bar in the footer instead of an action link.
- Cards use a minimum 152px height so workspace grids remain stable.
- Header icons stay compact (`size-7` circle, `size-3.5` icon) for enterprise KPI styling.

### DateRangeSelect

**Path:** `components/workspace/DateRangeSelect.tsx`

**Purpose:**

Shared controlled date-range dropdown for analytics, usage, activity, and other time-filtered platform sections.

**Used on:**

- `/account` usage by category
- `/account` document readiness
- `/account` AI usage trend
- `/dashboard` usage overview

**Core classes:**

```txt
className="flex h-10 min-w-[132px] items-center justify-between gap-3 rounded-xl border bg-surface py-2 pl-4 pr-3"
className="absolute right-0 top-[calc(100%+4px)] z-50 min-w-full overflow-hidden rounded-md border border-border bg-surface p-1 shadow-popover"
className="w-full rounded-sm px-3 py-2 text-left text-sm font-medium text-text-primary"
```

**Variants:**

- Defaults to the shared `DATE_RANGE_OPTIONS` list: Today, This Week, This Month, and This Year.
- Accepts an optional subset through the `options` prop.

**Rules:**

- Keep the component controlled through `value` and `onChange` so each consumer owns its filtered data.
- Reuse this component instead of native date-range selects so option surfaces remain consistent across browsers.
- Preserve outside-click and Escape-key dismissal behavior.
- Date-range labels and the shared `DateRangeOption` type live in `lib/date-range.ts`.

### DashboardQuickActions

**Path:** `components/dashboard/DashboardQuickActions.tsx`

**Purpose:**

Three primary dashboard action cards linking users into the document creation flow.

**Used on:**

- `/dashboard`

**Core classes:**

```txt
className="grid min-w-0 gap-4 lg:grid-cols-3"
className="group relative flex h-[94px] min-w-0 items-center gap-4 rounded-xl border border-border bg-surface px-5 py-4 shadow-card-soft transition hover:border-border-strong hover:shadow-card"
className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-border-light bg-accent-lighter text-accent shadow-card-soft"
className="block truncate whitespace-nowrap text-sm font-semibold leading-5 text-text-primary"
className="mt-1.5 block text-xs leading-4 text-text-secondary"
className="absolute bottom-4 right-4 flex size-6 items-center justify-center rounded-md bg-accent-lighter text-accent"
```

**Variants:**

- None

**Rules:**

- Quick action cards navigate to `/documents/new`.
- Use lucide icons and token-based accent surfaces only.
- Arrow control is a small visual affordance anchored to the lower-right of each card.
- Cards use a fixed 94px height so the dashboard action row stays stable.
- Title copy uses card small-body scale (`text-sm font-semibold`); descriptions stay compact at `text-xs`.

### DocumentStats

**Path:** `components/dashboard/DocumentStats.tsx`

**Purpose:**

Dashboard adapter for the shared `StatCardGrid` KPI row.

**Used on:**

- `/dashboard`

**Core classes:**

```txt
Re-exports `StatCardGrid` from `components/workspace/StatCardGrid.tsx`
```

**Variants:**

- None

**Rules:**

- Pass `StatCardItem[]` with lucide icons and tone variants from the dashboard page.
- Do not add dashboard-only stat card markup here; extend `StatCardGrid` instead.

### RecentDocuments

**Path:** `components/dashboard/RecentDocuments.tsx`

**Purpose:**

Recent document overview with desktop table and mobile document cards.

**Used on:**

- `/dashboard`

**Core classes:**

```txt
className="flex h-[360px] min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface px-6 pt-6 pb-6 shadow-card-soft"
className="scrollbar-hidden mt-5 min-h-0 flex-1 space-y-3 overflow-y-auto pb-2 md:hidden"
className="scrollbar-hidden mt-5 hidden min-h-0 flex-1 overflow-auto pb-2 md:block"
```

**Variants:**

- Mobile card list.
- Desktop/tablet scanning table.
- Empty state with Start a Document action.

**Rules:**

- Document rows/cards link to `/documents/[id]`.
- The header action links back to `/dashboard`; `/documents` is not a standalone list route.
- Always show document status and fidelity badges.
- Accepts real dashboard records with DOCX, PDF, MD, TXT, or None file types.
- The card always keeps a 360px height, caps visible documents to five, and lets only the row/table area scroll with hidden scrollbars.
- Card title uses the shared card-heading scale (`text-lg font-semibold leading-7`), not section-heading scale.
- Empty and filled states must preserve the same card height.

### RecentActivity

**Path:** `components/dashboard/RecentActivity.tsx`

**Purpose:**

Recent dashboard activity list with compact status badges and icons.

**Used on:**

- `/dashboard`

**Core classes:**

```txt
className="flex h-[280px] min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface px-6 pt-6 pb-6 shadow-card-soft"
className="scrollbar-hidden mt-4 min-h-0 flex-1 divide-y divide-border-light overflow-y-auto pb-2"
className="flex min-h-0 flex-1 flex-col justify-center py-5"
```

**Variants:**

- `ai`, `info`, `success`, `warning` activity variants.
- Empty state - compact centered guidance when there is no activity.

**Rules:**

- Keep labels short and human-readable.
- Hide secondary badges on small screens when space is tight.
- Activity icons are selected from the activity `kind` prop so data services do not import UI icons.
- The card must render a real empty state instead of a blank panel when activity is unavailable.
- Show at most four activity items in the card. Use View all for deeper activity.
- Internal list scrolling keeps overflow behavior but hides scrollbar chrome via `scrollbar-hidden`.
- List primary lines use `text-sm font-semibold`; secondary/meta lines use `text-sm text-text-secondary`.
- Must match SuggestionsReady height so the bottom dashboard row stays aligned.

### SuggestionsReady

**Path:** `components/dashboard/SuggestionsReady.tsx`

**Purpose:**

Dashboard panel showing pending improvement suggestions.

**Used on:**

- `/dashboard`

**Core classes:**

```txt
className="flex h-[280px] min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface px-6 pt-6 pb-6 shadow-card-soft"
className="scrollbar-hidden mt-4 min-h-0 flex-1 divide-y divide-border-light overflow-y-auto pb-2"
className="flex min-h-0 flex-1 flex-col justify-center py-5"
```

**Variants:**

- `ai`, `info`, `warning` suggestion variants.
- Empty state - compact centered guidance when no suggestions are ready.

**Rules:**

- This is dashboard preview UI only; full suggestion review is built in the Suggestions phase.
- Suggestion icons are selected from the suggestion `kind` prop so data services do not import UI icons.
- The header count reflects the real `suggestions.length`; do not hardcode the suggestion count.
- Hide the Review All Suggestions action when no suggestions are ready.
- Show at most three suggestions in the card. Use Review All Suggestions for deeper review.
- Internal list scrolling keeps overflow behavior but hides scrollbar chrome via `scrollbar-hidden`.
- List primary lines use `text-sm font-semibold`; secondary/meta lines use `text-sm text-text-secondary`.
- Must match RecentActivity height so the bottom dashboard row stays aligned.

### UsageSummary

**Path:** `components/dashboard/UsageSummary.tsx`

**Purpose:**

Dashboard side panel for usage overview and export-format distribution.

**Used on:**

- `/dashboard`

**Core classes:**

```txt
className="min-w-0 space-y-6"
className="flex h-[420px] min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface px-6 pt-6 pb-6 shadow-card-soft"
className="text-lg font-semibold leading-7 text-text-primary"
className="h-10 appearance-none rounded-xl border border-border bg-surface py-2 pl-4 pr-10 text-sm font-medium text-text-secondary"
className="relative mx-auto mt-2 flex size-[92px] items-center justify-center"
className="mb-1 flex items-center justify-between gap-4 text-sm leading-5"
className="h-full w-(--bar-width) rounded-full bg-accent transition-[width]"
className="mt-auto flex w-full shrink-0 items-center justify-center rounded-md bg-accent-lighter px-4 py-2 text-sm font-medium text-accent"
className="flex h-[300px] min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface px-6 pt-6 pb-6 shadow-card-soft"
className="mx-auto flex size-24 items-center justify-center rounded-full p-3"
className="mt-4 grid min-h-0 flex-1 items-center gap-4 sm:grid-cols-[112px_minmax(0,1fr)]"
```

**Variants:**

- Usage progress list.
- Dynamic SVG usage ring with a `border`-token track stroke, `accent` progress stroke, and a bordered inner surface disc showing selected-range AI actions used against the dashboard action limit.
- Dynamic usage progress bars driven by numeric percentages from the dashboard service.
- Export-format donut chart with PDF, DOCX, TXT, MD, and Other legend rows using live count distribution.
- Shared `DateRangeSelect` control for Today, This Week, This Month, and This Year. Default visible range is This Week.

**Rules:**

- Use project accent tokens for chart-like dashboard visuals.
- Date filters switch between precomputed user-scoped dashboard usage snapshots; do not treat the selector as static UI.
- Usage counts, AI action total, usage bar percentages, and export-format distribution are supplied by the dashboard service.
- `View Usage Details` links to `/account#usage`.
- Usage Overview stays fixed at 360px in the dashboard analytics rail.
- Usage Overview rows are a fixed four-category set and must not use internal scrolling; tighten spacing instead.
- Exports by Format stays fixed at 300px and uses the standard PDF, DOCX, TXT, MD, and Other legend.

---

## Upload Components

### UploadTabs

**Path:** `components/upload/UploadTabs.tsx`

**Purpose:**

Tabbed container for the two current MVP document creation methods (Upload File, Paste Text) on `/documents/new`.

**Used on:**

- `/documents/new`

**Rules:**

- Holds the active-tab state and renders `UploadDropzone` or `PasteTextForm`.
- Uses `role="tablist"` / `role="tab"` / `role="tabpanel"` for accessibility.
- Sizes to the active tab's content and sits in an `items-start` page grid; it must not stretch to the taller guidance rail or viewport height.

### UploadDropzone

**Path:** `components/upload/UploadDropzone.tsx`

**Purpose:**

Drag-and-drop / choose-file zone that owns the full upload lifecycle: fingerprinting, resumable transfer, queued/parsing progress, duplicate review, failure recovery, and final redirect to the ready editor.

**Used on:**

- `/documents/new` (Upload File tab)

**Variants:**

- idle — drop zone with Choose File button
- uploading / paused — transfer percentage with pause/resume
- processing — queued, downloading, and parsing status inside the dropzone
- duplicate — Open Existing or Continue as New actions
- failed — Retry Processing or Delete actions
- error — `InlineAlert` (error) below the zone

**Rules:**

- Client-side validates type/size and computes SHA-256 before initialization.
- Never sends file bytes through Next.js; initialization and completion use JSON APIs.
- Shows real TUS progress with pause/resume.
- Polls the owner-scoped ingestion endpoint every two seconds after upload.
- Navigates to the editor only after atomic processing completion.
- Duplicate choices remain explicit and scoped to the authenticated user.
- `/documents/[id]` redirects active ingestions back to this upload state instead of rendering a separate processing page.
- Keep the idle drop zone at a compact `min-h-[240px]` baseline so Choose File remains above the fold.

### PasteTextForm

**Path:** `components/upload/PasteTextForm.tsx`

**Purpose:**

Creates a document from pasted text via `POST /api/documents` (`sourceType: "paste"`) and redirects to the editor.

**Used on:**

- `/documents/new` (Paste Text tab)

**Rules:**

- Title uses the shared allowlist; content is required and capped at `DOCUMENT_CONTENT_MAX`.
- Shows live word/character count; uses `LoadingButton` and `appToast`.
- The content field starts at `h-44` and remains vertically resizable; do not let it flex-fill the viewport and push Create Document below the fold.

### SupportedFormats / WhatHappensNext / RecentUploads / UploadTips

**Path:** `components/upload/*.tsx`

**Purpose:**

Informational sidebar and helper sections on the upload page (supported formats, post-upload steps, recent uploads, tips). Presentational only.

**Used on:**

- `/documents/new` — `UploadTips` and `WhatHappensNext` in the right sidebar; supported formats are shown in the upload dropzone copy instead of `SupportedFormats`.

**Rules:**

- Static/presentational; no data wiring required for the current phase.
- `UploadTips` uses the compact sidebar card pattern (280px column), not the former full-width banner layout.

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

Client orchestrator for the document editor workspace. Receives a real `EditorDocument` plus server-loaded `initialSuggestions`, owns the TipTap editor instance (`useEditor` + StarterKit), local UI state (title text, save state, word/character counts, right-rail mode, suggestions open/closed, active filter, suggestion action loading), and the save handler. Uses the global app sidebar from the authenticated layout, then composes the editor canvas and right AI rail. Exports the `SaveState` type.

**Used on:**

- `/documents/[id]`

**Core classes:**

```txt
className="flex min-h-0 flex-1 flex-col bg-background px-3 py-3 md:px-5 xl:h-screen xl:max-h-screen xl:overflow-hidden"
className="mx-auto flex h-full min-h-0 w-full max-w-[1600px] flex-col gap-3 xl:overflow-hidden"
className="grid min-h-0 gap-3 xl:min-h-0 xl:flex-1 xl:grid-cols-[minmax(0,1fr)_300px] xl:grid-rows-1 xl:overflow-hidden"
className="hidden items-center gap-2 rounded-lg bg-warning-muted px-3 py-1.5 text-xs text-warning-foreground xl:flex"
```

**Rules:**

- Only this file carries `"use client"`; it owns the editor and passes the `editor` instance + handlers down.
- TipTap uses `immediatelyRender: false` (required for Next SSR). Content comes from `editor_json`; save PATCHes `/api/documents/[id]` with `{ title, editorJson, currentMarkdown }` (server recomputes word count).
- Desktop single-viewport rule: at `xl` the workspace is height-capped to `100vh` because authenticated navigation is handled by the global sidebar. Use `max-h`, `overflow-hidden`, and `min-h-0` on every flex/grid ancestor. The column grid is the flex-grow row (`xl:flex-1 xl:min-h-0 xl:grid-rows-1`); the metrics bar is `shrink-0`. The canvas and suggestions list scroll internally instead of the page. Below `xl` the layout stacks and the page scrolls normally.
- Formatting fidelity warnings stay visible: below `xl` they use the full `InlineAlert`; at `xl` they become a compact one-line warning banner with truncated copy to preserve editor canvas height.
- The editor does not render its own persistent navigation rail; document navigation comes from `AppSidebar`.
- On mobile the canvas column comes first, then suggestions.
- Right rail mode: `rightPanel: "suggestions" | "ai-actions"`. Both panels expose a persistent Actions/Suggestions switch so users can move between them at any time. Documents that load with no server-side suggestions default to `AIActionsPanel`; documents with existing suggestions default to the suggestions rail.
- Single-card Apply mutates one owned suggestion immediately after the server snapshots first. Apply All sends only the selected AI action's pending suggestion ids, validates and applies that batch with one version snapshot, then updates editor state locally. The footer action then becomes Review Applied Suggestions and routes to `/documents/[id]/preview?applied=1` only when clicked. Ignore still calls the owned API route because it does not change document content. Initial AI action history and suggestions load together on the server page; completed action results merge into local state.
- Inline AI suggestion highlighting is owned here by composing `SuggestionHighlight` with the base editor extensions. Pending suggestion `originalText` snippets become subtle ProseMirror decorations; card clicks focus the matching text, and highlight clicks focus the matching suggestion card.

### EditorSidebar

**Path:** `components/editor/EditorSidebar.tsx`

**Purpose:**

Legacy document workspace rail used as the visual reference for `AppSidebar`. Current authenticated pages use `AppSidebar` from the app layout instead of rendering this as a persistent page-level rail.

**Used on:**

- Not rendered by the current authenticated shell

**Variants:**

- Active nav item — `bg-accent-light text-accent`; inactive — `text-text-secondary hover:bg-surface-secondary`.
- Expanded rail — text labels, count badges, full AI usage card, and user card.
- Collapsed rail — 64px icon rail with expand/back buttons, icon-only nav, count bubbles, compact AI usage and user controls.

**Rules:**

- Do not add this back as a second persistent rail unless the app shell direction changes.
- Keep it available only as a reference for document-specific navigation density and collapsed/expanded behavior.

### EditorTopBar

**Path:** `components/editor/EditorTopBar.tsx`

**Purpose:**

Editor header row with an editable document title, a Save split button (primary Save + caret menu with Save / Save version), a fidelity indicator (via `indicators` slot), a version-history pill (`VersionMenu`), and undo/redo controls.

**Used on:**

- `/documents/[id]`

**Rules:**

- `"use client"` (owns `openMenu: "save" | "version" | null` for mutual exclusion). Title is a controlled input (`title` + `onTitleChange`); changes mark the workspace dirty.
- Save is always visible as a split button: primary action saves via `onSave` (PATCH `/api/documents/[id]` with `editor.getMarkdown()`); caret opens an `EditorMenuPanel` with two `EditorMenuItem`s — **Save** (*"Update the working copy"*) and **Save version** (*"Create a recoverable snapshot"*). When clean, primary shows "Saved" with check; when dirty, accent "Save" with unsaved dot; when saving, spinner + "Saving". Caret rotates when open; Escape closes. Opening Save closes Version menu and vice versa.
- The version pill is delegated to `VersionMenu` (`currentVersionNumber`, `documentId`, `refreshKey`, controlled `open` / `onOpenChange`, `onRestoreVersion`). Version switches use the owned version restore endpoint and update the editor state in place without creating a new version row.
- Undo/redo are wired to the TipTap `editor` (disabled via `editor.can()`).

### EditorMenu Primitives

**Path:** `components/editor/EditorMenuBackdrop.tsx`, `components/editor/EditorMenuPanel.tsx`, `components/editor/EditorMenuSectionHeader.tsx`, `components/editor/EditorMenuItem.tsx`, `components/editor/EditorMenuFooter.tsx`

**Purpose:**

Shared dropdown primitives for editor top-bar menus (Save and Version history), split one component per file.

**Used on:**

- `/documents/[id]` (via `EditorTopBar`, `VersionMenu`)

**Rules:**

- `"use client"`. Import each primitive from its own file. `EditorMenuPanel` is right-aligned with `shadow-popover` and `p-1.5`; `EditorMenuItem` renders icon + label + optional description.

### VersionMenu

**Path:** `components/editor/VersionMenu.tsx`

**Purpose:**

Version-history dropdown for the editor top bar. Shows the current version label and, on open, fetches and lists all versions for the document with restore actions for non-current versions.

**Used on:**

- `/documents/[id]` (via `EditorTopBar`)

**Rules:**

- `"use client"`. Props: `currentVersionNumber`, `documentId`, `refreshKey`, controlled `open` / `onOpenChange`, `onRestoreVersion`.
- Pill shows `Version N` + inline **Current** chip; chevron rotates when open. Lazy-fetches `GET /api/documents/[id]/versions` when opened. Current row uses subtle left accent border + light tint (not full block fill); source shown as a small pill badge; relative timestamp on the right. Non-current rows are restore buttons with a compact restore affordance and row-level `CometSpinner` while the restore runs. `EditorMenuSectionHeader` / `EditorMenuFooter` for consistent chrome. Escape and backdrop close.
- Switching delegates to `EditorWorkspace`, which posts to `POST /api/documents/[id]/versions/[versionNumber]/restore`, updates TipTap content/counts/current version number from the response, clears active suggestion UI state, refreshes the route, and keeps the selected/current version label aligned with the version history page.

### EditorToolbar

**Path:** `components/editor/EditorToolbar.tsx`

**Purpose:**

Fully functional formatting toolbar. Receives the TipTap `editor` and wires block type (`<select>`: Normal/H1–H3), font family + font size (`<select>`s via TextStyleKit), bold, italic, underline, text color (`<input type="color">` → `setColor`), highlight, link add/remove, bullet/ordered lists, list indent (sink/lift list item), text align (left/center/right/justify), inline code, basic table insertion, and image insertion.

**Used on:**

- `/documents/[id]`

**Core classes:**

```txt
className="flex items-center gap-1 overflow-x-auto border-t border-border-light px-3 py-1.5"
```

**Rules:**

- Active controls use `bg-accent-light text-accent` via `editor.isActive(...)`; select values come from `editor.getAttributes("textStyle")` / heading state.
- Editor extensions are defined once in `lib/editor/editor-extensions.ts` (StarterKit + TextStyleKit + Highlight + TextAlign + Link + Image + Table + Markdown) and verified by `lib/editor/editor-extensions.test.ts`.

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
- The `.document-editor` wrapper applies token-based `.ProseMirror` styles defined in `app/globals.css` (headings, lists, code, blockquote, links, images, and tables).
- The canvas body intentionally has no outer padding and the document wrapper fills the available width; preserve only a smaller inner text inset to maximize usable editing space.
- Word/character counts are passed in from the workspace.
- This is a client component: zoom is functional (50%–200%, step 10, reset) via local state and a `transform: scale()` on the content wrapper.

### EditorSuggestionsPanel

**Path:** `components/editor/EditorSuggestionsPanel.tsx`

**Purpose:**

Right-rail AI Suggestions panel with a persistent Actions/Suggestions switch,
a compact selected-action title and timestamp row, adaptive type filters,
run-grouped suggestion cards, direct Apply/Ignore actions, Review Applied
Suggestions, Apply All, and compact empty states.

**Used on:**

- `/documents/[id]`

**Variants:**

- Type badges: `Clarity` → info, `Grammar` → success, `Tone` → ai, `Structure` → warning, `SEO` → accent.
- Suggestion card status: `pending` → AI muted card, `applied` → success muted card, `ignored` → secondary surface card.
- Empty state: dashed bordered surface with a document icon and guidance to run an AI action.

**Rules:**

- Exports `EditorSuggestion`, `SuggestionType`, `SuggestionStatus`, `SuggestionFilter`.
- At `xl` the panel fills the column (`xl:h-full xl:min-h-0`); the header, filters, and Apply-All footer are `shrink-0` and the card list scrolls internally (`xl:flex-1 xl:min-h-0 overflow-y-auto`).
- Single-card Apply posts to `POST /api/documents/[id]/suggestions/[suggestionId]/apply`. Apply All posts to `POST /api/documents/[id]/suggestions/apply-all`. Both update editor content, counts, version, save state, active highlight, and suggestion state locally after the server creates a version snapshot. The rail must not show checkboxes or selection mode. Review Applied Suggestions opens `/documents/[id]/preview?applied=1` as a read-only before/current comparison. Ignore still calls the owned route because it only changes suggestion status.
- Export is not rendered in this rail; export belongs to the later preview/export flow.
- The footer is shown when the selected AI action has pending or applied
  suggestions. It shows Apply All while that action has pending suggestions and
  changes to Review Applied Suggestions after the batch succeeds.
- The selected action metadata stays on one compact row: action title left,
  timestamp right. Do not render the action-history dropdown or repeat the AI
  summary beneath it.
- Type filters only render types present in the selected action and are hidden
  when only one type exists. Do not render visible All or Pending filters. An
  active type chip can be clicked again to clear the filter.
- Suggestion cards accept `activeSuggestionId` / `onFocusSuggestion` from `EditorWorkspace`. Active cards use `border-accent bg-accent-muted shadow-card-soft` and scroll into view when a highlighted document range is clicked.
- The panel no longer owns a separate loading-suggestions branch. Initial suggestions come from the server page, and completed AI responses merge their persisted suggestion rows directly into editor state.
- Current Optimization Highlights behavior: the visible category set is Grammar,
  Clarity, Tone, Conciseness, Structure, and Formatting. The legend filters both
  pending cards and inline highlights. Single-card Apply and Ignore remove the
  pending card/highlight optimistically and roll back if the owned route fails.
  Pending cards without a safe inline match show review-needed copy instead of
  being hidden.

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
- Status: idle, processing (`LoadingButton` + CometSpinner), ready (success strip + saved request id), error (`InlineAlert` with an in-alert retry button).

**Rules:**

- `"use client"`. Exports `AIActionSettings`, `AIActionStatus`.
- Props: `onShowSuggestions`, `suggestionCount`, optional `onClose`, and
  `onRunAction` (provided by `EditorWorkspace`).
- `EditorWorkspace` sends the current `editor.getMarkdown()` and selected options to `POST /api/documents/[id]/ai`. The panel stays in its compact processing state until the direct request returns a completed or failed result.
- While the request is pending, the Run button advances through timed progress
  copy for preparation, content processing, suggestion checking, and result
  finalization. The copy does not claim a percentage or authoritative backend
  stage; it provides visible progress during the request-bound operation.
- Completed responses include only the suggestions persisted for that AI request. `EditorWorkspace` de-duplicates and merges them locally, avoiding a follow-up full suggestions request.
- Action settings are collapsed by default behind a settings disclosure with a one-line summary. Expanding exposes tone, audience, language, and preserve-structure controls; select controls use explicit right-side chevrons because native select appearance is suppressed.
- AI output remains preview-first. View preview links to `/documents/[id]/preview?requestId=...`; no document mutation happens from this panel.
- The error-state Try again control lives inside the `InlineAlert` body and re-runs the selected action with the current settings rather than only resetting the panel to idle.

### AIResultPreview

**Path:** `components/ai/AIResultPreview.tsx`

**Purpose:**

Client preview orchestrator for AI-generated document changes. Composes the premium review workflow as a full-width read-only result workspace: current/proposed comparison panes, proposed result, right insight rail, and navigation/export actions.

**Used on:**

- `/documents/[id]/preview?requestId=...`
- `/documents/[id]/preview?suggestionId=...`
- `/documents/[id]/preview?selectionId=...`

**Core classes:**

```txt
className="flex min-h-0 flex-1 flex-col bg-background px-3 py-3 md:px-5 xl:h-screen xl:max-h-screen xl:overflow-hidden"
className="mx-auto grid h-full min-h-0 w-full max-w-[1600px] gap-3 xl:overflow-hidden"
className="min-w-0 xl:flex xl:h-full xl:min-h-0 xl:flex-col xl:overflow-hidden"
className="mt-3 grid min-h-0 gap-3 xl:flex-1 xl:grid-cols-[minmax(0,1fr)_300px] xl:overflow-hidden"
className="grid min-h-0 gap-3 rounded-xl border border-accent-light bg-accent-muted p-3 shadow-card-soft xl:flex xl:h-full xl:flex-col xl:overflow-hidden"
className="grid h-full min-h-[540px] gap-3 lg:grid-cols-2 xl:min-h-0 xl:overflow-hidden"
```

**Variants:**

- Full AI action output preview via `requestId`.
- Single suggestion preview via `suggestionId`.
- Multi-suggestion preview via server-backed `selectionId`.
- Right insight rail with Comparison settings and a full-height Change Navigator.
- Empty revised result branch for analysis-only outputs.
- Formatting/fidelity warning branch when pending batch suggestions no longer match safely.

**Rules:**

- `"use client"`. Receives a discriminated preview payload from the server page.
- Current and proposed panes receive rich `editor_json` when available so uploaded DOCX structure, links, images, tables, and marks render in preview instead of literal Markdown. Markdown remains the fallback for AI-only revised results.
- AI Result Preview is read-only. It must not expose proposed-result editing, Apply to Document, undo/redo, zoom, or fullscreen controls.
- Preview action bar exposes only Return to Editor and Export.
- View modes: `side-by-side` default and `proposed-only`; sync scrolling defaults on for side-by-side mode and uses proportional scroll syncing.
- The proposed pane is a non-editable TipTap view seeded from rich JSON or Markdown.
- Desktop layout follows the editor workspace viewport pattern: fixed app-height shell beside the global sidebar, `min-h-0` through the grid, hidden outer overflow, and internal scrolling in the right summary rail plus original/proposed comparison panes.
- Uses the global `AppSidebar`; the preview workspace does not render its own left navigation rail.
- Preview chrome is intentionally compact: view/sync controls live in a collapsed Comparison settings disclosure in the right AI rail, not above the document panes; warning strip and comparison gaps are reduced; and the bottom action bar stays short so the document panes get maximum vertical space.
- The right insight rail uses a tinted accent container to separate Comparison settings and Changes from the document comparison panes.
- The right insight rail order is Comparison settings, then Changes. Changes is open by default, fills the remaining rail height, and shows category labels plus source snippets so users can jump between proposed edits. Document Safety belongs in the bottom action bar, not the rail.
- The right insight rail itself should not scroll on desktop; the Changes list scrolls internally when the available rail height is full.

### PreviewComparison

**Path:** `components/ai/PreviewComparison.tsx`

**Purpose:**

Comparison workspace body for AI Result Preview. Hosts the read-only current pane and read-only proposed pane, supports side-by-side/proposed-only view modes, and synchronizes full-pane scrolling proportionally when enabled.

**Used on:**

- `/documents/[id]/preview`

**Rules:**

- `"use client"`. Owns pane scroll refs and feedback-loop protection for sync scroll.
- Side-by-side is the default review mode. Proposed-only hides the current pane for focused review or smaller layouts.
- Change navigator selection first scrolls to the exact active `data-suggestion-id` highlight in both current/proposed panes; approximate scroll ratios are only the fallback when a decoration is unavailable.
- Current and proposed pane bodies avoid outer padding so document content gets maximum horizontal space; keep a smaller readable inset inside the document surface itself.
- Passes `currentEditorJson` and `initialProposedEditorJson` through to TipTap panes when preview services provide structured content.

### ReadOnlyCurrentDocument

**Path:** `components/ai/ReadOnlyCurrentDocument.tsx`

**Purpose:**

Read-only current document pane for preview comparison.

**Used on:**

- `/documents/[id]/preview` via `PreviewComparison`

**Rules:**

- Uses the existing `.document-editor` surface pattern for document-like reading.
- Renders a non-editable TipTap instance. Prefer `editorJson` for rich document fidelity; fall back to Markdown parsing only when structured JSON is unavailable.
- Reuses `SuggestionHighlight` to decorate the active/current source text by suggestion category; clicking a highlight selects the matching Changes card.
- Never mutates document content.

### EditableProposedResult

**Path:** `components/ai/EditableProposedResult.tsx`

**Purpose:**

Read-only TipTap proposed result pane. Seeds content from rich JSON or Markdown and decorates proposed changes for review.

**Used on:**

- `/documents/[id]/preview` via `PreviewComparison`

**Rules:**

- `"use client"`. Uses shared `editorExtensions` with `editable: false`.
- Accepts `initialEditorJson` for rich proposed previews and falls back to Markdown content for AI-only revised results.
- Reuses `SuggestionHighlight` to decorate proposed `suggestedText` by suggestion category; clicking a highlight selects the matching Changes card.
- Does not expose editing controls, undo/redo, zoom, or fullscreen actions.

### ChangeSummary / ChangeNavigator / SuggestionChangeCard

**Path:** `components/ai/ChangeSummary.tsx`, `components/ai/ChangeNavigator.tsx`, `components/ai/SuggestionChangeCard.tsx`

**Purpose:**

Compact change navigation for AI Result Preview. `SuggestionChangeCard` provides the preview-review card pattern that reuses suggestion-card visual language without duplicating editor Apply/Ignore cards.

**Used on:**

- `/documents/[id]/preview`

**Rules:**

- `ChangeSummary` remains available as a standalone component, but AI Result Preview does not render it above the document panes.
- `ChangeNavigator` keeps the detailed list behind a collapsible Changes dropdown, open by default, and fills the remaining right-rail height. Do not add a separate highlights summary above it while the cards and document panes already show change context.
- `SuggestionChangeCard` preview-review mode must use the same compact structure for every card: affected-text title, category chip, tiny `before → after` hint, and one short impact sentence. Active state changes emphasis only through border/background; do not add Selected/View/Included status markers or numeric marker chips.
- The Changes column is the only scroll container. Do not make individual cards or card sections scrollable; cards should stay compact because the full current/proposed change is shown in the document panes.
- The right-rail container and navigator must use `min-w-0` and keep horizontal overflow contained at the list level so long suggestion text never exceeds the fixed preview column.
- In the narrow preview rail, `SuggestionChangeCard` should not duplicate full original/suggested text blocks; use only the compact hint because clicking the card scrolls to the exact change in the document panes.
- The active change is selected automatically when anchored changes exist so the rail has one outlined card while all cards remain visually consistent. Selecting a card or clicking a document highlight should smoothly reveal the matching active card in the Changes list.
- When focus is in the Changes list, ArrowDown selects the next change and ArrowUp selects the previous change.

### PreviewModeToggle / SyncScrollToggle / PreviewActionBar

**Path:** `components/ai/PreviewModeToggle.tsx`, `components/ai/SyncScrollToggle.tsx`, `components/ai/PreviewActionBar.tsx`

**Purpose:**

Reusable preview controls for view mode, sync scrolling, and final preview actions.

**Used on:**

- `/documents/[id]/preview`

**Rules:**

- `PreviewModeToggle` supports `side-by-side` and `proposed-only`.
- `SyncScrollToggle` displays `Sync scrolling: On / Off`.
- `PreviewActionBar` renders the compact bottom action bar with Return to Editor and Export only. Do not show Apply to Document, Regenerate, or Safety checks in this bar.
- Export links to `/documents/[id]/export`; the export workspace loads the current saved document by route id.

### SuggestionHighlight

**Path:** `lib/editor/suggestion-highlight.ts`

**Purpose:**

TipTap/ProseMirror extension for inline AI Optimization Highlights in the editor.

**Used on:**

- `/documents/[id]` via `EditorWorkspace`
- `/documents/[id]/preview` via `ReadOnlyCurrentDocument` and `EditableProposedResult`

**Rules:**

- This is an editor utility, not a visual component. Pending suggestions are matched by normalized document-wide snippet search and rendered as category-specific `.suggestion-highlight-*` decorations. Matching must work across formatted text-node splits and block boundaries.
- Decoration metadata includes stable suggestion id, optimization category, and issue label. Hover uses the native title tooltip with category and issue label.
- Clicking a decoration reports the suggestion id to `EditorWorkspace` or the preview Changes rail. Active highlights use `.is-active` as an outline/filter only so category-specific line styling remains visible.
- Missing snippets are skipped gracefully. The side panel keeps unmatched suggestions visible with review-needed copy.

---

## Suggestion Components

### SuggestionsList (service-backed editor rail)

The editor suggestions rail is implemented by `EditorSuggestionsPanel` inside `EditorWorkspace`. Reusable suggestion domain logic lives in `lib/suggestions/` and is consumed by the editor page, API routes, dashboard pending-suggestions query, AI persistence flow, direct single-suggestion apply, and preview-gated batch suggestion apply flow.

AI suggestions are actionable only when `originalText` resolves uniquely to the
document markdown used for that AI request. Persistence normalizes harmless
whitespace differences to the exact source slice and rejects missing or
ambiguous anchors before cards are created.

**Rules:**

- Single-card Apply mutates the document through the owned server apply route, then refreshes editor content and suggestion state in place.
- Single suggestion preview remains supported by `/documents/[id]/preview?suggestionId=...`, but the editor rail no longer uses it for the default card action.
- Review Applied Suggestions navigates to `/documents/[id]/preview?applied=1` for read-only comparison.
- Apply All sends an explicit owned batch request, validates every pending
  replacement, snapshots once, and updates the editor in place.
- Ignore remains available in the rail because it only marks suggestion status and does not change document content.
- Empty suggestions state must not strand users: show a compact `Choose AI Action` control that switches the right rail back to `AIActionsPanel`.
- After an AI action, `EditorWorkspace` reloads suggestions and only switches to the suggestions rail when fresh pending suggestions exist; otherwise it keeps the AI Actions panel visible with the preview-ready result.

---

## Version Components

### VersionHistoryWorkspace

**Path:** `components/versions/VersionHistoryWorkspace.tsx`

**Purpose:**

Real-data Version History workspace with shared `PageHeader`, version tabs, timeline, side-by-side selected/current version preview, change summary, version details rail, restore confirmation dialog, and empty export-version state.

**Used on:**

- `/documents/[id]/versions`

**Core classes:**

```txt
className="flex min-h-0 flex-1 flex-col bg-background px-3 py-3 md:px-5 xl:h-screen xl:max-h-screen xl:overflow-hidden"
className="mx-auto grid h-full min-h-0 w-full max-w-[1600px] gap-3 xl:grid-rows-1 xl:overflow-hidden"
className="flex min-h-0 flex-col gap-3 overflow-hidden xl:h-full"
className="flex shrink-0 flex-col gap-2 rounded-xl border border-border bg-surface px-3 py-2 shadow-card-soft"
className="grid min-h-0 flex-1 gap-3 xl:grid-cols-[240px_minmax(0,1fr)_288px] xl:overflow-hidden"
```

**Variants:**

- Tabs: All Versions, AI Versions, Manual Versions, Exports.
- Timeline states: selected row uses `bg-accent-muted`; current version shows a small `Current` badge.
- Restore confirmation: modal dialog with cancel and async restore action using `LoadingButton`.
- Empty state: Exports tab shows `EmptyState` until export versions are wired.

**Rules:**

- Receives real `document_versions` rows from the server page and compares the selected saved version with the live document row.
- Uses the global `AppSidebar`; the page itself starts with a compact header/tab band so the timeline, comparison panes, and details rail own the page space.
- Uses `PageHeader` for the primary title and actions.
- Desktop layout keeps supporting rails narrow: timeline around 240px, details around 288px, and the comparison column gets the remaining width.
- Restore actions live in the comparison header/details rail; the previous persistent desktop bottom action bar is intentionally not rendered so preview panes keep more height.
- Restore posts to `POST /api/documents/[id]/versions/[versionNumber]/restore`, shows Sonner feedback through `appToast`, and returns to the editor on success.
- Restore/switch updates the live document row to the selected saved version and must not create a new `document_versions` row. The editor and version history derive the current version from the latest validated `version_restore` usage metadata when available, then from the saved version whose content matches the live document.

---

## Export Components

### ExportWorkspace

**Path:** `components/export/ExportWorkspace.tsx`

**Purpose:**

Real export workspace with shared `PageHeader`, export format selection, export options, formatting warning, API-backed generation, automatic same-origin download, in-route success state, and sticky export summary rail. Document navigation comes from the global `AppSidebar`.

**Used on:**

- `/documents/[id]/export`

**Core classes:**

```txt
className="flex min-h-0 flex-1 flex-col bg-background px-3 py-3 md:px-5 xl:h-screen xl:max-h-screen xl:overflow-hidden"
className="mx-auto grid h-full min-h-0 w-full max-w-[1600px] gap-3 xl:grid-rows-1 xl:overflow-hidden"
className="grid min-h-0 gap-3 overflow-hidden xl:h-full xl:grid-cols-[minmax(0,1fr)_320px]"
className="min-h-0 overflow-y-auto rounded-xl border border-border bg-surface p-5 shadow-card-soft"
```

**Variants:**

- Formats: DOCX, PDF, Markdown, TXT, HTML.
- Export states: idle, processing with `CometSpinner`, ready success interface with primary download and secondary navigation actions, error with warning copy.

**Rules:**

- Export calls `POST /api/documents/[id]/export` with the selected format and options.
- The API verifies ownership, generates the file server-side, uploads to the private `exports` bucket, creates an `exports` row, records export usage, and returns a download route.
- Successful export automatically triggers the same-origin download route so DOCX, PDF, Markdown, TXT, and HTML download without navigating away from the export page.
- Successful export stays on `/documents/[id]/export` and swaps the main workspace area to `ExportSuccessPanel`; do not create a duplicate success route for this terminal export state.
- Uses the global `AppSidebar` document context links so export is reachable from the document workspace.
- Uses `PageHeader` for the primary title and secure export action chip.
- Summary rail stays narrow on desktop while the format/options workspace gets the remaining width.

### ExportFormatCard

**Path:** `components/export/ExportFormatCard.tsx`

Selectable export format card with icon swatch, extension, description, selected state, and `aria-pressed`.

### ExportOptionsPanel

**Path:** `components/export/ExportOptionsPanel.tsx`

Export configuration panel with token-styled toggle controls and compact select controls for image quality, page size, margins, and watermark.

### ExportSummaryPanel

**Path:** `components/export/ExportSummaryPanel.tsx`

Right-side export summary rail with selected document, format, options, document stats, applied AI improvement totals, loading/ready/error states, optional Download Again fallback, and secure export footer.

**Rules:**

- Applied AI improvement totals come from owned `suggestions` rows with `status = applied`, grouped by normalized suggestion type.
- Legacy `seo` suggestion rows count as Structure, and legacy `style` rows count as Tone.
- Do not render hardcoded category counts in this panel.

### ExportSuccessPanel

**Path:** `components/export/ExportSuccessPanel.tsx`

**Purpose:**

In-route export completion interface shown after a successful export generation and automatic download start.

**Used on:**

- `/documents/[id]/export`

**Core classes:**

```txt
className="min-h-0 overflow-hidden rounded-xl border border-border bg-surface shadow-card-soft"
className="h-full min-h-0 overflow-y-auto p-5 md:p-6"
className="mx-auto flex max-w-4xl flex-col items-center text-center"
className="mx-auto mt-5 max-w-4xl"
className="mx-auto mt-5 max-w-4xl rounded-xl border border-border bg-surface p-4 md:p-5"
className="mt-3 grid gap-3 md:grid-cols-3"
```

**Variants:**

- Primary Download File action reuses the returned export download route.
- Secondary actions link back to the editor, reset the workspace for another format, or open the Documents Library.
- Success icon uses small lucide `Sparkle` accents around the check mark to match the provided success mock without custom SVG or div art.

**Rules:**

- Render as the ready state of `ExportWorkspace`; do not add a standalone success page.
- Keep the primary and secondary actions directly under the success message so they are visible before the export details on desktop-height viewports.
- Keep the right-side `ExportSummaryPanel` visible on desktop so document, format, option, and stats context persists after completion.
- Use the completion timestamp captured by `ExportWorkspace` instead of recomputing the export time during render.

---

## Usage Components

### AccountUsageWorkspace

**Path:** `components/usage/AccountUsageWorkspace.tsx`

**Purpose:**

Full account and usage overview workspace with Supabase-backed usage analytics and a Clerk-aware account utility rail. The rail groups profile/workspace identity, account controls, storage management, data/privacy protections, and active-session access. The page-level title/actions live in `PageHeader`.

**Used on:**

- `/account`

**Core classes:**

```txt
className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]"
className="rounded-xl border border-border bg-surface p-4 shadow-card-soft"
```

**Variants:**

- Usage stat cards reuse `StatCardGrid` from `components/workspace/StatCardGrid.tsx`; map `AccountStat` rows to `StatCardItem` with label-based lucide icons.
- Chart-style sections for trend, category donut, category bars, and health score.
- Sticky 320px utility rail with five compact account-management cards.

**Rules:**

- Receives `AccountUsageData` from `lib/usage/account-usage.service.ts`.
- `/account` resolves Clerk profile details with `currentUser()` and scopes all Supabase usage reads to the authenticated Clerk user id.
- `/account` uses a wider `max-w-[1600px]` page container so the analytics workspace and right utility rail remain aligned.
- The account workspace presents the MVP as free and must not include pricing, subscription, invoice, upgrade, renewal, or paid-plan controls.
- Uses token colors and existing card/button/badge patterns only.
- Keeps `/account#usage` anchored to the usage content for the authenticated nav.
- Profile information, email/sign-in, security, and connected-account controls open Clerk's working user-profile modal.
- Do not display inactive account, export-management, notification, or privacy-setting actions when they are not prioritized for the active MVP.
- Session/access uses Clerk client state for provider, last-active time, and sign-out; it must not display fabricated account metadata.

### AccountUsageTrendChart

**Path:** `components/usage/AccountUsageTrendChart.tsx`

**Purpose:**

Client-side AI usage line chart with a working date-range selector for Today, This Week, This Month, and This Year.

**Used on:**

- `/account`

**Core classes:**

```txt
className="rounded-2xl border border-border bg-surface p-5 shadow-card-soft"
className="mt-5 grid h-64 grid-cols-[44px_minmax(0,1fr)] gap-4"
className="absolute inset-x-0 top-0 bottom-8 h-[calc(100%-2rem)] w-full overflow-visible"
```

**Variants:**

- Range selector: Today, This Week, This Month, This Year.
- SVG line with subtle filled area and token-colored marker.
- Token-styled callout positioned with approved Tailwind classes.

**Rules:**

- Receives precomputed trend series from `AccountUsageData.trends`.
- Uses the shared controlled `DateRangeSelect` for range selection.
- The selector changes local chart state only; no document or usage mutation happens.
- Keep the visual close to `context/designs/account and usage.png`: line chart, horizontal grid, y-axis labels, x-axis date labels, and compact callout.

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
- Sets `aria-busy` while loading.

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

- Dashboard, suggestions, version, upload, preview, and usage empty states

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

### Dashboard skeleton components

**Paths:**

- `components/feedback/SkeletonStatGrid.tsx`
- `components/feedback/SkeletonTable.tsx`
- `components/feedback/SkeletonPanel.tsx`
- `components/feedback/SkeletonUsageSummary.tsx`

**Purpose:**

Shared structural placeholders for route-level loading states that mirror the dashboard KPI grid, document table, list panels, and usage rail.

**Used on:**

- `/dashboard` loading boundary
- `/account` loading boundary
- `/documents` loading boundary

**Rules:**

- Keep fixed heights, responsive columns, and component order aligned with the loaded page to prevent layout movement.
- `SkeletonPanel` accepts only an optional `rows` count; it does not render section labels during loading.
- Do not wrap `SkeletonUsageSummary` in another `aside` landmark.
- Route loading boundaries should reuse the loaded page's stable header copy and responsive shell width.

### Document route loading boundaries

**Paths:**

- `app/(app)/documents/new/loading.tsx`
- `app/(app)/documents/[id]/loading.tsx`
- `app/(app)/documents/[id]/preview/loading.tsx`
- `app/(app)/documents/[id]/versions/loading.tsx`
- `app/(app)/documents/[id]/export/loading.tsx`

**Purpose:**

Route-specific skeleton screens for document creation and document workspaces. Each boundary preserves the final route's responsive columns, full-height behavior, panel order, and stable header content while server data resolves.

**Rules:**

- Full-height editor, preview, versions, and export loading screens must use the same `max-w-[1600px]` shell and desktop overflow behavior as their loaded workspaces.
- `/documents/new` must preserve the creation panel, 280px guidance rail, and secure-file footer geometry.
- `/documents/[id]/export` format-card skeletons must preserve the real `ExportFormatCard` anatomy: icon block, title line, extension line, and compact description lines inside each bordered card.
- `/documents/[id]/export` loading summary rail must align with the top of the format-card skeletons, not the section label or page header; keep the label inside the left column and offset the desktop summary rail accordingly.
- Use structural placeholders only; do not expose unknown document titles, versions, preview content, or export metadata during loading.
- Every route-level skeleton must expose `aria-busy="true"` and a concise loading label on its primary workspace region.

### CometSpinner

**Path:** `components/loading-ui/CometSpinner.tsx`

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

---

## Documents Library Components

### DocumentsLibraryWorkspace

**Path:** `components/documents/DocumentsLibraryWorkspace.tsx`

**Purpose:**

Client orchestrator for the Documents Library page. Owns URL state via `useSearchParams`/`useRouter`, manages rename/archive/delete dialog state, and composes `PageHeader`, summary cards, tabs, toolbar, table, and pagination. Calls `router.refresh()` after dialog actions to get fresh server data.

**Used on:**

- `/documents`

**Core classes:**

```txt
Passes data from server page; no unique structural classes — uses PageShell layout.
```

**Rules:**

- All filter/search/sort/page changes update URL params and reset page to 1 where appropriate.
- Dialog success triggers `router.refresh()` for fresh server data.
- Contains `NewDocumentDropdown` for the header primary action.

---

### DocumentsSummaryCards

**Path:** `components/documents/DocumentsSummaryCards.tsx`

**Purpose:**

Adapts the shared `StatCardGrid` with the four Documents Library summary cards: Total Documents, Ready, Suggestions Pending, and Formatting Review.

**Used on:**

- `/documents`

**Core classes:**

```txt
Delegates to StatCardGrid — no unique layout classes.
```

**Rules:**

- Reuses `StatCardGrid` from `components/workspace/StatCardGrid.tsx`.
- Do not add a separate card layout for the documents library summary.

---

### DocumentsTabs

**Path:** `components/documents/DocumentsTabs.tsx`

**Purpose:**

Filter tabs for the Documents Library: All Documents, Needs Review, Suggestions Ready, Ready to Export, and Archived. Shows count badges on each tab.

**Used on:**

- `/documents`

**Core classes:**

```txt
className="flex items-end gap-1 overflow-x-auto border-b border-border-light"
className="flex shrink-0 items-center gap-1.5 border-b-2 px-3 pb-2.5 pt-1.5 text-sm font-medium transition"
active: "border-accent text-accent"
inactive: "border-transparent text-text-secondary hover:border-border hover:text-text-primary"
```

**Rules:**

- Active tab uses `border-accent text-accent`.
- Count badges use `bg-accent-light text-accent` (active) or `bg-surface-tertiary text-text-muted` (inactive).

---

### DocumentsToolbar

**Path:** `components/documents/DocumentsToolbar.tsx`

**Purpose:**

Search, filter, and sort toolbar for the Documents Library. Includes debounced search input, status/type/fidelity/sort selects, and a clear-filters button.

**Used on:**

- `/documents`

**Core classes:**

```txt
className="flex flex-wrap items-center gap-2"
Search input: h-9 w-full rounded-md border border-border bg-surface
Select: h-9 appearance-none rounded-md border border-border bg-surface
```

**Rules:**

- Search debounces URL updates by 400ms.
- Search input derives its visible value from the current URL value plus local draft state; do not add a synchronous prop-to-state effect.
- Fidelity filter is hidden below `xl` to reduce toolbar crowding.
- Clear filters button appears only when active non-default filters are present.

---

### DocumentsTable

**Path:** `components/documents/DocumentsTable.tsx`

**Purpose:**

Documents library table with desktop table layout and mobile card list. Includes skeleton loading rows, a full empty state (no documents), and a filtered empty state (no results for current filters). Uses `DocumentStatusBadge`, `FidelityBadge`, and `DocumentActionsMenu` per row.

**Used on:**

- `/documents`

**Core classes:**

```txt
Desktop table: min-w-full table-fixed, th: text-[11px] font-semibold uppercase tracking-normal text-text-muted
Row hover: hover:bg-surface-secondary
Mobile card: rounded-xl border border-border bg-surface p-4 shadow-card-soft
```

**Variants:**

- Desktop/tablet table with 8 columns.
- Mobile card list.
- Skeleton rows during loading.
- Full empty state with Upload Document and Paste Text action links.
- Filtered empty state with clear-filters button.

**Rules:**

- Always shows `DocumentStatusBadge` and `FidelityBadge`.
- Open button links to `/documents/[id]`, hidden for archived documents.
- Empty state occupies the table area without collapsing the outer card.
- Create Blank is not exposed in table empty states for the current MVP.

---

### DocumentActionsMenu

**Path:** `components/documents/DocumentActionsMenu.tsx`

**Purpose:**

Three-dot row actions dropdown for each document in the library table. Shows smart contextual actions based on document status and suggestions count. Triggers rename, archive, and delete dialogs via callbacks.

**Used on:**

- `/documents` (via `DocumentsTable`)

**Core classes:**

```txt
className="relative"
Menu: absolute right-0 top-full z-40 mt-1.5 min-w-[180px] rounded-xl border border-border bg-surface py-1 shadow-popover
Review Suggestions: text-ai-dark hover:bg-ai-muted (shown when pending suggestions exist)
Delete: text-error-foreground hover:bg-error-muted
```

**Variants:**

- Suggestions-ready state: Review Suggestions appears first in ai-tinted style.
- Archived state: Restore replaces Archive; Rename is hidden.
- Ready state: Export action is available.
- Failed state: Retry Processing appears.

**Rules:**

- Closes on Escape or outside click.
- Never triggers destructive actions directly; always delegates to confirmation dialogs.

---

### DocumentsPagination

**Path:** `components/documents/DocumentsPagination.tsx`

**Purpose:**

Pagination controls for the Documents Library table. Shows result range, total count, previous/next buttons, and page number buttons with ellipsis for large page counts.

**Used on:**

- `/documents`

**Core classes:**

```txt
className="flex flex-col items-center justify-between gap-3 sm:flex-row"
Active page: bg-accent text-accent-foreground
Inactive page: border border-border bg-surface text-text-secondary hover:bg-surface-secondary
```

**Rules:**

- Hidden when total is 0 or only 1 page.
- Previous disabled on page 1; Next disabled on last page.
- Ellipsis (…) shown for page ranges beyond 7 pages.

---

### RenameDocumentDialog

**Path:** `components/documents/RenameDocumentDialog.tsx`

**Purpose:**

Modal dialog for renaming a document. Validates using `documentTitleSchema` before calling `PATCH /api/documents/[id]/rename`.

**Used on:**

- `/documents` (via `DocumentsLibraryWorkspace`)

**Core classes:**

```txt
className="fixed inset-0 z-50 flex items-center justify-center p-4"
Panel: max-w-md rounded-2xl border border-border bg-surface p-6 shadow-popover
```

**Rules:**

- Pre-fills input with current title and selects all text on open.
- Uses a keyed inner dialog component to reset state when opening for a different document/title instead of syncing state in an effect.
- Calls `onSuccess()` + `onClose()` after successful rename.

---

### ArchiveDocumentDialog

**Path:** `components/documents/ArchiveDocumentDialog.tsx`

**Purpose:**

Confirmation dialog for archiving or restoring a document. Calls `PATCH /api/documents/[id]/archive` with `{ action: "archive" | "restore" }`.

**Used on:**

- `/documents` (via `DocumentsLibraryWorkspace`)

**Core classes:**

```txt
className="fixed inset-0 z-50 flex items-center justify-center p-4"
Panel: max-w-md rounded-2xl border border-border bg-surface p-6 shadow-popover
```

**Rules:**

- Uses `action` prop to determine whether to archive or restore.
- Shows appropriate icon and copy for each action.

---

### DeleteDocumentDialog

**Path:** `components/documents/DeleteDocumentDialog.tsx`

**Purpose:**

Confirmation dialog for permanently deleting a document. Calls `DELETE /api/documents/[id]`. Warns that versions, suggestions, and exports are also removed.

**Used on:**

- `/documents` (via `DocumentsLibraryWorkspace`)

**Core classes:**

```txt
className="fixed inset-0 z-50 flex items-center justify-center p-4"
Panel: max-w-md rounded-2xl border border-border bg-surface p-6 shadow-popover
Delete button: bg-error-muted text-error-foreground hover:bg-error-light
```

**Rules:**

- Always requires explicit confirmation click — no auto-delete.
- Uses `bg-error-muted` button styling to communicate destructive intent without a full red button.
