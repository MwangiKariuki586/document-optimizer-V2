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
  signUpFallbackRedirectUrl="/dashboard"
/>;
```

Use `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login` and
`NEXT_PUBLIC_CLERK_SIGN_UP_URL=/login` so middleware redirects protected route
refreshes and the combined sign-in/sign-up flow to the local auth page. Do not
use `forceRedirectUrl` for normal sign-in because it overrides Clerk's
`redirect_url` and prevents users from returning to the protected page they
originally requested.

The `/login` page should also redirect already signed-in users server-side using
a same-origin `redirect_url` value when present, falling back to `/dashboard`.
The same-origin check should derive the current app origin from request headers
first so Vercel preview deployments, production domains, and local development
all validate against the URL the user actually opened. `VERCEL_URL` and
`NEXT_PUBLIC_APP_URL` are fallbacks only.
Local development uses `npm run dev` with `next dev --webpack` because the
Node/Next web-streaming `controller[kState].transformAlgorithm is not a
function` failure can leave authenticated refreshes on the loading shell under
the default dev server. Use `npm run dev:turbo` only when intentionally testing
Turbopack behavior.

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

The current MVP uses the server client only. Client Components call API routes
for data mutations and protected reads instead of importing Supabase directly.

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
    source_type: "paste",
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

### Rate Limit RPC Pattern

Authenticated mutation rate limiting uses a server-only Postgres RPC:
`consume_rate_limit(p_rule_key, p_subject_key, p_max_count,
p_window_seconds)`. Application code calls it only through
`lib/rate-limit/rate-limit.service.ts` with the service-role Supabase server
client.

The backing `rate_limit_events` table must keep RLS enabled and expose no
anon/authenticated browser policies. The RPC grants execute only to
`service_role`, uses a transaction-scoped advisory lock per rule/subject,
counts events in the trailing window, and returns:

```typescript
{
  allowed: boolean;
  remaining: number;
  reset_at: string;
  limit_count: number;
}
```

Treat RPC failures as fail-closed server errors. Do not fall back to an
in-memory limiter for protected production routes because serverless/runtime
instances do not share memory.

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

Original document uploads now use a signed direct TUS flow. The server calls
`createSignedUploadUrl` for the owner-scoped Storage key; the browser sends 6 MB
chunks to the direct Storage hostname at `/storage/v1/upload/resumable/sign`
with the returned token in `x-signature`.
Next.js receives metadata and completion requests only, never browser-uploaded
file bytes. After upload completion, the server verifies the private Storage
object. Eligible TXT, Markdown, DOCX, and PDF files up to 5 MB then use an inline
fast path: the server downloads the private object, recomputes SHA-256,
validates file safety, parses, and finalizes the document in the completion
request with a 4 second processing budget. If the fast path is ineligible or
times out, the ingestion is queued for the Node worker.

The ingestion worker uses `pgmq.read` with a visibility timeout, downloads the
private original with the service role, recomputes SHA-256, and invokes the
transactional finalization function. Browser roles have no queue access. The
buffer upload snippet below remains applicable only to server-generated exports
and the disabled legacy upload fallback.

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

## DeepSeek

DeepSeek is the primary MVP AI provider.

All DeepSeek calls must go through the AI provider abstraction.

### Environment

```txt
DEEPSEEK_API_KEY=required for MVP AI actions
```

### Provider Pattern

```typescript
// lib/ai/providers/deepseek.provider.ts

const response = await fetch("https://api.deepseek.com/chat/completions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: input.model ?? "deepseek-v4-flash",
    messages: [
      { role: "system", content: AI_SYSTEM_PROMPT },
      { role: "user", content: buildAIUserPrompt(input) },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
    thinking: { type: "disabled" },
    stream: false,
  }),
});
```

### Usage

Use DeepSeek for:

- improvement scans
- proofreading and correctness suggestions
- readability suggestions
- tone alignment suggestions
- structure and flow suggestions or result previews
- summary and shortening result previews
- translation result previews
- suggestion generation

### Rules

- Never call DeepSeek directly from route handlers
- Never call DeepSeek directly from components
- Always use `lib/ai/ai-router.ts`
- DeepSeek results must normalize into the shared `AIActionResult` shape
- Provider-specific errors must be converted into safe app errors
- Use `deepseek-v4-flash` for the default low-latency document path
- Use `DEEPSEEK_API_KEY` only on the server
- Use JSON output and keep the system prompt explicit about valid JSON
- Disable thinking for default document transformations
- Retry one transient DeepSeek network, rate-limit, or 5xx failure after a short delay
- Use Gemini only as a fallback when the default unpinned DeepSeek path remains transiently unavailable
- Record provider and model in `ai_requests`
- Log provider, persistence, and total durations for performance diagnosis
- Record usage where available
- Always return preview-first results
- Never automatically overwrite document content

---

## Gemini

Gemini is an optional AI provider path retained behind the provider abstraction.

All Gemini calls must go through the AI provider abstraction.

### Environment

```txt
GEMINI_API_KEY=optional Gemini provider
```

### Provider Pattern

```typescript
// lib/ai/providers/gemini.provider.ts

