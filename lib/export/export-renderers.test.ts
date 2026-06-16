import { describe, expect, it } from "vitest";

import { renderExport } from "@/lib/export/export-renderers";
import type {
  CreateExportOptions,
  ExportFormat,
} from "@/lib/export/export.validators";

const options: CreateExportOptions = {
  includeAiImprovements: true,
  includeTrackChanges: true,
  addSummary: true,
  addMetadata: true,
  imageQuality: "High (300 DPI)",
  pageSize: "A4 (210 x 297 mm)",
  margins: "Standard (1 inch)",
  watermark: "None",
};

function render(format: ExportFormat) {
  return renderExport({
    title: "Test Document",
    markdown: "# Heading\n\nHello **world**.",
    format,
    options,
    fidelityStatus: "Structure Preserved",
    wordCount: 3,
  });
}

describe("renderExport", () => {
  it("renders text-based export formats", () => {
    expect(render("markdown").data.toString("utf8")).toContain("# Heading");
    expect(render("txt").data.toString("utf8")).toContain("Hello world.");
    expect(render("html").data.toString("utf8")).toContain("<!doctype html>");
  });

  it("renders binary PDF and DOCX outputs with expected signatures", () => {
    expect(render("pdf").data.subarray(0, 8).toString("utf8")).toBe("%PDF-1.4");
    expect(render("docx").data.subarray(0, 4).toString("hex")).toBe("504b0304");
  });
});
