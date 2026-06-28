import type { Json } from "@/lib/supabase/types";

export type SuggestionType =
  | "conciseness"
  | "clarity"
  | "formatting"
  | "grammar"
  | "tone"
  | "structure";

export type SuggestionStatus = "pending" | "applied" | "ignored";

export type DocumentSuggestion = {
  id: string;
  documentId: string;
  aiRequestId: string | null;
  type: SuggestionType;
  originalText: string;
  suggestedText: string;
  explanation: string;
  status: SuggestionStatus;
  createdAt: string;
  updatedAt: string;
};

export type ApplySuggestionResult = {
  documentId: string;
  suggestionId: string;
  versionNumber: number;
  currentMarkdown: string;
  editorJson: Json;
  wordCount: number;
};

export type ApplyAllSuggestionsResult = {
  documentId: string;
  appliedCount: number;
  versionNumber: number;
  currentMarkdown: string;
  editorJson: Json;
  wordCount: number;
};

export type AppliedSuggestionSummaryItem = {
  label: string;
  count: number;
};

export type AppliedSuggestionSummary = {
  total: number;
  items: AppliedSuggestionSummaryItem[];
};

export type SuggestionPreviewItem = DocumentSuggestion & {
  safety: "safe" | "missing" | "ambiguous";
};

export type SuggestionPreview = {
  kind: "single_suggestion" | "multi_suggestion" | "applied_suggestions";
  id: string;
  documentId: string;
  documentTitle: string;
  originalMarkdown: string;
  proposedMarkdown: string;
  originalEditorJson?: Json | null;
  proposedEditorJson?: Json | null;
  canApply: boolean;
  summary: string;
  warnings: string[];
  suggestions: SuggestionPreviewItem[];
  selectionId?: string;
  expiresAt?: string;
  readOnly?: boolean;
};
