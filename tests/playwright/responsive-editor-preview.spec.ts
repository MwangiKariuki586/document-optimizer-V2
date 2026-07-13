import { expect, test } from "@playwright/test";

const editorUrl = process.env.PLAYWRIGHT_EDITOR_URL;
const previewUrl = process.env.PLAYWRIGHT_PREVIEW_URL;

const viewports = [
  { name: "mobile", width: 360, height: 800 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "compact-desktop", width: 1024, height: 768 },
  { name: "wide-desktop", width: 1440, height: 900 },
] as const;

async function expectNoPageOverflow(page: import("@playwright/test").Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBe(0);
}

test.describe("responsive editor", () => {
  test.skip(!editorUrl, "Set PLAYWRIGHT_EDITOR_URL to an authenticated document editor URL.");

  for (const viewport of viewports) {
    test(`${viewport.name} contains the editor workflow`, async ({ page }, testInfo) => {
      await page.setViewportSize(viewport);
      await page.goto(editorUrl!);

      await expectNoPageOverflow(page);
      await expect(page.getByLabel("Document title")).toBeVisible();
      await expect(page.getByRole("button", { name: /Save|Saved/ }).first()).toBeVisible();

      if (viewport.width < 1280) {
        const trigger = page.getByRole("button", { name: "Open AI assistant" });
        await expect(trigger).toBeVisible();
        await trigger.click();
        await expect(page.getByRole("dialog", { name: "AI Assistant" })).toBeVisible();
        await page.getByRole("button", { name: /Translate Document/ }).first().click();
        await expect(page.getByRole("button", { name: /^Translate Document$/ })).toBeVisible();
        await page.keyboard.press("Escape");
        await expect(page.getByRole("dialog", { name: "AI Assistant" })).toBeHidden();
        await expect(trigger).toBeFocused();
      } else {
        await expect(page.getByRole("heading", { name: "AI Actions" })).toBeVisible();
      }

      await page.screenshot({ path: testInfo.outputPath(`editor-${viewport.name}.png`) });
    });
  }
});

test.describe("responsive result preview", () => {
  test.skip(!previewUrl, "Set PLAYWRIGHT_PREVIEW_URL to an authenticated result preview URL.");

  for (const viewport of viewports) {
    test(`${viewport.name} keeps review and actions reachable`, async ({ page }, testInfo) => {
      await page.setViewportSize(viewport);
      await page.goto(previewUrl!);

      await expectNoPageOverflow(page);
      await expect(page.getByRole("heading", { name: /Result|Preview|Review/ }).first()).toBeVisible();
      await expect(page.getByRole("link", { name: "Return to Editor" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Export" })).toBeVisible();
      await expect(page.getByRole("button", { name: /Apply to Document/ })).toHaveCount(0);
      await expect(page.getByRole("button", { name: /Copy Result|Copy Translation/ })).toHaveCount(0);
      const proposedScroller = page
        .getByRole("region", { name: "Proposed result content" });
      await expect(proposedScroller).toHaveCSS("overflow-y", "scroll");

      const verticalOverflow = await page.evaluate(
        () => document.documentElement.scrollHeight - document.documentElement.clientHeight,
      );
      expect(verticalOverflow).toBeLessThanOrEqual(1);

      if (viewport.width < 1024) {
        const proposedTab = page.getByRole("tab", { name: "proposed" });
        await expect(proposedTab).toHaveAttribute("aria-selected", "true");
        await page.getByRole("tab", { name: "current" }).click();
        await expect(page.getByRole("heading", { name: "Current document" })).toBeVisible();
      } else {
        await expect(page.getByRole("heading", { name: "Current document" })).toBeVisible();
        await expect(page.getByRole("heading", { name: "Proposed result" })).toBeVisible();
      }

      await page.screenshot({ path: testInfo.outputPath(`preview-${viewport.name}.png`) });
    });
  }
});
