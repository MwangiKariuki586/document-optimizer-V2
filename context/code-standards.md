# Code Standards

Implementation rules and conventions for the entire project. The AI agent must follow these in every session without exception. These rules prevent pattern drift across sessions.

---

## Engineering Mindset

The AI agent on this project operates as a senior engineer. This means:

- **Read context files first** — always check `project-overview.md`, `architecture.md`, and `build-plan.md` before implementing
- **Scope is sacred** — only build what the current phase requires
- **UI before logic** — full page UI must be visible and reviewable before backend functionality is wired
- **Every feature must be testable** — if it cannot be verified from the UI, it is incomplete
- **Clean over clever** — simple readable code is preferred over clever abstractions
- **One thing at a time** — complete one feature before touching the next
- **User control matters** — AI must never silently overwrite document content
- **Document safety matters** — preserve original files, structure, and version history wherever technically possible

---

## Verification Ownership

- Run code-level verification such as lint, build, typecheck, and focused tests when appropriate for the change.
- Do not perform browser-based visual or interaction testing directly unless the user explicitly asks for it in that turn.
- Browser verification is delegated to the user by default. When UI changes are made, state the exact route or flow that needs user browser review.
- If a feature cannot be confidently accepted without browser review, record that browser verification remains user-owned instead of treating the task as visually verified.

---

## TypeScript

- Strict mode enabled in `tsconfig.json`
- Never use `any`
- Use `unknown` and narrow the type when needed
- Avoid type assertions unless necessary and explain why with a short comment
- All function parameters and return values must be typed
- Use `type` for object shapes and unions
- Use `interface` only for extendable component props
- Use `const` by default
- Use `let` only when reassignment is required
- Never leave floating promises
- All async functions must handle errors properly

---

## Next.js Conventions

- Use App Router only
- No Pages Router
- Components are Server Components by default
- Only add `"use client"` when the component needs:
  - `useState`
  - `useReducer`
  - `useEffect`
  - browser APIs
  - event listeners
  - client-only libraries
  - interactive editor behavior

- Never add `"use client"` to layout files unless absolutely required
- Data fetching should happen in Server Components or route handlers
- Client Components must not directly call Supabase for sensitive writes
- Route handlers live in `app/api/`
- Route handlers must stay thin
- Business logic belongs in `lib/`
- Server-only utilities must never be imported into Client Components
- Always check current documentation before implementing framework-specific behavior

---

## File and Folder Naming

- Folders use kebab-case:
  - `document-editor`
  - `ai-actions`
  - `version-history`

- Component files use PascalCase:
  - `DocumentCard.tsx`
  - `AIActionsPanel.tsx`
  - `VersionTimeline.tsx`

- Utility files use kebab-case or clear domain naming:
  - `document.service.ts`
  - `ai-router.ts`
  - `parse-file.ts`

- API route files are always named `route.ts`
- One component per file
- Avoid barrel exports outside `components/ui/`
- Keep files small and purpose-specific

---

## Component Structure

Every component should follow this order:

```typescript
"use client"; // only if needed

// 1. External imports
import { useState } from "react";

// 2. Internal imports
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/feedback/LoadingButton";

// 3. Type definitions
type Props = {
  documentId: string;
  title: string;
};

// 4. Component
export function DocumentCard({ documentId, title }: Props) {
  // state
  // derived values
  // handlers
  // return JSX
}
```

Rules:

- Use named exports for components
- Do not use default exports for components
- Define props directly above the component unless shared elsewhere
- Do not put business logic inside components
- Do not call AI providers from components
- Do not call private database writes from components
- Styling must use project tokens and approved UI rules

---

## Styling

- Use Tailwind CSS
- Use shadcn/ui and Radix primitives where appropriate
- Do not use inline styles
- Do not hardcode random colors
- Follow `ui-tokens.md`
- Follow `ui-rules.md`
- Keep layouts clean, spacious, and document-focused
- Use consistent navbar styling across public and authenticated screens
- Use consistent badges for document status and fidelity status
- Do not create one-off UI patterns when a registered component already exists

---

## Feedback and Loading States

Use the shared feedback system consistently.

Approved feedback tools:

- Sonner for global toasts
- CometSpinner for small processing states
- Skeletons for large loading sections
- Inline alerts for persistent warnings or actionable errors
- Empty states for missing data
- Error states for failed page/section loads

