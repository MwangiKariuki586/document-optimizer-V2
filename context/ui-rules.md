# UI Rules

Concise rules for building the Document Optimizer V2 UI. Design mockups and UI tokens are the source of truth for visual decisions. These rules cover the most important patterns and constraints to keep the interface consistent without over-specifying every detail.

---

## Font

Always import Inter via `next/font/google` in the root layout.

```typescript
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});
```

In `@theme` in `globals.css`, declare `--font-sans` so it references the loaded font first: `--font-sans: var(--font-inter), "Inter", sans-serif;`. Do not point `next/font`'s `variable` directly at `--font-sans` — `@theme` also emits a `:root` value for `--font-sans`, and that literal `"Inter"` name (which the browser never loaded under that name) can win the cascade, silently falling back to the system sans.

Apply the font variable class to the `<html>` tag in the root layout.

Never use system fonts as the primary font.

---

## Layout

- Page max-width: 1200px, centered
- Main content area padding:
  - Desktop: 32px
  - Tablet: 24px
  - Mobile: 16px

- Gap between page sections: 24px to 32px
- Public navbar height: 72px
- Authenticated app navigation uses a collapsed-by-default sidebar based on the editor workspace rail pattern
- Use full-width soft page backgrounds with centered content containers
- Keep layouts spacious, calm, and document-focused
- Dashboard cards must not grow indefinitely based on user activity. Use fixed heights, minimum heights, capped visible rows, internal scrolling, or "View all" links to preserve grid consistency.

---

## Navigation

Public navbar items:

```txt
Features    How It Works    Resources    Log in    Get Started
```

Authenticated workspace sidebar navigation:

```txt
Dashboard    Documents    New Document    Account
```

Rules:

- Public navigation and authenticated app navigation must use the same token system and product mark
- Active item uses `text-accent`
- Inactive items use `text-text-secondary`
- Authenticated sidebar is collapsed by default and expands on demand
- Document routes may add contextual sidebar links for Editor, Versions, and Export
- `/documents` is the Documents Library and is a primary nav item
- Do not reintroduce a top authenticated navbar

---

## Cards

Every major content section should live in a card.

Standard card:

```txt
background: bg-surface
border: border border-border
border-radius: rounded-2xl
padding: p-6
box-shadow: var(--shadow-card-soft)
```

Rules:

- Cards should remain white or near-white
- Do not use strong colored card backgrounds
- Use color through badges, icons, status chips, progress states, and small accents
- Keep card hierarchy simple
- Do not stack too many nested cards inside each other

---

## Typography Hierarchy

Use a clear hierarchy throughout the app.

### Page Title

```txt
font-size: 40px desktop
font-size: 32px tablet
font-size: 28px mobile
font-weight: 700
color: text-text-primary
line-height: tight
```

Authenticated pages must use `components/layout/PageHeader.tsx` for the primary page title and actions, except full document editor and AI result preview workspaces.

### Section Heading

```txt
font-size: 24px
font-weight: 700
color: text-text-primary
line-height: 32px
```

### Card Heading

```txt
font-size: 18px
font-weight: 600
color: text-text-primary
line-height: 28px
```

### Body Text

```txt
font-size: 16px
font-weight: 400
color: text-text-secondary
line-height: 26px
```

### Small Body Text

```txt
font-size: 14px
font-weight: 400
color: text-text-secondary
line-height: 22px
```

### Muted Text

```txt
font-size: 12px
font-weight: 400
color: text-text-muted
line-height: 16px
```

### Stat Numbers

```txt
font-size: 30px
font-weight: 700
color: text-text-primary
line-height: 38px
```

---

## Buttons

### Primary Button

```txt
background: bg-accent
color: text-accent-foreground
hover: bg-accent-dark
border-radius: rounded-md
padding: px-4 py-2
font-size: text-sm
font-weight: font-medium
```

### Large CTA Button

```txt
background: bg-accent
color: text-accent-foreground
hover: bg-accent-dark
border-radius: rounded-full
padding: px-5 py-3
font-size: text-sm
font-weight: font-semibold
```

### Secondary Button

```txt
background: bg-surface
border: border border-border
color: text-text-primary
hover: bg-surface-secondary
border-radius: rounded-md
padding: px-4 py-2
font-size: text-sm
font-weight: font-medium
```

### Ghost Button

```txt
background: transparent
color: text-text-secondary
hover: bg-surface-secondary
border-radius: rounded-md
padding: px-3 py-2
font-size: text-sm
font-weight: font-medium
```

