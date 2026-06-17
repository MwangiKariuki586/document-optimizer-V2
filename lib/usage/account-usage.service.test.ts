import { describe, expect, it } from "vitest";

import { formatAIActivityMeta } from "@/lib/usage/account-usage.service";

describe("formatAIActivityMeta", () => {
  it("uses the provider and model when both are available", () => {
    expect(formatAIActivityMeta("gemini", "gemini-2.5-flash")).toBe(
      "gemini gemini-2.5-flash",
    );
  });

  it("uses meaningful fallbacks when provider or model are missing", () => {
    expect(formatAIActivityMeta(null, null)).toBe("AI model");
    expect(formatAIActivityMeta("gemini", undefined)).toBe("gemini model");
  });
});