Rules:

- Use `LoadingButton` for async button actions
- Use CometSpinner only for small loading states
- Use skeletons for page-level and section-level loading
- Use Sonner for success, error, warning, and info messages
- Critical errors must also appear inline, not only as toasts
- Do not create random spinner components

Toast examples:

```txt
Document uploaded successfully.
AI result is ready for review.
Suggestion applied. A version snapshot was created first.
Formatting may be limited for this PDF. Your original file is preserved.
Export generated successfully.
```

---

## API Route Handlers

Every route handler must follow this pattern:

```typescript
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // authenticate user
    // validate input
    // verify ownership
    // call service
    // return response

    return NextResponse.json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error("[api/documents]", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
```

Rules:

- Every route handler must have `try/catch`
- Every route handler must validate input before processing
- Every private route must resolve the current user from Clerk
- Every document route must verify ownership
- Do not trust `user_id` from the request body
- Always return a success wrapper
- Never return raw provider errors
- Never return stack traces
- Never expose secrets or SQL errors

Standard success response:

```typescript
{
  success: true,
  data: result;
}
```

Standard error response:

```typescript
{
  success: false,
  error: "Readable error message";
}
```

---

## Input Validation and Sanitization

All user-provided input must be validated before it reaches the service layer or the database. The server-side Zod schema is always the source of truth. Client-side checks are for fast feedback only and never replace server validation.

Rules:

- Validate every request body, query param, and form value with Zod on the server.
- Define shared field schemas in the relevant `lib/<domain>/*.validators.ts` file and reuse them on both server and client. Do not duplicate validation logic.
- User-facing free-text fields (titles, names, labels) must use a clean-character allowlist, not a denylist. Reject anything outside the allowlist.
- Trim input and enforce explicit min/max length on every text field.
- Reject control characters and unsafe symbols. Prefer Unicode-aware allowlists so legitimate international text is still accepted.
- Mirror the shared schema/pattern on the client for inline feedback (error message, `aria-invalid`, error styling, disabled submit), but always re-validate on the server.
- Never trust client validation, hidden fields, or client-provided `user_id`.

Document title standard (reuse for all document-title inputs):

```typescript
// lib/documents/document.validators.ts
export const TITLE_ALLOWED_PATTERN = /^[\p{L}\p{N} \-_.,'()&]+$/u;

export const documentTitleSchema = z
  .string({ message: "Document title is required" })
  .trim()
  .min(1, "Document title is required")
  .max(120, "Document title must be 120 characters or fewer")
  .regex(TITLE_ALLOWED_PATTERN, TITLE_ALLOWED_MESSAGE);
```

### SQL Injection

- SQL injection protection comes from the Supabase JS client, which sends values as parameters through PostgREST. Never build raw SQL by concatenating user input.
- If a raw SQL path is ever required (e.g. an RPC or migration), use parameterized queries only and get approval first.
- Input allowlists are defense-in-depth and reduce the stored-data attack surface; they are not the primary SQL-injection control.

---

## Service Layer

Business logic belongs in `lib/`.

Service files should own domain behavior:

```txt
lib/documents/document.service.ts
lib/versions/versions.service.ts
lib/parsing/parse-file.ts
lib/storage/storage.service.ts
lib/ai/ai-router.ts
lib/suggestions/suggestions.service.ts
lib/export/export.service.ts
lib/usage/usage.service.ts
```

Rules:

- Route handlers call services
- Services do the actual work
- Services must not import React components
- Services must not depend on browser APIs
- Services should return typed results
- Services should use clear, predictable function names
- Services should handle expected failures safely

---

## Clerk Auth Usage

Clerk is the source of authenticated user identity.

Rules:

- Always resolve the current user on the server for private actions
- Never accept `user_id` from the frontend
- Store Clerk user ID in user-owned records
- All private records must be scoped to the authenticated Clerk user
- Protected pages must require authentication
- Protected API routes must require authentication

User-owned records include:

```txt
profiles
documents
document_versions
ai_requests
suggestions
exports
usage_ledger
```

---

## Supabase Usage

Use Supabase for database and storage.

Rules:

- Use Supabase JS client
- Use generated Supabase TypeScript types
- Do not use an ORM during MVP unless explicitly approved
- Use Supabase MCP for schema inspection, migrations, RLS setup, and verification
- Do not apply schema or RLS changes without approval
- Keep service role key server-only
- Never expose service role key to the browser
- Database writes must be scoped to the current user
- Storage files must be private by default

