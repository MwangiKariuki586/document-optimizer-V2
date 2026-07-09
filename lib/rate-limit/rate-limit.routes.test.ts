import { beforeEach, describe, expect, it, vi } from "vitest";

import { POST as aiActionPost } from "@/app/api/documents/[id]/ai/route";
import { POST as exportPost } from "@/app/api/documents/[id]/export/route";
import { POST as uploadInitPost } from "@/app/api/uploads/init/route";
import { getAuthenticatedUserId } from "@/lib/auth/clerk";
import { generateDocumentExport } from "@/lib/export/export.service";
import { initializeDocumentUpload } from "@/lib/ingestion/ingestion.service";
import {
  enforceRateLimitPreset,
  RateLimitExceededError,
} from "@/lib/rate-limit/rate-limit.service";
import { runDocumentAIAction } from "@/lib/ai/ai.service";

vi.mock("@/lib/auth/clerk", () => ({
  getAuthenticatedUserId: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(() => ({ rpc: vi.fn() })),
}));

vi.mock("@/lib/rate-limit/rate-limit.service", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/lib/rate-limit/rate-limit.service")>();

  return {
    ...actual,
    enforceRateLimitPreset: vi.fn(),
  };
});

vi.mock("@/lib/ai/ai.service", () => ({
  runDocumentAIAction: vi.fn(),
}));

vi.mock("@/lib/export/export.service", () => ({
  generateDocumentExport: vi.fn(),
}));

vi.mock("@/lib/ingestion/ingestion.service", () => ({
  initializeDocumentUpload: vi.fn(),
}));

const documentId = "7a9c88f7-a571-4f3b-97f6-8290a4b88d47";
const resetAt = "2026-07-09T10:00:00.000Z";

function createRateLimitError() {
  return new RateLimitExceededError({
    allowed: false,
    remaining: 0,
    resetAt,
    limit: 5,
    windowSeconds: 60,
  });
}

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/test", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }) as never;
}

async function expectRateLimitResponse(response: Response) {
  expect(response.status).toBe(429);
  expect(response.headers.get("Retry-After")).toBeTruthy();
  expect(response.headers.get("X-RateLimit-Limit")).toBe("5");
  expect(response.headers.get("X-RateLimit-Remaining")).toBe("0");
  expect(response.headers.get("X-RateLimit-Reset")).toBe(resetAt);
  await expect(response.json()).resolves.toMatchObject({
    success: false,
    error: expect.stringMatching(
      /^Limit reached: 5 requests per minute\. Try again /,
    ),
    data: { resetAt },
  });
}

describe("rate-limited route handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAuthenticatedUserId).mockResolvedValue("user_123");
    vi.mocked(enforceRateLimitPreset).mockRejectedValue(createRateLimitError());
  });

  it("returns 429 before running an AI provider action", async () => {
    const response = await aiActionPost(
      jsonRequest({
        action: "proofread_correct",
        contentMarkdown: "Draft text",
      }),
      { params: Promise.resolve({ id: documentId }) },
    );

    await expectRateLimitResponse(response);
    expect(enforceRateLimitPreset).toHaveBeenCalledWith(
      expect.anything(),
      "aiAction",
      { userId: "user_123", documentId },
    );
    expect(runDocumentAIAction).not.toHaveBeenCalled();
  });

  it("returns 429 before generating an export", async () => {
    const response = await exportPost(
      jsonRequest({
        format: "pdf",
        options: {
          includeAiImprovements: true,
          includeTrackChanges: false,
          addSummary: true,
          addMetadata: true,
          imageQuality: "High (300 DPI)",
          pageSize: "A4 (210 x 297 mm)",
          margins: "Standard (1 inch)",
          watermark: "None",
        },
      }),
      { params: Promise.resolve({ id: documentId }) },
    );

    await expectRateLimitResponse(response);
    expect(enforceRateLimitPreset).toHaveBeenCalledWith(
      expect.anything(),
      "exportGenerate",
      { userId: "user_123", documentId },
    );
    expect(generateDocumentExport).not.toHaveBeenCalled();
  });

  it("returns 429 before initializing an upload", async () => {
    const response = await uploadInitPost(
      jsonRequest({
        name: "report.pdf",
        size: 1024,
        mimeType: "application/pdf",
        checksumSha256: "a".repeat(64),
        idempotencyKey: "fcb52217-f086-4a35-9274-bf35f6236f44",
      }),
    );

    await expectRateLimitResponse(response);
    expect(enforceRateLimitPreset).toHaveBeenCalledWith(
      expect.anything(),
      "uploadInit",
      { userId: "user_123" },
    );
    expect(initializeDocumentUpload).not.toHaveBeenCalled();
  });
});