import { GoogleGenAI } from "@google/genai";

export async function runGeminiAction(
  input: AIActionInput,
): Promise<AIActionResult> {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
  const model = input.model ?? "gemini-2.5-flash-lite";

  const response = await ai.models.generateContent({
    model,
    contents: buildAIUserPrompt(input),
    config: {
      systemInstruction: AI_SYSTEM_PROMPT,
      temperature: 0.3,
      responseMimeType: "application/json",
      responseJsonSchema: AI_RESPONSE_JSON_SCHEMA,
      thinkingConfig: { thinkingBudget: 0 },
    },
  });

  return normalizeProviderResponse({
    input,
    provider: "gemini",
    model,
    text: response.text,
    inputTokens: response.usageMetadata?.promptTokenCount,
    outputTokens: response.usageMetadata?.candidatesTokenCount,
  });
}
```

### Usage

Gemini may be explicitly selected for:

- improvement scans
- proofreading and correctness suggestions
- readability suggestions
- tone alignment suggestions
- structure and flow suggestions or result previews
- summary and shortening result previews
- translation result previews
- suggestion generation

### Rules

- Never call Gemini directly from route handlers
- Never call Gemini directly from components
- Always use `lib/ai/ai-router.ts`
- Gemini results must normalize into the shared `AIActionResult` shape
- Provider-specific errors must be converted into safe app errors
- Use `gemini-2.5-flash-lite` for the explicit Gemini low-latency document path
- Disable Gemini 2.5 thinking for deterministic document transformations
- Constrain responses with the shared AI output JSON schema before normalization
- Retry transient default-model capacity failures once on the stable
  `gemini-3.1-flash-lite` fallback; malformed default-model responses also use
  that fallback, while explicitly requested models do not fall back
- Record provider and model in `ai_requests`
- Log provider, persistence, and total durations for performance diagnosis
- Record usage where available
- Always return preview-first results
- Never automatically overwrite document content

---

## OpenAI

OpenAI is an optional future provider. It is not required for MVP completion and must not be selected by default.

All OpenAI calls must go through the AI provider abstraction if the provider is re-enabled later.

### Environment

```txt
OPENAI_API_KEY=optional/future only
```

### MVP Placeholder Pattern

```typescript
// lib/ai/providers/openai.provider.ts

import { AIProviderError, type AIProvider } from "@/lib/ai/ai.types";

export const openAIProvider: AIProvider = {
  name: "openai",
  defaultModel: "gpt-4o-mini",
  async run() {
    throw new AIProviderError("OpenAI provider is not enabled for MVP");
  },
};
```

### Rules

- Never call OpenAI directly from route handlers
- Never call OpenAI directly from components
- Keep OpenAI behind `lib/ai/ai-router.ts`
- OpenAI must not block MVP AI action completion
- Re-enable OpenAI later only through the provider abstraction

---

## AI Router

The AI router decides which provider handles an AI action. For the MVP it defaults to DeepSeek unless another enabled provider is explicitly requested.

### Pattern

```typescript
// lib/ai/ai-router.ts

