import { beforeEach, describe, expect, it, vi } from "vitest";
import mammoth from "mammoth";

import { editorJsonToHtml } from "@/lib/documents/html-to-editor";
import { parseDocx } from "@/lib/parsing/parse-docx";

vi.mock("mammoth", () => ({
  default: {
    extractRawText: vi.fn(),
    convertToHtml: vi.fn(),
    images: {
      dataUri: "data-uri-converter",
    },
  },
}));

const mammothMock = vi.mocked(mammoth);

describe("parseDocx", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("stores mammoth HTML as structured editor JSON when conversion succeeds", async () => {
    mammothMock.extractRawText.mockResolvedValue({
      value: "Profile Summary\nBuilt reliable products",
      messages: [],
    });
    mammothMock.convertToHtml.mockResolvedValue({
      value:
        "<h1>Profile Summary</h1><p>Built <strong>reliable</strong> products</p>",
      messages: [],
    });

    const parsed = await parseDocx(Buffer.from("docx"));
    const html = editorJsonToHtml(parsed.editorJson);

    expect(html).toContain("<h1");
    expect(html).toContain("<strong");
    expect(parsed.currentMarkdown).toContain("# Profile Summary");
    expect(parsed.fidelityStatus).toBe("Structure Preserved");
    expect(parsed.warnings).toEqual([]);
  });

  it("falls back to limited formatting when no HTML is produced", async () => {
    mammothMock.extractRawText.mockResolvedValue({
      value: "Plain fallback",
      messages: [],
    });
    mammothMock.convertToHtml.mockResolvedValue({
      value: "",
      messages: [],
    });

    const parsed = await parseDocx(Buffer.from("docx"));

    expect(parsed.fidelityStatus).toBe("Limited Formatting");
    expect(parsed.editorJson).toEqual(expect.objectContaining({ type: "doc" }));
  });
});
