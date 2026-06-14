# Library Docs

Project-specific usage patterns for every third party library in this project. This file only covers how we use each library in Document Optimizer V2.

Read the relevant section before implementing any feature that touches these libraries.

---

## Before Using Any Library

Before implementing any feature that uses a third party library:

1. **Check AGENTS.md** at the project root.
   - It defines how the AI agent should work in this codebase.
   - It may reference installed skills, MCP tools, or project-specific rules.

2. **Check if an MCP server is configured** for that library.
   - If an MCP server exists, use it before relying on general knowledge.
   - Supabase MCP should be used for database inspection, migrations, RLS, and verification.

3. **Read this file** for project-specific usage patterns.

The order of authority is:

```txt
MCP server / official docs
→ AGENTS.md
→ This file
→ architecture.md
→ code-standards.md
→ general training knowledge
```

Never rely on general training knowledge alone for library APIs because APIs change frequently.

---

## Clerk

Clerk is used for authentication and user identity.

### Usage

Use Clerk for:

- sign in
- sign up
- protected routes
- authenticated user resolution
- user profile basics
- webhook-based profile sync

### App Provider

Wrap the root document with `ClerkProvider` when Clerk keys are configured.

```typescript
import { ClerkProvider } from "@clerk/nextjs";

const document = (
  <html lang="en">
    <body>{children}</body>
  </html>
);

return <ClerkProvider>{document}</ClerkProvider>;
```

If local Clerk keys are missing, public pages may render a setup state instead of crashing.

### Auth-Aware UI

Use Clerk v7 `Show` controls for signed-in and signed-out branches.

```typescript
"use client";

import { Show } from "@clerk/nextjs";

<Show when="signed-in">Dashboard link</Show>;
<Show when="signed-out">Login link</Show>;
```

Do not use removed `SignedIn` or `SignedOut` exports with the installed Clerk SDK.

### Sign-In Page

Use Clerk prebuilt auth components on `/login`. The route must be a catch-all route at `app/(auth)/login/[[...rest]]/page.tsx` unless the component is configured for hash routing.

```typescript
import { SignIn } from "@clerk/nextjs";

<SignIn
  fallbackRedirectUrl="/dashboard"
  forceRedirectUrl="/dashboard"
  signUpFallbackRedirectUrl="/dashboard"
/>;
```

### Server-Side User Resolution

```typescript
import { auth } from "@clerk/nextjs/server";

export async function getCurrentUserId(): Promise<string> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  return userId;
}
```

### Middleware

Use `proxy.ts` for protected route enforcement.

```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/documents(.*)",
  "/account(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});
```

Protected routes:

```txt
/dashboard
/documents/new
/documents/[id]
/documents/[id]/preview
/documents/[id]/versions
/documents/[id]/export
/account
```

### Rules

- Clerk is the source of authenticated user identity
- Never accept `user_id` from the frontend
- Store Clerk user ID in user-owned records
- Every private route must resolve the user server-side
- Protected pages must redirect unauthenticated users
- Protected API routes must return an unauthorized response
- Clerk secret keys must never be exposed to the browser
- Use Clerk webhooks to sync profile records where needed

---

## Supabase

Supabase is used for Postgres, private storage, RLS, and generated TypeScript types.

### Client vs Server

Use separate client patterns.

```typescript
// lib/supabase/client.ts
// Browser-safe client.

import { createClient } from "@supabase/supabase-js";

export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
```

```typescript
// lib/supabase/server.ts
// Server-only client.

import { createClient } from "@supabase/supabase-js";

export function createSupabaseServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
      },
    },
  );
}
```

### Database Query Pattern

```typescript
const supabase = createSupabaseServerClient();

const { data, error } = await supabase
  .from("documents")
  .select("*")
  .eq("id", documentId)
  .eq("user_id", userId)
  .single();

if (error) {
  throw new Error("Failed to load document");
}
```

### Insert Pattern

