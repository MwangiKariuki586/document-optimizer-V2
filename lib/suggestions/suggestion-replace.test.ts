import { describe, expect, it } from "vitest";

import {
  applyReplacementsSafely,
  countOccurrences,
  getReplacementSafety,
  replaceOnce,
  SuggestionReplacementError,
} from "@/lib/suggestions/suggestion-replace";

describe("suggestion-replace", () => {
  it("counts occurrences correctly", () => {
    expect(countOccurrences("hello hello world", "hello")).toBe(2);
    expect(countOccurrences("hello world", "missing")).toBe(0);
  });

  it("detects safe, missing, and ambiguous replacements", () => {
    expect(getReplacementSafety("hello world", "hello")).toBe("safe");
    expect(getReplacementSafety("hello world", "missing")).toBe("missing");
    expect(getReplacementSafety("hello hello", "hello")).toBe("ambiguous");
  });

  it("replaces a unique match once", () => {
    expect(replaceOnce("hello world", "world", "there")).toBe("hello there");
  });

  it("throws when replacement is missing or ambiguous", () => {
    expect(() => replaceOnce("hello world", "missing", "x")).toThrow(
      SuggestionReplacementError,
    );
    expect(() => replaceOnce("hello hello", "hello", "hi")).toThrow(
      SuggestionReplacementError,
    );
  });

  it("applies multiple unique replacements from end to start", () => {
    const result = applyReplacementsSafely("alpha beta gamma", [
      { originalText: "alpha", suggestedText: "A" },
      { originalText: "gamma", suggestedText: "G" },
    ]);

    expect(result).toBe("A beta G");
  });

  it("fails batch apply when any replacement is unsafe", () => {
    expect(() =>
      applyReplacementsSafely("alpha alpha beta", [
        { originalText: "alpha", suggestedText: "A" },
        { originalText: "beta", suggestedText: "B" },
      ]),
    ).toThrow(SuggestionReplacementError);
  });
});
