import { Editor } from "@tiptap/core";
import { describe, expect, it } from "vitest";

import { editorExtensions } from "@/lib/editor/editor-extensions";
import { findSuggestionHighlightRanges } from "@/lib/editor/suggestion-highlight";

function makeEditor(content: string): Editor {
  return new Editor({
    extensions: editorExtensions,
    content,
  });
}

describe("suggestion highlights", () => {
  it("creates category-aware ranges for matching suggestion anchors", () => {
    const editor = makeEditor("<p>This sentence is too long.</p>");

    const ranges = findSuggestionHighlightRanges(editor.state.doc, [
      {
        id: "suggestion-1",
        originalText: "sentence is too long",
        category: "conciseness",
        issueLabel: "Trim wordy phrasing",
      },
    ]);

    expect(ranges).toEqual([
      expect.objectContaining({
        id: "suggestion-1",
        category: "conciseness",
        issueLabel: "Trim wordy phrasing",
      }),
    ]);
    expect(ranges[0]?.from).toBeLessThan(ranges[0]?.to ?? 0);

    editor.destroy();
  });

  it("omits suggestions that cannot be matched in the current editor document", () => {
    const editor = makeEditor("<p>Current editor text.</p>");

    const ranges = findSuggestionHighlightRanges(editor.state.doc, [
      {
        id: "stale-suggestion",
        originalText: "Previous editor text",
        category: "clarity",
        issueLabel: "Clarify phrasing",
      },
    ]);

    expect(ranges).toHaveLength(0);

    editor.destroy();
  });
});
