# Project Overview

## About the Project

Document Optimizer V2 is a full stack AI-powered document improvement workspace. The user can upload a document, paste text, or create a blank document, then use AI to analyze, improve, rewrite, summarize, translate, and prepare the document for export.

Unlike basic AI rewriting tools, the platform is designed around document safety and user control. AI-generated changes are shown as previews or suggestions before they are applied. The original file is preserved, important edits are versioned, and the user can restore previous document states when needed.

The experience is tracked through a dashboard showing recent documents, document activity, usage, and document processing status.

---

## The Problem It Solves

Improving documents with AI is fast, but it often creates problems. Formatting can be lost, document structure can change unexpectedly, headings and lists can be flattened, and users may not clearly understand what AI changed.

Document Optimizer V2 solves this by giving users a safer document improvement workflow. The user can improve content with AI while keeping control over what gets applied, what gets ignored, and what can be restored later.

The goal is to help users produce clearer, stronger, export-ready documents without losing document structure, original files, or version history.

---

## Pages

```txt
/                         → Homepage
/login                    → Auth page
/dashboard                → Document overview, recent activity, usage summary
/documents/new            → Upload, paste text, or create blank document
/documents/[id]           → Document editor workspace
/documents/[id]/preview   → AI result preview
/documents/[id]/versions  → Version history and restore flow
/documents/[id]/export    → Export flow
/account                  → Account and usage page
```

---

## Navigation

Top navbar on public pages. Clean and minimal.

```txt
Features    How It Works    Resources    Log in    Get Started
```

Authenticated workspace uses a collapsed-by-default sidebar so app pages keep maximum horizontal and vertical workspace area.

Primary authenticated sidebar navigation:

```txt
Dashboard    New Document    Usage    Account
```

Document routes add contextual sidebar links for the current document, such as Editor, Versions, and Export.
There is no standalone `/documents` list page in the current MVP flow; document entry points live on the dashboard, creation flow, and owned document workspaces.

---

## Core User Flow

### Homepage

- Hero section explains the document improvement promise
- Shows AI optimization process with suggestions users can choose from
- Highlights safe document improvement, formatting awareness, version history, and export
- Logged in users requesting `/` are redirected to `/dashboard`
- Logged out users are directed to authentication

### Authentication

- User signs up or logs in through Clerk
- On login → redirect to `/dashboard`
- If user has no documents → dashboard shows empty state and primary action to create or upload a document

### Dashboard

- User sees document workspace overview
- Shows recent documents
- Shows document status and fidelity indicators
- Shows usage summary
- Shows recent activity
- Provides quick actions:
  - Upload Document
  - Paste Text
  - Create Blank Document

### Upload/Create Document Flow

- User chooses one of three starting options:
  - Upload File
  - Paste Text
  - Create Blank

- Supported MVP formats:
  - PDF
  - DOCX
  - Markdown
  - TXT

- On upload:
  - Original file is stored privately
  - Text and structure are extracted where possible
  - Document fidelity status is detected
  - Initial document version is created

- After success → user is redirected to the document editor

### Document Editor Workspace

- User edits document content in a clean editor workspace
- Editor shows:
  - document title
  - save status
  - layout/fidelity status
  - original file indicator
  - editor toolbar
  - AI actions
  - suggestions
  - version access
  - export access

- User can manually edit the document at any time
- Major changes are versioned where needed

### AI Actions

- User selects an AI action:
  - Optimize
  - Improve Clarity
  - Fix Grammar
  - Rewrite
  - Summarize
  - Translate
  - Tone Analyze
  - SEO Analyze
  - Simplify Language

- AI actions default to structure-preserving behavior where possible
- AI does not automatically overwrite the document
- AI output is returned as a preview, analysis, or suggestions depending on the action

### AI Result Preview

- User reviews AI output before applying
- Preview shows current document content beside the proposed result
- Proposed result is editable before applying
- Side-by-side comparison supports synchronous scrolling
- User can:
  - Apply changes
  - Copy result
  - Regenerate
  - Discard

- Applying changes creates a version snapshot first
- Applying changes uses the edited proposed result, not necessarily the raw AI output

### Suggestions Flow

- AI can generate individual suggestions
- Each suggestion shows:
  - suggestion type
  - original text
  - suggested text
  - explanation

- User can apply or ignore each suggestion directly from the editor
- Suggestion cards visually connect to matching document text where possible
- Applying a single suggestion creates a version snapshot first and updates the editor immediately
- Review Applied Suggestions opens AI Result Preview as a read-only before/current comparison
- Review All sends pending suggestions to AI Result Preview before batch mutation