```typescript
const { data, error } = await supabase
  .from("documents")
  .insert({
    user_id: userId,
    title,
    source_type: "blank",
    status: "ready",
  })
  .select()
  .single();

if (error) {
  throw new Error("Failed to create document");
}
```

### Update Pattern

```typescript
const { error } = await supabase
  .from("documents")
  .update({
    title,
    current_markdown: content,
    editor_json: editorJson,
    updated_at: new Date().toISOString(),
  })
  .eq("id", documentId)
  .eq("user_id", userId);

if (error) {
  throw new Error("Failed to update document");
}
```

### Rules

- Always scope user-owned queries by `user_id`
- Always handle the `error` return
- Use `.single()` only when expecting exactly one row
- Use generated Supabase TypeScript types
- Do not use an ORM during MVP unless explicitly approved
- Keep service role key server-only
- Browser client must not perform sensitive writes
- Use Supabase MCP for schema inspection, migrations, RLS, and verification

---

## Supabase MCP

Supabase MCP is used to safely inspect and manage the Supabase project.

### Use Supabase MCP For

- inspecting existing schema
- preparing migrations
- applying approved migrations
- setting up RLS policies
- verifying RLS behavior
- checking storage buckets
- verifying database changes
- supporting generated type updates

### Rules

- Do not apply schema changes without showing the SQL first
- Do not apply RLS changes without approval
- Do not create speculative tables
- Verify every migration after applying
- Keep `progress-tracker.md` updated after schema changes
- Prefer small migration batches over large risky migrations

---

## Supabase Storage

Storage is used for original uploaded files and generated exports.

### Buckets

```txt
documents
exports
```

### Path Pattern

```txt
{user_id}/{document_id}/original/{filename}
{user_id}/{document_id}/exports/{filename}
```

### Upload Pattern

```typescript
const { data, error } = await supabase.storage
  .from("documents")
  .upload(filePath, fileBuffer, {
    contentType,
    upsert: false,
  });

if (error) {
  throw new Error("Failed to upload file");
}
```

### Signed URL Pattern

```typescript
const { data, error } = await supabase.storage
  .from("exports")
  .createSignedUrl(filePath, 60 * 10);

if (error || !data?.signedUrl) {
  throw new Error("Failed to create signed URL");
}

return data.signedUrl;
```

### Rules

- Files are private by default
- Store raw files in storage, not Postgres
- Store file keys in the database
- Use signed URLs for downloads
- Validate ownership before generating signed URLs
- Preserve original uploaded files
- Do not expose permanent public document URLs

---

## OpenAI

OpenAI is one of the approved AI providers.

All OpenAI calls must go through the AI provider abstraction.

### Provider Pattern

```typescript
// lib/ai/providers/openai.provider.ts

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function runOpenAIAction(
  input: AIActionInput,
): Promise<AIActionResult> {
  const response = await openai.chat.completions.create({
    model: input.model,
    temperature: input.temperature,
    messages: input.messages,
  });

  return normalizeOpenAIResponse(response);
}
```

### Structured JSON Pattern

```typescript
const response = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  response_format: { type: "json_object" },
  temperature: 0.3,
  messages: [
    {
      role: "system",
      content: "Return only valid JSON.",
    },
    {
      role: "user",
      content: prompt,
    },
  ],
});

const content = response.choices[0]?.message?.content;

if (!content) {
  throw new Error("AI response was empty");
}

const parsed = JSON.parse(content);
```

### Usage

Use OpenAI for:

- document optimization
- grammar improvement
- clarity improvement
- rewriting
- summarization
- tone analysis
- SEO analysis
- suggestion generation
- document structure analysis

### Rules

- Never call OpenAI directly from route handlers
- Never call OpenAI directly from components
- Always use the AI router
- Always validate AI input with Zod
- Always normalize provider responses
- Always store AI requests in `ai_requests`
- Always record token usage where available
- Always return preview-first results
- Never automatically overwrite document content
- Use lower temperature for analysis and structured output
- Use higher temperature only for creative rewriting where approved

