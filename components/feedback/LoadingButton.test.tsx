import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { LoadingButton } from "@/components/feedback/LoadingButton";

function renderMarkup(markup: string): {
  button: HTMLButtonElement;
  container: HTMLDivElement;
} {
  const container = document.createElement("div");
  container.innerHTML = markup;

  const button = container.querySelector("button");

  if (!button) {
    throw new Error("Expected LoadingButton to render a button");
  }

  return { button, container };
}

describe("LoadingButton", () => {
  it("renders loading state accessibly", () => {
    const markup = renderToStaticMarkup(
      <LoadingButton isLoading loadingText="Saving">
        Save
      </LoadingButton>,
    );
    const { button, container } = renderMarkup(markup);
    const status = container.querySelector('[role="status"]');

    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(button.disabled).toBe(true);
    expect(status?.getAttribute("aria-label")).toBe("Loading");
    expect(markup).toContain("Saving");
  });

  it("renders interactive content when not loading", () => {
    const markup = renderToStaticMarkup(<LoadingButton>Save</LoadingButton>);
    const { button } = renderMarkup(markup);

    expect(button.getAttribute("aria-busy")).toBe("false");
    expect(button.disabled).toBe(false);
    expect(markup).toContain("Save");
  });
});
