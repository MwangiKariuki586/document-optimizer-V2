import { z } from "zod";

export const exportFormatSchema = z.enum([
  "docx",
  "pdf",
  "markdown",
  "txt",
  "html",
]);

export const exportOptionsSchema = z.object({
  includeAiImprovements: z.boolean(),
  includeTrackChanges: z.boolean(),
  addSummary: z.boolean(),
  addMetadata: z.boolean(),
  imageQuality: z.string().trim().min(1).max(80),
  pageSize: z.string().trim().min(1).max(80),
  margins: z.string().trim().min(1).max(80),
  watermark: z.string().trim().min(1).max(80),
});

export const createExportSchema = z.object({
  format: exportFormatSchema,
  options: exportOptionsSchema,
});

export type ExportFormat = z.infer<typeof exportFormatSchema>;
export type CreateExportOptions = z.infer<typeof exportOptionsSchema>;
export type CreateExportRequest = z.infer<typeof createExportSchema>;
