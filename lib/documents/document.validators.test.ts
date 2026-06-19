import { describe, expect, it } from "vitest";

import {
  createPasteDocumentSchema,
  documentTitleSchema,
  editorJsonSchema,
  updateDocumentSchema,
} from "@/lib/documents/document.validators";

describe("document creation validation", () => {
  it("rejects unsafe title characters before document creation", () => {
    const result = documentTitleSchema.safeParse("<script>alert(1)</script>");

    expect(result.success).toBe(false);
  });

  it("requires pasted content for paste-created documents", () => {
    const result = createPasteDocumentSchema.safeParse({
      sourceType: "paste",
      title: "Meeting Notes",
      content: "   ",
    });

    expect(result.success).toBe(false);
  });
});

describe("document update validation", () => {
  it("accepts empty editor markdown for manual edits", () => {
    const result = updateDocumentSchema.safeParse({
      title: "Blank Draft",
      editorJson: { type: "doc", content: [] },
      currentMarkdown: "",
    });

    expect(result.success).toBe(true);
  });

  it("rejects malformed editor JSON roots", () => {
    const result = editorJsonSchema.safeParse({
      type: "paragraph",
      content: [],
    });

    expect(result.success).toBe(false);
  });
});