Rules:

- Async buttons should use `LoadingButton`
- Small loading states should use CometSpinner
- Disable async buttons while processing
- Do not create custom one-off button styles unless required by a documented component

---

## Form Inputs

Standard input:

```txt
background: bg-surface
border: border border-border
border-radius: rounded-md
padding: px-3 py-2
font-size: text-sm
color: text-text-primary
placeholder: text-text-soft
focus: ring-2 ring-accent border-accent
```

Textarea:

```txt
background: bg-surface
border: border border-border
border-radius: rounded-lg
padding: p-4
font-size: text-sm
color: text-text-primary
placeholder: text-text-soft
focus: ring-2 ring-accent border-accent
min-height: 140px
```

Rules:

- Every form field must have a visible label
- Required fields should be clearly indicated
- Validation errors should appear close to the field
- Do not rely on toast-only validation feedback

---

## Badges

All badges use pill shape unless specifically documented otherwise.

```txt
border-radius: rounded-full
padding: px-2 py-0.5
font-size: text-xs
font-weight: font-medium
```

Badge types:

- Document status badge
- Document fidelity badge
- AI action badge
- Suggestion type badge
- Export format badge
- Usage badge

Rules:

- Status badges must use the mappings in `ui-tokens.md`
- Fidelity badges must use the fidelity mappings in `ui-tokens.md`
- Do not invent random badge colors

---

## Document Fidelity Indicators

Every document workspace view should show fidelity status when relevant.

Supported statuses:

```txt
Structure Preserved
Original Preserved
Limited Formatting
Plain Text Only
Formatting Review Needed
```

Rules:

- Show fidelity status on document cards where useful
- Show fidelity status in the editor header
- Show warnings when formatting may be limited
- Never imply pixel-perfect PDF editing unless explicitly supported
- Always communicate that the original uploaded file is preserved when available

---

## Editor Workspace

The editor is the core product experience.

Rules:

- Editor canvas should be visually central
- AI tools should support the editor, not overpower it
- Document title, save status, and fidelity status should be visible
- Keep the editor clean and focused
- Avoid dashboard-like clutter inside the editor
- On smaller screens, secondary panels should collapse below, into drawers, or into tabs
- AI output must appear as preview or suggestions before applying
- AI suggestions should visually connect to document text where practical
- Suggestion cards and highlighted document text should focus each other
- The editor may apply one concrete suggestion or all pending suggestions after
  an explicit Apply click, server ownership checks, safe replacement validation,
  and a preserved rollback point. Do not show suggestion checkboxes or manual selection
  mode. Review Applied Suggestions routes to the preview workspace.

Editor canvas:

```txt
background: bg-surface
border: border border-border
border-radius: rounded-2xl
padding: p-8
min-height: 720px
box-shadow: var(--shadow-card-soft)
```

---

## AI UI

AI should feel like a controlled document assistant, not a chatbot-first experience.

Rules:

- AI actions should be clear buttons or cards
- AI actions should explain what they do
- Full AI results should be preview-first
- AI Result Preview is the only page where full AI output and batch suggestion reviews can be finally applied
- AI Result Preview should compare current document content with the proposed result
- The proposed result should be editable before applying
- Synchronous scrolling should be available in side-by-side comparison view
- Apply to Document must use the edited proposed result
- Suggestions should be individually applyable/ignorable, with a direct
  version-safe Apply All action
- Apply All is scoped to the selected AI action. After it succeeds, the same
  footer position becomes Review Applied Suggestions; only Review navigates to
  the preview workspace.
- Applying AI output must feel intentional
- Use AI tokens for AI-specific elements
- Do not hide structure preservation settings when relevant
- Do not auto-apply AI output

AI suggestion cards:

```txt
background: bg-ai-muted
border: border border-ai-light
border-radius: rounded-xl
padding: p-4
title: text-ai-dark font-semibold
body: text-text-secondary
```

---

## Tables and Lists

Use tables only where comparison or scanning benefits the user.

For document lists:

- White rows only
- Row border: `border-border`
- Header text: uppercase, 12px, font-weight 500, `text-text-muted`
- Row text: 14px, `text-text-primary`
- Hover state: `bg-surface-secondary`

Large document lists must use pagination. Do not render all documents at once in the Documents Library. Default page size is 10. Preserve active filters, search, sort, and tab when changing pages. Reset to page 1 when filters or search change. Use skeleton rows during loading. Use the empty state inside the table area when no results exist — do not collapse the page layout.