### Version History

- User can view document history
- Versions are created for important document states:
  - initial upload
  - pasted content
  - blank document creation
  - AI result application
  - suggestion application
  - restore actions

- User can restore a previous version
- Restoring a version preserves the current state first

### Export Flow

- User chooses export format:
  - DOCX
  - PDF
  - Markdown
  - TXT
  - HTML

- Export is generated from structured document content where possible
- If formatting may differ, the user sees a clear warning
- Exported files are stored privately
- User receives a signed download link

### Account and Usage

- User can view account details
- User can view usage summary:
  - documents created
  - documents uploaded
  - AI actions used
  - suggestions generated
  - suggestions applied
  - exports generated
  - token usage where available
- The MVP is free to use. Account usage should read as operational activity
  tracking, not as paid-plan, subscription, renewal, upgrade, or invoice UI.

---

## Data Architecture

### Main Document Data

Document records live in the `documents` table.

A document may include:

```txt
title
user_id
status
source_type
original_file_key
extracted_text
editor_json
current_markdown
formatting_metadata
fidelity_status
word_count
created_at
updated_at
```

Document content should not be treated as plain text only. The system should preserve structured editor content and formatting metadata where possible.

### Original File Data

Original uploaded files are stored privately in storage.

The database stores only the file key, not the raw file blob.

The original file should remain preserved even if editable extraction is limited.

### Version Data

Document versions live in the `document_versions` table.

Versions preserve previous document states and should include structured content where possible.

### AI Request Data

AI requests live in the `ai_requests` table.

Each AI request stores:

```txt
document_id
user_id
action
status
input_summary
output
provider
model
token_usage
estimated_cost
created_at
```

AI request data is used for preview, tracking, debugging, and usage reporting.

### Suggestions Data

Suggestions live in the `suggestions` table.

Suggestions are linked to a document and optionally to the AI request that generated them.

### Export Data

Exports live in the `exports` table.

Each export stores:

```txt
document_id
user_id
format
file_key
status
created_at
```

### Usage Data

Usage records live in the `usage_ledger` table.

Usage tracking supports operational activity reporting and product analytics.

---

## Features In Scope

- Homepage with hero, features, process explanation, and footer
- Clerk authentication
- Redirect to dashboard after login
- Dashboard with recent documents, quick actions, recent activity, and usage summary
- Upload document flow
- Paste text flow
- Create blank document flow
- Private original file storage
- PDF, DOCX, Markdown, and TXT support
- Document parsing with structure preservation where possible
- Document editor workspace
- Document fidelity indicators
- AI action panel
- AI result preview before apply
- AI suggestions with apply/ignore actions
- Version history
- Restore version flow
- Export flow for DOCX, PDF, Markdown, TXT, and HTML
- Usage tracking
- Sonner success, error, warning, and info toasts
- Loading states using skeletons and CometSpinner where appropriate
- Empty states and error states across core pages

---

## Features Out of Scope

- Team workspaces
- Real-time collaboration
- Comments
- Public document sharing
- Admin dashboard
- Stripe billing
- Subscription management
- Pricing pages and paid-plan account UI
- Template marketplace
- Mobile app
- Browser extension
- Cloud drive imports
- Scheduled background document optimization
- Auto-apply full AI document rewrites without preview
- Pixel-perfect PDF reconstruction
- Advanced OCR for scanned documents
- Complex image positioning preservation
- Full DOCX round-trip styling
- Multiple users editing the same document
- Separate analytics page
- Live AI agent feed

---

## Target User

A student, professional, job seeker, writer, or business user who:

- Works with documents regularly
- Wants to improve writing quality quickly
- Wants AI assistance without losing control
- Needs to preserve structure and formatting where possible
- Wants to preview changes before applying them
- Wants version history for safety
- Wants export-ready documents

---

## Success Criteria

- User can sign up, create or upload a document, and start improving it within minutes
- Uploaded documents preserve original files privately
- DOCX and Markdown documents preserve logical structure where possible
- PDF documents clearly communicate formatting limitations where needed
- AI results are previewed before being applied
- Suggestions can be applied or ignored individually
- Applying major changes creates a version snapshot first
- User can restore previous document versions
- User can export documents in supported formats
- Usage records are created for important actions
- Dashboard gives users a clear overview of document activity
- UI remains visually consistent across all pages
- Users understand when formatting is preserved, limited, or plain-text only