export async function runAIAction(
  input: unknown,
): Promise<AIActionResult> {
  const parsed = aiActionInputSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error("Invalid AI action input");
  }

  const provider = selectAIProvider(parsed.data);

  return provider.run(parsed.data);
}
```

Current `lib/ai` structure:

```txt
lib/ai/ai.types.ts        → shared action/provider/result types
lib/ai/ai.validators.ts   → Zod input/output validation for AI actions
lib/ai/ai.service.ts      → document-scoped AI request persistence and usage tracking
lib/ai/ai-prompts.ts      → shared system/user prompt construction
lib/ai/ai-normalize.ts    → provider JSON parsing and result normalization
lib/ai/ai-cost.ts         → estimated token cost helper
lib/ai/ai-router.ts       → provider selection and runAIAction entry point
lib/ai/providers/*        → DeepSeek adapter, Gemini adapter, and optional/future OpenAI placeholder
```

Task 18 route flow:

```txt
POST /api/documents/[id]/ai
  → authenticate with Clerk
  → validate body with runAIActionRequestSchema
  → runDocumentAIAction()
  → ownership-scoped document lookup
  → create ai_requests row with status=running
  → call runAIAction() provider abstraction
  → update ai_requests completed/failed
  → persist generated suggestions and usage
  → return completed normalized result plus persisted suggestions
```

AI execution remains request-bound for the current MVP. Do not add an AI worker
or polling route without an explicit architecture and scope decision.

Task 19 preview/apply flow:

```txt
/documents/[id]/preview?requestId=...
  → authenticate with Clerk in the server page
  → getAIRequestPreview()
  → ownership-scoped ai_requests + documents lookup
  → render original/current document content beside saved AI output

/documents/[id]/preview?suggestionId=...
  → authenticate with Clerk in the server page
  → getSuggestionPreview()
  → ownership-scoped pending suggestion + document lookup
  → compute proposed markdown without persisting
  → used for explicit preview/review links, not the default single-card Apply

/documents/[id]/preview?selectionId=...
  → authenticate with Clerk in the server page
  → getSuggestionSelectionPreview()
  → resolve owned, unexpired suggestion_preview_selections row
  → load selected owned pending suggestions
  → compute proposed markdown without persisting

POST /api/documents/[id]/ai/[requestId]/apply
  → authenticate with Clerk
  → applyAIRequestResult()
  → load owned completed ai_requests row
  → require output.revisedMarkdown
  → snapshotDocumentVersion(source=ai_apply)
  → update documents.current_markdown/editor_json/word_count
  → record usage metadata
  → redirect client back to editor
```

Task 21 suggestions flow:

```txt
runDocumentAIAction()
  → on completed AI result with output.suggestions[]
  → saveSuggestionsFromAIResult() inserts pending suggestions rows

GET /api/documents/[id]/suggestions
  → authenticate with Clerk
  → listDocumentSuggestions() scoped by user_id + document_id

POST /api/documents/[id]/suggestions/[suggestionId]/apply
  → authenticate with Clerk
  → applySuggestion()
  → verify owned pending suggestion
  → fail safely if original text is missing or ambiguous
  → create or reuse a grouped suggestion_apply rollback snapshot for the AI request
  → replace original_text with suggested_text in current_markdown
  → update documents.current_markdown/editor_json/word_count
  → mark suggestion applied
  → record suggestion_apply usage

POST /api/documents/[id]/suggestions/selections
  → authenticate with Clerk
  → validate pending suggestionIds with createSuggestionSelectionSchema
  → createSuggestionPreviewSelection()
  → verify Review All suggestions are owned, pending, and belong to document
  → store short-lived suggestion_preview_selections row
  → return selectionId for /documents/[id]/preview?selectionId=...

POST /api/documents/[id]/suggestions/selections/[selectionId]/apply
  → authenticate with Clerk
  → applySelectedSuggestions()
  → resolve owned, unexpired selection
  → revalidate pending batch suggestions against current document
  → create one pre-batch snapshot
  → apply all safe replacements and mark batch suggestions applied
  → mark selection consumed
  → record suggestion_apply usage with appliedCount metadata

POST /api/documents/[id]/suggestions/[suggestionId]/ignore
  → authenticate with Clerk
  → ignoreSuggestion()
  → mark owned pending suggestion ignored (no document mutation)

POST /api/documents/[id]/suggestions/apply-all
  → legacy route kept only to return a safe review-required response
  → must not mutate documents directly
  → bulk suggestion apply must use server-backed selections and the preview apply route
```

### Normalized Result Shape

```typescript
type AIActionResult = {
  action: string;
  mode: "preview" | "suggestions" | "analysis";
  output: {
    mode: "preview" | "suggestions" | "analysis";
    workflow?: "inline_suggestions" | "result_preview";
    resultMode?: "optimization" | "summary" | "translation";
    structureChangeLevel?: "minor" | "major";
    summary: string;
    revisedMarkdown: string | null;
    suggestions: Array<{
      type: "clarity" | "grammar" | "tone" | "structure" | "seo";
      originalText: string;
      suggestedText: string;
      explanation: string;
    }>;
    analysis: {
      clarity?: number;
      tone?: number;
      structure?: number;
      seo?: number;
      notes: string[];
    };
    warnings: string[];
  };
  summary: string;
  provider: "deepseek" | "gemini" | "openai";
  model: string;
  inputTokens?: number;
  outputTokens?: number;
  estimatedCost?: number;
  warnings?: string[];
};
```

### Rules

- Route handlers call the AI router, not providers
- Route handlers call `runDocumentAIAction()` for document-scoped execution; it owns provider execution, `ai_requests` completion/failure persistence, suggestion insertion, and usage recording.
- The completed response includes persisted suggestions for the request so the editor does not refetch the full document suggestion list.
- The AI router defaults to DeepSeek for MVP execution.
- Providers return normalized results
- AI actions must support preview-first workflows for full-document results
- Structure-preserving behavior is the default
- AI output must be stored before being applied
- Applying full AI output is a separate user action from the preview page; applying one concrete suggestion is a separate explicit editor action
- Applying AI output must call `snapshotDocumentVersion()` first; never update document content directly from the preview UI.

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
- links
- images
- tables
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

The editor extension set is centralized in `lib/editor/editor-extensions.ts`
(shared by the editor, server conversion helpers, and headless tests):
`StarterKit`, `TextStyleKit`, `Highlight`, `TextAlign`, `Link`, `Image`,
`Table`, `TableRow`, `TableHeader`, `TableCell`, and `Markdown`
(`@tiptap/markdown`).

`@tiptap/markdown` adds bidirectional Markdown. Use `editor.getMarkdown()` to serialize the document to real Markdown when persisting `current_markdown` (not `editor.getText()`, which is plain text). Example save payload:

```typescript
body: JSON.stringify({
  title,
  editorJson: editor.getJSON(),
  currentMarkdown: editor.getMarkdown(),
});
```

Server-side conversion uses:

- `@tiptap/html/server` + `happy-dom` in `lib/documents/html-to-editor.ts`
  to convert mammoth HTML into TipTap JSON and to render TipTap JSON to HTML.
- `MarkdownManager` from `@tiptap/markdown` in
  `lib/documents/markdown-to-editor.ts` to parse Markdown uploads and serialize
  editor JSON back to Markdown.

### Optimization Highlight Decorations

Inline AI suggestion highlights use the local `SuggestionHighlight` TipTap
extension in `lib/editor/suggestion-highlight.ts`. It adds ProseMirror
decorations only; it must not write suggestion metadata into `editor_json` or
exported content. `EditorWorkspace` computes pending suggestion ranges from the
current editor document, passes category and issue-label metadata into the
extension, and keeps card/highlight focus state synchronized.

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
- Treat suggestion highlights as a temporary annotation layer, not document marks
- Debounce saves where appropriate
- Show save status clearly

---

## unpdf

unpdf is used for PDF text extraction.

### Usage

Use `extractTextItems()` for editable PDF ingestion so positioned text fragments
can be reconstructed into visual lines, paragraphs, headings, lists, and page
separators before conversion into TipTap JSON. Avoid `extractText(...,
mergePages: true)` as the primary ingestion path because it collapses PDF text
into a flat string and loses layout signals.

`extractText()` remains acceptable as a degraded fallback when positioned item
extraction returns no usable text.

### Rules

- PDF layout reconstruction is heuristic and must keep the original file
  preserved.
- PDF imports should keep a clear formatting warning; do not imply
  pixel-perfect editable PDF reconstruction.
- Prefer coordinate-aware grouping over newline-driven `plainTextToEditorJson`
  for PDF uploads.
- Store extraction metadata such as page count, item count, and line count in
  `formatting_metadata` when available.

---

## Zod

Zod is used for validation.

### Request Validation Pattern

```typescript
import { z } from "zod";

const CreateDocumentSchema = z.object({
  title: z.string().min(1).max(120),
  sourceType: z.literal("paste"),
  content: z.string().min(1),
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
import { CometSpinner } from "@/components/loading-ui/CometSpinner";

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
