# UI Tokens

Design tokens for Document Optimizer V2. All colors, typography, spacing, radius, shadows, and component values should come from this file.

Use these tokens throughout the codebase. Do not hardcode colors or use random Tailwind color classes inside components.

---

## How to Use

This project uses **Tailwind CSS v4**.

All design tokens should be defined using the `@theme` directive in `app/globals.css`.

Tailwind v4 automatically generates utility classes from `@theme` variables:

```txt
--color-accent          → bg-accent, text-accent, border-accent
--color-surface         → bg-surface, text-surface, border-surface
--color-text-primary    → text-text-primary
```

Correct:

```tsx
className = "bg-surface text-text-primary border-border";
```

Also acceptable when needed:

```tsx
style={{ color: "var(--color-text-primary)" }}
```

Never:

```tsx
className = "bg-[#F6F7FB] text-[#101828]";
```

Never:

```tsx
className = "bg-purple-500 text-gray-600";
```

---

## globals.css — Complete Token Definition

```css
@import "tailwindcss";

@theme {
  /* Font */
  --font-sans: "Inter", sans-serif;

  /* Page and surface backgrounds */
  --color-background: #f8f7ff;
  --color-background-soft: #fbfaff;
  --color-surface: #ffffff;
  --color-surface-secondary: #faf9ff;
  --color-surface-tertiary: #f3f1ff;
  --color-surface-muted: #f6f4ff;

  /* Borders */
  --color-border: #e8e3f7;
  --color-border-light: #f0ecfb;
  --color-border-muted: #ddd6f0;
  --color-border-strong: #c9bff0;

  /* Text */
  --color-text-primary: #171321;
  --color-text-secondary: #625b71;
  --color-text-muted: #9189a3;
  --color-text-soft: #a9a1b8;
  --color-text-inverse: #ffffff;

  /* Primary accent — document purple */
  --color-accent: #7c5cfc;
  --color-accent-dark: #5e4cff;
  --color-accent-darker: #4936c9;
  --color-accent-light: #eee9ff;
  --color-accent-lighter: #f6f2ff;
  --color-accent-muted: #faf7ff;
  --color-accent-foreground: #ffffff;

  /* AI accent — violet */
  --color-ai: #8b5cf6;
  --color-ai-dark: #6d28d9;
  --color-ai-light: #f3e8ff;
  --color-ai-muted: #faf5ff;
  --color-ai-foreground: #ffffff;

  /* Success — green */
  --color-success: #10b981;
  --color-success-dark: #047857;
  --color-success-light: #d1fae5;
  --color-success-muted: #ecfdf5;
  --color-success-foreground: #065f46;

  /* Info — blue */
  --color-info: #3b82f6;
  --color-info-dark: #1d4ed8;
  --color-info-light: #dbeafe;
  --color-info-muted: #eff6ff;
  --color-info-foreground: #1e40af;

  /* Warning — amber */
  --color-warning: #f59e0b;
  --color-warning-dark: #b45309;
  --color-warning-light: #fef3c7;
  --color-warning-muted: #fffbeb;
  --color-warning-foreground: #92400e;

  /* Error — red */
  --color-error: #ef4444;
  --color-error-dark: #b91c1c;
  --color-error-light: #fee2e2;
  --color-error-muted: #fef2f2;
  --color-error-foreground: #991b1b;

  /* Document fidelity states */
  --color-fidelity-structure: #10b981;
  --color-fidelity-original: #3b82f6;
  --color-fidelity-limited: #f59e0b;
  --color-fidelity-plain: #9189a3;
  --color-fidelity-review: #8b5cf6;

  /* Overlays */
  --color-overlay: #171321;
  --color-overlay-muted: rgba(23, 19, 33, 0.6);

  /* Border radius */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 18px;
  --radius-2xl: 24px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-card: 0px 10px 30px rgba(23, 19, 33, 0.06);
  --shadow-card-soft: 0px 6px 18px rgba(23, 19, 33, 0.05);
  --shadow-popover: 0px 18px 40px rgba(23, 19, 33, 0.12);
  --shadow-focus: 0px 0px 0px 4px rgba(124, 92, 252, 0.14);
}
```

---

## Color Usage Guide

### Page Layout

| Element               | Token                  |
| --------------------- | ---------------------- |
| Page background       | `bg-background`        |
| Soft page background  | `bg-background-soft`   |
| Card / main surface   | `bg-surface`           |
| Secondary surface     | `bg-surface-secondary` |
| Muted section surface | `bg-surface-muted`     |
| Default border        | `border-border`        |
| Light border          | `border-border-light`  |
| Strong border         | `border-border-strong` |

### Typography

| Element                         | Token                 |
| ------------------------------- | --------------------- |
| Page titles and headings        | `text-text-primary`   |
| Body text                       | `text-text-secondary` |
| Supporting labels               | `text-text-muted`     |
| Placeholder text                | `text-text-soft`      |
| Text on dark/accent backgrounds | `text-text-inverse`   |

### Accent

Used for primary actions, active nav items, focus rings, selected states, and key highlights.

