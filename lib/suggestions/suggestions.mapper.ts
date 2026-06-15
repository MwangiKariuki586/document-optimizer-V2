import type { DocumentSuggestion } from "@/lib/suggestions/suggestions.types";
import type {
  EditorSuggestion,
  SuggestionType,
} from "@/components/editor/EditorSuggestionsPanel";

const TYPE_LABELS: Record<DocumentSuggestion["type"], SuggestionType> = {
  clarity: "Clarity",
  grammar: "Grammar",
  tone: "Tone",
  structure: "Structure",
  seo: "SEO",
};

export function mapDocumentSuggestionToEditorSuggestion(
  suggestion: DocumentSuggestion,
  index: number,
): EditorSuggestion {
  return {
    id: suggestion.id,
    index,
    type: TYPE_LABELS[suggestion.type],
    originalText: suggestion.originalText,
    suggestedText: suggestion.suggestedText,
    explanation: suggestion.explanation,
    status: suggestion.status,
  };
}

export function mapDocumentSuggestionsToEditorSuggestions(
  suggestions: DocumentSuggestion[],
): EditorSuggestion[] {
  return suggestions.map((suggestion, index) =>
    mapDocumentSuggestionToEditorSuggestion(suggestion, index + 1),
  );
}