---

## Gemini

Gemini is an approved secondary AI provider.

All Gemini calls must go through the AI provider abstraction.

### Provider Pattern

```typescript
// lib/ai/providers/gemini.provider.ts

export async function runGeminiAction(
  input: AIActionInput,
): Promise<AIActionResult> {
  // initialize Gemini client
  // call model
  // normalize response

  return normalizedResult;
}
```

### Usage

Use Gemini for:

- fallback AI provider
- cost comparison
- alternate document analysis
- future provider routing

### Rules

- Never call Gemini directly from route handlers
- Never call Gemini directly from components
- Gemini results must normalize into the same `AIActionResult` shape as OpenAI
- Provider-specific errors must be converted into safe app errors
- Record provider and model in `ai_requests`
- Record usage where available

---

## AI Router

The AI router decides which provider handles an AI action.

### Pattern

```typescript
// lib/ai/ai-router.ts

export async function runAIAction(
  input: AIActionInput,
): Promise<AIActionResult> {
  const provider = selectProvider(input);

  return provider.run(input);
}
```

### Normalized Result Shape

```typescript
type AIActionResult = {
  action: string;
  mode: "preview" | "suggestions" | "analysis";
  output: unknown;
  summary?: string;
  provider: "openai" | "gemini";
  model: string;
  inputTokens?: number;
  outputTokens?: number;
  estimatedCost?: number;
  warnings?: string[];
};
```

### Rules

- Route handlers call the AI router, not providers
- Providers return normalized results
- AI actions must support preview-first workflows
- Structure-preserving behavior is the default
- AI output must be stored before being applied
- Applying AI output is a separate user action

---

## TipTap

TipTap is used for the document editor.

### Usage

Use TipTap for:

- rich document editing
- headings
- paragraphs
- lists
- bold/italic formatting
- links where supported
- editor JSON storage
- editor-to-markdown conversion where supported

### Component Rule

TipTap editor components are client components.

```typescript
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

type Props = {
  initialContent: unknown;
};

export function DocumentEditor({ initialContent }: Props) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
  });

  return <EditorContent editor={editor} />;
}
```

### Extensions and Markdown

The editor extension set is centralized in `lib/editor/editor-extensions.ts` (shared by the editor and the headless tests): `StarterKit`, `TextStyleKit`, `Highlight`, `TextAlign`, and `Markdown` (`@tiptap/markdown`).

`@tiptap/markdown` adds bidirectional Markdown. Use `editor.getMarkdown()` to serialize the document to real Markdown when persisting `current_markdown` (not `editor.getText()`, which is plain text). Example save payload:

```typescript
body: JSON.stringify({
  title,
  editorJson: editor.getJSON(),
  currentMarkdown: editor.getMarkdown(),
});
```

### Storage

Persist editor content as:

```txt
editor_json
current_markdown
formatting_metadata
```

### Rules

- TipTap must stay inside editor-specific Client Components
- Do not put TipTap in page-level Server Components
- Store `editor_json` as the main rich editor representation
- Keep `current_markdown` as portable fallback content; serialize it with `editor.getMarkdown()`
- Do not treat extracted text as the only source of truth
- Preserve document structure where technically possible
- Debounce saves where appropriate
- Show save status clearly

---

## Zod

Zod is used for validation.

### Request Validation Pattern

```typescript
import { z } from "zod";

const CreateDocumentSchema = z.object({
  title: z.string().min(1).max(120),
  sourceType: z.enum(["blank", "paste"]),
  content: z.string().optional(),
});

const result = CreateDocumentSchema.safeParse(body);

if (!result.success) {
  return {
    success: false,
    error: "Invalid document data",
  };
}
```

### Rules

