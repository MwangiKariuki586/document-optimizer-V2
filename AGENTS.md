# AGENTS.md

## Application Building Context

Read the following files in order before implementing, refactoring, or making any architectural decision:

1. `context/project-overview.md` — product definition, target user, pages, user flows, scope, and success criteria

2. `context/architecture.md` — system stack, folder structure, system boundaries, data flow, schema, storage, auth, and invariants

3. `context/build-plan.md` — implementation phases, feature order, UI-first delivery flow, and verification checkpoints

4. `context/code-standards.md` — implementation rules, TypeScript conventions, routing patterns, service-layer rules, and project constraints

5. `context/library-docs.md` — project-specific usage patterns for Clerk, Supabase, AI providers, TipTap, Zod, Sonner, CometSpinner, shadcn/ui, and testing tools

6. `context/ui-tokens.md` — design tokens, colors, typography, spacing, radius, shadows, component values, and Tailwind v4 token rules

7. `context/ui-rules.md` — concise UI implementation rules, layout patterns, component behavior, responsive rules, feedback rules, and visual constraints

8. `context/ui-registry.md` — living component registry. Check before creating new components and update after building or changing reusable UI

9. `context/progress-tracker.md` — current phase, completed work, pending work, blockers, decisions, notes, and next actions

---

## Required Workflow

Before starting any implementation task:

1. Read `context/progress-tracker.md`
2. Identify the current phase and next feature
3. Read the relevant context files for that feature
4. Confirm the work is within scope
5. Build the visible UI first using mock data where applicable
6. Verify the UI before wiring backend logic
7. Add functionality step by step
8. Update `context/progress-tracker.md` after meaningful progress
9. Update `context/ui-registry.md` after creating or modifying reusable UI components

---

## Context Update Rule

Update `context/progress-tracker.md` after each meaningful implementation change.

If implementation changes architecture, scope, standards, UI rules, tokens, library usage, or component patterns, update the relevant context file before continuing.

Examples:

```txt
Architecture change        → update context/architecture.md
Build order change         → update context/build-plan.md
Coding rule change         → update context/code-standards.md
Library pattern change     → update context/library-docs.md
Token/design change        → update context/ui-tokens.md
UI behavior change         → update context/ui-rules.md
Component pattern change   → update context/ui-registry.md
Progress/change completed  → update context/progress-tracker.md
```

---

## Delivery Rules

- Build one feature at a time
- Follow the build plan order unless explicitly instructed otherwise
- Do not skip visual UI verification
- Do not create invisible backend-only phases unless required by the next visible user flow
- Keep route handlers thin
- Keep business logic in `lib/`
- Keep components focused on UI
- Never trust client-provided `user_id`
- Never expose private files publicly
- Never let AI output overwrite documents automatically
- Always preserve version safety before destructive document changes
- Always use project UI tokens and rules
- Always update the tracker when work is completed

---