---

## Supabase Client Usage

Use the server client for the current MVP. Client Components call API routes for
protected reads and mutations instead of importing Supabase directly.

```typescript
// lib/supabase/server.ts
// Server-only client.

import "server-only";
import { createClient } from "@supabase/supabase-js";

export function createSupabaseServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!,
    {
      auth: {
        persistSession: false,
      },
    },
  );
}
```

Rules:

- Add a browser client only for deliberate safe read paths
- Server client is used in route handlers and services
- Service role key must only be used on the server
- Never import server client into Client Components

---

## Document Safety Rules

The document workflow must protect user content.

Rules:

- Never overwrite document content without explicit user action
- Full-document AI output must be previewed before applying
- Full AI action results and batch suggestion reviews must only be finally applied from `/documents/[id]/preview`
- Single suggestion Apply is allowed directly from the editor after explicit user action, ownership verification, safe replacement validation, and a version snapshot
- AI Result Preview must compare current vs proposed content before full-result or batch mutation
- The proposed result must be editable before applying
- Apply must persist the edited proposed result, not necessarily the raw AI output
- Comparison view should support synchronous proportional scrolling
- Applying AI output must create a version snapshot first
- Applying a suggestion must create a version snapshot where needed
- Restoring a version must preserve the current state first
- Original uploaded files must remain privately stored
- Do not treat extracted plain text as the only source of truth
- Preserve `editor_json`, `current_markdown`, and `formatting_metadata` where possible
- If formatting is limited, clearly communicate it to the user

---

## AI Provider Rules

All AI calls must go through the AI provider abstraction.

Approved structure:

```txt
Route Handler
  ↓
AI Service
  ↓
AI Router
  ↓
Provider Implementation
  ↓
Normalized Result
```

Rules:

- DeepSeek is the default MVP AI provider.
- All AI calls must stay behind `lib/ai/ai-router.ts`.
- Route handlers must not call DeepSeek, Gemini, or OpenAI directly
- Components must not call AI providers directly
- AI providers must return normalized results
- Gemini and OpenAI are optional provider paths and must not block the default DeepSeek workflow.
- AI requests must be stored in `ai_requests`
- AI provider execution remains in the authenticated document AI request for the current MVP; do not add a separate AI worker without an explicit scope change
- Completed AI responses should return newly persisted suggestions so the editor does not issue a redundant full suggestions fetch
- Token usage and estimated cost should be recorded where available
- AI failures must be saved as safe error messages
- AI full-document results must be preview-first
- AI actions must preserve structure by default where possible

---

## Parsing Rules

Parsing logic belongs in `lib/parsing/`.

Supported MVP file types:

```txt
PDF
DOCX
Markdown
TXT
```

Rules:

- Validate file type before parsing
- Validate file size before parsing
- Store original file before extraction
- Extract text for AI processing
- Extract structure where possible
- Save formatting metadata where possible
- Set fidelity status after parsing
- Warn users when editable formatting may be limited
- Do not proxy file bytes through Next.js; use signed direct Storage uploads
- Treat browser SHA-256 as preflight only and recompute it in the worker
- Scope duplicate checksum lookups to the authenticated user
- Keep queue messages identifier-only; never include file bytes or credentials
- Make queue delivery, retries, duplicate resolution, versions, and usage writes idempotent
- Enforce file, extracted-character, editor-node, PDF-page, and DOCX expansion limits before finalization

Expected parser output:

```typescript
type ParsedDocument = {
  extractedText: string;
  editorJson: unknown | null;
  currentMarkdown: string | null;
  formattingMetadata: Record<string, unknown> | null;
  wordCount: number;
  fidelityStatus: string;
  warnings: string[];
};
```

---

## Storage Rules

Original files and exports are private.

Rules:

- Store raw files in storage, not Postgres
- Store file keys in the database
- Use signed URLs for downloads
- Keep original files preserved
- Do not expose permanent public document URLs
- Validate ownership before generating signed URLs
- Use resumable TUS uploads for original documents and show real progress
- Preserve failed originals for retry; remove abandoned incomplete uploads after 24 hours

Path pattern:

```txt
{user_id}/{document_id}/original/{filename}
{user_id}/{document_id}/exports/{filename}
```

---

## Versioning Rules

Versioning protects users from destructive edits.

Create versions for:

```txt
initial upload
pasted content
manual snapshot
AI result application
suggestion application
version restore
```

Rules:

- Versions should preserve structured content where possible
- Store `content_markdown`
- Store `editor_json`
- Store `formatting_metadata`
- Store source and notes
- Never restore a version without saving current state first

---

## Error Handling

- Never use empty catch blocks
- Always log errors with a clear context prefix
- User-facing errors must be human readable
- Do not expose raw provider errors
- Do not expose SQL errors
- Do not expose stack traces
- API errors should return a safe message
- Services should return predictable failure responses where useful

Example prefixes:

```txt
[api/documents]
[api/upload]
[documents/create]
[ai/run-action]
[export/generate]
[versions/restore]
```

---

## Environment Variables

All environment variables are defined in `.env.local` for development.

Never hardcode keys, URLs, or secrets.

| Variable                            | Used In                         |
| ----------------------------------- | ------------------------------- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk browser setup             |
| `CLERK_SECRET_KEY`                  | Clerk server auth               |
| `CLERK_WEBHOOK_SECRET`              | Clerk webhook verification      |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`     | Clerk protected-route redirects |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL`     | Clerk sign-up route             |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | Clerk sign-in fallback |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | Clerk sign-up fallback |
| `NEXT_PUBLIC_SUPABASE_URL`          | Supabase browser/server clients |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`     | Supabase browser client         |
| `SUPABASE_SERVICE_ROLE_KEY`         | Server-only Supabase access     |
| `SUPABASE_SECRET_KEY`               | Server-only Supabase fallback secret |
| `DEEPSEEK_API_KEY`                  | Required MVP DeepSeek provider  |
| `GEMINI_API_KEY`                    | Optional Gemini provider        |
| `OPENAI_API_KEY`                    | Optional/future OpenAI provider |
| `VERCEL_URL`                        | Vercel deployment URL fallback for server-side app origin detection |
| `NEXT_PUBLIC_APP_URL`               | Local/manual app URL fallback for redirects and links |

Rules:

- `NEXT_PUBLIC_` variables are exposed to the browser
- Vercel preview deployments should rely on request headers or `VERCEL_URL`, not a fixed `NEXT_PUBLIC_APP_URL`
- Never prefix secret keys with `NEXT_PUBLIC_`
- Never log environment variables
- Never commit `.env.local`

---

## Import Aliases

Always use the `@/` alias.

```typescript
// Correct
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/feedback/LoadingButton";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Avoid
import { Button } from "../../../components/ui/button";
```

Rules:

- Avoid relative imports that go up more than one level
- Prefer clear absolute imports for project files

---

## Comments

- Do not comment obvious code
- Comments should explain why, not what
- Add short comments only for non-obvious decisions
- Never leave TODO comments in committed code
- Remove commented-out code before finishing a task

---

## Dependencies

Do not install a new package without a clear reason.

Before adding a package, check:

1. Does Next.js already provide this?
2. Does shadcn/ui or Radix already provide this?
3. Can this be done with a small utility?
4. Is the package necessary for the current phase?

Approved dependencies:

- `@clerk/nextjs` — authentication
- `@supabase/supabase-js` — Supabase database and storage
- `@google/genai` — Gemini API provider
- `openai` — optional/future OpenAI API provider
- `zod` — validation
- `@tiptap/react` — editor
- `@tiptap/starter-kit` — editor toolkit
- `@tiptap/extension-highlight` — editor highlight control
- `@tiptap/extension-text-align` — editor text alignment
- `@tiptap/extension-text-style` — editor text style controls
- `@tiptap/markdown` — editor markdown serialization
- `@tiptap/pm` — TipTap/ProseMirror peer package
- `mammoth` — DOCX text/structure extraction
- `unpdf` — PDF text extraction
- `sonner` — toast notifications
- Loading UI CometSpinner — small loading states
- `lucide-react` — icons
- `tailwindcss` — styling
- `shadcn/ui` components — UI primitives
- `radix-ui` components — accessible primitives
- `vitest` — tests
- `jsdom` — Vitest DOM environment
- `playwright` — planned later E2E tests, not installed yet

Do not install additional packages without updating this list first.