For recent activity:

- Use simple list items
- Use small status dots or icons
- Keep activity text short and human readable

---

## Empty States

Every section that can be empty must have an empty state.

Empty states should include:

- Optional icon
- Short title
- Short descriptive text
- CTA button if there is a logical next action

Examples:

```txt
No documents yet.
Upload a file or paste text to begin.
```

```txt
No suggestions yet.
Run an AI action to generate document improvement suggestions.
```

Rules:

- Empty states should be calm, not alarming
- Avoid long explanations
- Always provide a next action where possible

---

## Loading States

Upload processing is durable and must expose its actual stage. Show checksum
preparation, transfer percentage with pause/resume, queued/parsing status, and
terminal failure separately. A detected duplicate must interrupt processing
with explicit Open Existing and Continue as New actions; never silently discard
or auto-copy the file.

Use the correct loading pattern for the size of the action.

### Page or Section Loading

Use skeletons.

Examples:

- dashboard loading
- document list loading
- editor loading
- account usage loading

### Button or Inline Loading

Use CometSpinner through `LoadingButton`.

Examples:

- upload processing button
- save button
- apply suggestion button
- run AI action button
- generate export button

Rules:

- Do not use CometSpinner for full-page loading
- Do not create random spinner components
- Disable duplicate actions while loading

---

## Error States

Use human-readable error messages.

Rules:

- Never show raw errors to users
- Critical errors must appear inline
- Toasts can support errors but should not replace inline page errors
- Every failed async action should have recovery guidance where possible
- Use retry buttons where logical

Example:

```txt
We could not process this document. Try uploading a different file or use Paste Text instead.
```

---

## Toasts

Use Sonner for global notifications.

Use toast types consistently:

```txt
success
error
warning
info
```

Examples:

```txt
Document uploaded successfully.
AI result is ready for review.
Suggestion applied. Your rollback point is preserved.
Formatting may be limited for this PDF. Your original file is preserved.
Export generated successfully.
```

Rules:

- Use centralized toast helpers
- Do not call Sonner directly across random components
- Critical warnings should also be visible inline
- Avoid noisy toast spam

---

## Responsive Rules

### Desktop

- Dashboard uses grid layout
- Upload flow can show three option cards side by side
- Editor can use canvas plus supporting side panels
- Export flow can use main panel plus summary panel

### Tablet

- Reduce page padding
- Keep two-column layouts only where readable
- Collapse secondary panels where necessary

### Mobile

- Use single-column layouts
- Keep primary action visible
- Collapse nav into a clean menu
- Editor canvas comes before AI/supporting panels
- Avoid tiny sidebars or cramped panels
- Below `md`, replace the authenticated sidebar with the safe-area-aware bottom navigation; do not reserve desktop rail width.
- Below `xl`, document workspaces use normal page scrolling. Scope hidden outer overflow and internal pane scrolling to the desktop single-viewport layout.
- Do not hide functional filters on narrow screens; reflow them into a compact grid instead.
- Avoid nested scrolling for dashboard cards on phones; use natural-height panels and enable internal card scrolling from `sm` where needed.

---

## Tailwind v4 Note

This project uses Tailwind v4.

Tokens are defined with `@theme` in `globals.css`.

Rules:

- No `tailwind.config.ts` for colors or design tokens
- Do not define colors in config files
- Use token-generated utility classes
- Add new tokens only when they are reused and approved

---

## Do Nots

- Never use Tailwind built-in color classes like `bg-purple-500`, `text-gray-600`, or `border-slate-200`
- Never hardcode hex values in components
- Never define colors in `tailwind.config.ts`
- Never add gradients to normal card backgrounds
- Never use more than one font family
- Never show raw error messages to users
- Never apply full AI action output or batch suggestion review output without preview
- Never hide document fidelity warnings
- Never imply formatting is preserved when it is not
- Never reintroduce a top authenticated navbar unless the app shell direction changes
- Never add a second persistent navigation rail inside authenticated pages
- Never stack more than two nested rounded card containers
- Never use fixed positioning unless required for a modal, toast, or controlled overlay
- Progressive onboarding may use fixed positioning only for its welcome modal, compact checklist, contextual tip, and replay control.
- Show only one proactive onboarding surface at a time; all guidance must be dismissible and keyboard accessible.
- Contextual onboarding guidance uses the global informational toast UI, remains until explicit dismissal, and must not create a second custom-positioned overlay.
