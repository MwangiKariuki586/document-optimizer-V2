import { describe, expect, it } from "vitest";

import {
  createBlankDocumentSchema,
  createPasteDocumentSchema,
  documentTitleSchema,
  editorJsonSchema,
  updateDocumentSchema,
} from "@/lib/documents/document.validators";

describe("document creation validation", () => {
  it("trims valid blank document titles", () => {
    const result = createBlankDocumentSchema.safeParse({
      title: "  Project Proposal  ",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.title).toBe("Project Proposal");
    }
  });

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
  it("accepts empty editor markdown for blank documents", () => {
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