| Element                   | Token                         |
| ------------------------- | ----------------------------- |
| Primary button background | `bg-accent`                   |
| Primary button text       | `text-accent-foreground`      |
| Active nav text           | `text-accent`                 |
| Light accent badge        | `bg-accent-light text-accent` |
| Subtle accent surface     | `bg-accent-muted`             |
| Focus ring                | `ring-accent`                 |

### AI

Used for AI-specific actions, previews, suggestion cards, and AI result states.

| Element               | Token                      |
| --------------------- | -------------------------- |
| AI action button/icon | `text-ai`                  |
| AI card accent        | `border-ai`                |
| AI badge              | `bg-ai-light text-ai-dark` |
| AI muted surface      | `bg-ai-muted`              |

### Status Colors

| Status  | Background         | Text                      |
| ------- | ------------------ | ------------------------- |
| Success | `bg-success-muted` | `text-success-foreground` |
| Info    | `bg-info-muted`    | `text-info-foreground`    |
| Warning | `bg-warning-muted` | `text-warning-foreground` |
| Error   | `bg-error-muted`   | `text-error-foreground`   |

### Document Fidelity Colors

| Fidelity Status          | Background            | Text                      |
| ------------------------ | --------------------- | ------------------------- |
| Structure Preserved      | `bg-success-muted`    | `text-success-foreground` |
| Original Preserved       | `bg-info-muted`       | `text-info-foreground`    |
| Limited Formatting       | `bg-warning-muted`    | `text-warning-foreground` |
| Plain Text Only          | `bg-surface-tertiary` | `text-text-muted`         |
| Formatting Review Needed | `bg-ai-muted`         | `text-ai-dark`            |

### Document Status Colors

| Document Status | Background             | Text                      |
| --------------- | ---------------------- | ------------------------- |
| Ready           | `bg-success-muted`     | `text-success-foreground` |
| Draft           | `bg-surface-tertiary`  | `text-text-secondary`     |
| Processing      | `bg-ai-muted`          | `text-ai-dark`            |
| Failed          | `bg-error-muted`       | `text-error-foreground`   |
| Archived        | `bg-surface-secondary` | `text-text-muted`         |

---

## Typography

Font family: **Inter**.

Use `next/font/google` to load Inter.

| Element           | Size | Weight | Line height | Token                 |
| ----------------- | ---- | ------ | ----------- | --------------------- |
| Logo text         | 19px | 700    | 28px        | `text-text-primary`   |
| Hero heading      | 64px | 700    | 72px        | `text-text-primary`   |
| Page title        | 40px | 700    | 48px        | `text-text-primary`   |
| Section heading   | 24px | 700    | 32px        | `text-text-primary`   |
| Card heading      | 18px | 600    | 28px        | `text-text-primary`   |
| Body text         | 16px | 400    | 26px        | `text-text-secondary` |
| Small body text   | 14px | 400    | 22px        | `text-text-secondary` |
| Label text        | 13px | 500    | 18px        | `text-text-muted`     |
| Badge text        | 12px | 500    | 16px        | Context token         |
| Muted helper text | 12px | 400    | 16px        | `text-text-muted`     |
| Stat number       | 30px | 700    | 38px        | `text-text-primary`   |

Responsive rule:

```txt
Hero heading should reduce from 64px desktop to 42px tablet and 34px mobile.
Page title should reduce from 40px desktop to 32px tablet and 28px mobile.
```

---

## Spacing

| Token       | Value       | Usage                   |
| ----------- | ----------- | ----------------------- |
| `gap-1`     | 4px         | Tight inline gaps       |
| `gap-2`     | 8px         | Badge and icon gaps     |
| `gap-3`     | 12px        | Form field gaps         |
| `gap-4`     | 16px        | Card internal gaps      |
| `gap-5`     | 20px        | Compact section gaps    |
| `gap-6`     | 24px        | Standard section gaps   |
| `gap-8`     | 32px        | Large section gaps      |
| `gap-10`    | 40px        | Page block gaps         |
| `p-4`       | 16px        | Compact card padding    |
| `p-5`       | 20px        | Medium card padding     |
| `p-6`       | 24px        | Standard card padding   |
| `p-8`       | 32px        | Large card padding      |
| `px-4 py-2` | 16px / 8px  | Standard button padding |
| `px-5 py-3` | 20px / 12px | Large CTA padding       |
| `px-3 py-1` | 12px / 4px  | Badge padding           |

Page container:

```txt
max-width: 1200px
desktop padding: 32px
tablet padding: 24px
mobile padding: 16px
```

---

## Component Tokens

### Cards

```txt
background: bg-surface
border: border border-border
border-radius: rounded-2xl
padding: p-6
box-shadow: var(--shadow-card-soft)
```

Large feature cards:

```txt
background: bg-surface
border: border border-border-light
border-radius: rounded-2xl
padding: p-8
box-shadow: var(--shadow-card)
```

### Buttons

Primary:

```txt
background: bg-accent
text: text-accent-foreground
hover: bg-accent-dark
border-radius: rounded-md
padding: px-4 py-2
font-weight: font-medium
```

Large CTA:

```txt
background: bg-accent
text: text-accent-foreground
hover: bg-accent-dark
border-radius: rounded-full
padding: px-5 py-3
font-weight: font-semibold
```

Secondary:

```txt
background: bg-surface
border: border border-border
text: text-text-primary
hover: bg-surface-secondary
border-radius: rounded-md
padding: px-4 py-2
font-weight: font-medium
```

Ghost:

```txt
background: transparent
text: text-text-secondary
hover: bg-surface-secondary
border-radius: rounded-md
padding: px-3 py-2
font-weight: font-medium
```

Destructive:

```txt
background: bg-error
text: text-error-foreground
hover: bg-error-dark
border-radius: rounded-md
padding: px-4 py-2
font-weight: font-medium
```

### Input Fields

```txt
background: bg-surface
border: border border-border
border-radius: rounded-md
padding: px-3 py-2
text: text-text-primary
placeholder: text-text-soft
focus: ring-2 ring-accent border-accent
```

### Textarea

```txt
background: bg-surface
border: border border-border
border-radius: rounded-lg
padding: p-4
text: text-text-primary
placeholder: text-text-soft
focus: ring-2 ring-accent border-accent
min-height: 140px
```

### Badges

```txt
border-radius: rounded-full
padding: px-2 py-0.5
font-size: text-xs
font-weight: font-medium
```

### Navbar

```txt
height: 72px
background: bg-background-soft / subtle transparency where appropriate
border-bottom: border-border-light
logo text: text-text-primary
inactive nav: text-text-secondary
active nav: text-accent
nav item size: text-sm font-medium
```

### Dashboard Stat Cards

```txt
background: bg-surface
border: border border-border
border-radius: rounded-2xl
padding: p-6
number: text-3xl font-bold text-text-primary
label: text-sm text-text-muted
```

### Document Cards

```txt
background: bg-surface
border: border border-border
border-radius: rounded-2xl
padding: p-5
hover: shadow-card
title: text-text-primary font-semibold
meta: text-text-muted text-sm
```

### Editor Canvas

```txt
background: bg-surface
border: border border-border
border-radius: rounded-2xl
padding: p-8
min-height: 720px
box-shadow: var(--shadow-card-soft)
```

Editor document content:

```txt
max-width: 760px
margin: auto
body text: text-text-primary
line-height: relaxed
```

### AI Suggestion Card

```txt
background: bg-ai-muted
border: border border-ai-light
border-radius: rounded-xl
padding: p-4
title: text-ai-dark font-semibold
body: text-text-secondary
```

### Version Timeline Item

```txt
marker: bg-accent
line: bg-border
title: text-text-primary font-medium
timestamp: text-text-muted text-xs
```

### Export Format Card

```txt
background: bg-surface
border: border border-border
selected border: border-accent
selected background: bg-accent-muted
border-radius: rounded-xl
padding: p-5
```

---

## Shadows

Use named shadow variables where possible.

| Purpose               | Token                     |
| --------------------- | ------------------------- |
| Soft card shadow      | `var(--shadow-card-soft)` |
| Strong card shadow    | `var(--shadow-card)`      |
| Popover/dialog shadow | `var(--shadow-popover)`   |
| Focus shadow          | `var(--shadow-focus)`     |

Avoid random shadow values in components.

---

## Icons

Use `lucide-react`.

| Usage            | Size                         |
| ---------------- | ---------------------------- |
| Inline icon      | `size-4`                     |
| Button icon      | `size-4`                     |
| Card icon        | `size-5`                     |
| Empty state icon | `size-8` or `size-10`        |
| Hero visual icon | `size-6` or larger if needed |

Icons should use `currentColor`.

---

## Layout Breakpoints

Use Tailwind defaults unless a specific layout requires otherwise.

| Breakpoint    | Usage                          |
| ------------- | ------------------------------ |
| Mobile        | Single column layouts          |
| Tablet        | Two-column where practical     |
| Desktop       | Full workspace layouts         |
| Large desktop | Wider editor/dashboard spacing |

Workspace guidance:

```txt
Dashboard: grid layout on desktop, stacked on mobile.
Editor: document canvas first, panels collapse into drawer or stacked sections on smaller screens.
Upload flow: three cards on desktop, stacked cards on mobile.
```

---

## Invariants

- Never use hex values directly in components
- Never use raw Tailwind color classes like `bg-purple-500`, `text-gray-600`, or `border-slate-200`
- Use project tokens from this file
- Font is Inter
- Primary accent is `--color-accent`
- AI-specific elements use AI tokens, not random purple variants
- Status badges must use status token mappings
- Fidelity badges must use fidelity token mappings
- All cards use the standard card radius, border, and shadow pattern
- All inputs use the standard input pattern
- All small loading buttons should use CometSpinner through `LoadingButton`
- Public and authenticated navigation must feel visually consistent
- UI should remain clean, spacious, document-focused, and professional