- Validate every API request body
- Validate search params where needed
- Validate form payloads where needed
- Validate AI action inputs
- Validate export formats
- Use `safeParse` for user input
- Never trust frontend validation alone
- Keep schemas close to the domain they validate

---

## Sonner

Sonner is used for global toast notifications.

### Setup

Mount the toaster once.

```typescript
// components/feedback/AppToaster.tsx

"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return <Toaster richColors position="top-right" />;
}
```

### Toast Helper

```typescript
// lib/feedback/toast.ts

import { toast } from "sonner";

export const appToast = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  warning: (message: string) => toast.warning(message),
  info: (message: string) => toast.info(message),
};
```

### Rules

- Mount `AppToaster` once
- Use centralized toast helpers
- Use success, error, warning, and info consistently
- Critical errors must also be shown inline
- Do not use toast as the only feedback for page-level failures

---

## Loading UI CometSpinner

CometSpinner is used for small loading states.

### Usage

```typescript
import { CometSpinner } from "@/components/loading-ui/comet-spinner";

export function SaveButton({ isSaving }: { isSaving: boolean }) {
  return (
    <button disabled={isSaving}>
      {isSaving ? <CometSpinner className="size-4" /> : "Save"}
    </button>
  );
}
```

### Rules

- Use CometSpinner for button loading states
- Use CometSpinner for compact inline loading states
- Do not use CometSpinner for full page loading
- Use skeletons for large loading areas
- Prefer `LoadingButton` instead of repeating spinner logic

---

## shadcn/ui

shadcn/ui provides reusable UI primitives.

### Usage

Use shadcn/ui for:

- buttons
- inputs
- dialogs
- dropdowns
- cards
- tabs
- badges
- progress
- tooltips
- sheets
- forms where useful

### Rules

- Components in `components/ui/` should remain close to shadcn defaults
- Do not overload base UI components with domain logic
- Domain-specific components belong outside `components/ui/`
- Use Radix-backed components for accessibility
- Do not create custom primitives when shadcn/ui already provides one

---

## Radix UI

Radix UI powers accessible primitives.

### Usage

Use Radix patterns through shadcn/ui where possible.

Use Radix directly only when shadcn/ui does not cover the required primitive.

### Rules

- Use Radix for accessible dialogs, popovers, tabs, dropdowns, sheets, and tooltips
- Do not rebuild accessibility behavior manually
- Keep keyboard navigation intact
- Do not remove focus states

---

## Tailwind CSS

Tailwind CSS is used for styling.

### Rules

- Follow `ui-tokens.md`
- Follow `ui-rules.md`
- Prefer utility classes over custom CSS
- Do not hardcode random colors
- Use consistent spacing, radius, shadows, and borders
- Avoid one-off visual styles
- Keep layouts clean and spacious
- Do not use inline styles

---

## Lucide React

Lucide React is used for icons.

### Usage

```typescript
import { FileText } from "lucide-react";

<FileText className="size-4" />;
```

### Rules

- Use icons to support meaning, not decorate randomly
- Keep icon sizes consistent
- Use `size-4`, `size-5`, or `size-6` unless a design requires otherwise
- Icons should inherit text color through `currentColor`

---

## Vitest

Vitest is used for unit and service-level tests.

### Usage

Use Vitest for:

- validators
- service functions
- utility functions
- AI response normalization
- export format validation
- usage calculations

### Rules

- Test critical logic first
- Keep tests close to the logic they validate where practical
- Do not write fragile implementation-detail tests
- Mock AI providers in tests
- Mock Supabase calls where needed
- Do not call real AI providers in tests

---

## Playwright

Playwright is deferred until MVP flows stabilize.

### Usage Later

Use Playwright for:

- authentication flow
- document creation flow
- upload/create flow
- AI preview flow
- version restore flow
- export flow

### Rules

- Do not add Playwright tests before core flows stabilize
- Keep E2E tests focused on user journeys
- Do not test visual details with brittle selectors
- Use stable labels, roles, and test IDs where needed
