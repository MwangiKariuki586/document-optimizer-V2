import { describe, expect, it } from "vitest";

import { createExportSchema } from "@/lib/export/export.validators";

const validOptions = {
  includeAiImprovements: true,
  includeTrackChanges: false,
  addSummary: true,
  addMetadata: true,
  imageQuality: "High (300 DPI)",
  pageSize: "A4 (210 x 297 mm)",
  margins: "Standard (1 inch)",
  watermark: "None",
};

describe("createExportSchema", () => {
  it.each(["docx", "pdf", "markdown", "txt", "html"])(
    "accepts supported export format %s",
    (format) => {
      const result = createExportSchema.safeParse({
        format,
        options: validOptions,
      });

      expect(result.success).toBe(true);
    },
  );

  it("rejects unsupported export formats", () => {
    const result = createExportSchema.safeParse({
      format: "rtf",
      options: validOptions,
    });

    expect(result.success).toBe(false);
  });

  it("rejects incomplete export options", () => {
    const result = createExportSchema.safeParse({
      format: "pdf",
      options: {
        ...validOptions,
        margins: "",
      },
    });

    expect(result.success).toBe(false);
  });
});
