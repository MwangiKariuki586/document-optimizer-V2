import { describe, expect, it } from "vitest";

import {
  estimateHealthScore,
  estimateReadabilityScore,
  estimateSeoScore,
} from "@/components/editor/EditorStatusBar";

describe("EditorStatusBar score estimates", () => {
  it("scores easier prose higher than dense prose", () => {
    const easyText =
      "Clear writing helps readers act. Short sentences make the point easy to follow.";
    const denseText =
      "The implementation systematically operationalizes multidisciplinary responsibilities, cross-functional dependencies, and continuously evolving stakeholder expectations without simplifying the delivery model or clarifying the immediate decision path.";

    expect(estimateReadabilityScore(easyText, 13)).toBeGreaterThan(
      estimateReadabilityScore(denseText, 20),
    );
  });

  it("raises SEO score when structure signals are present", () => {
    const plainText =
      "This document explains the project and the work completed for the team.";
    const structuredText = [
      "PROJECT OVERVIEW",
      "This document explains the project and the work completed for the team.",
      "- Improved delivery quality",
      "- Reduced review time",
      "https://example.com",
    ].join("\n");

    expect(estimateSeoScore(structuredText, 24)).toBeGreaterThan(
      estimateSeoScore(plainText, 12),
    );
  });

  it("lowers health when unresolved suggestions remain", () => {
    const cleanHealth = estimateHealthScore({
      fidelityStatus: "Original Preserved",
      readabilityScore: 82,
      seoScore: 76,
      pendingSuggestionCount: 0,
      appliedSuggestionCount: 3,
    });
    const pendingHealth = estimateHealthScore({
      fidelityStatus: "Original Preserved",
      readabilityScore: 82,
      seoScore: 76,
      pendingSuggestionCount: 5,
      appliedSuggestionCount: 0,
    });

    expect(cleanHealth).toBeGreaterThan(pendingHealth);
  });
});
