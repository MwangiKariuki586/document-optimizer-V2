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

- Redirects successful sign-in/sign-up to `/dashboard`.
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
```

**Variants:**

- Clerk enabled - shows Clerk `UserButton` for signed-in users and Log in for signed-out users.
- Clerk missing - shows a fallback account avatar.

**Rules:**

- Keep navigation visually consistent with `PublicNavbar`.
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

## Upload Components

_Empty._

---

## Editor Components

_Empty._

---

## AI Components

_Empty._

---

## Suggestion Components

_Empty._

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
