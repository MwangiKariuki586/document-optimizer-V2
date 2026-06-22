# Design QA: Compact document creation workspace

- Source visual truth: user-provided Upload File and Paste Text screenshots in the active conversation
- Implementation target: `/documents/new`
- Implementation screenshot: unavailable; the in-app browser connection could not be established
- Intended viewport: standard desktop/laptop viewport
- State: Upload File and Paste Text tabs before submission

## Full-view comparison evidence

Blocked. The source screenshots show the primary Choose File and Create Document actions falling below the initial viewport, but a rendered implementation screenshot could not be captured from the required in-app browser.

## Focused region comparison evidence

Blocked. The intended focus regions are the upload dropzone and the paste textarea/action area.

## Findings

- [P1] Above-the-fold action visibility has not been visually confirmed
  - Location: `/documents/new` creation card.
  - Evidence: implementation screenshot is unavailable.
  - Impact: viewport-specific layout interactions may still hide a primary action at some laptop heights.
  - Fix: capture both tabs at a standard laptop viewport and confirm Choose File and Create Document are visible without scrolling.

## Required fidelity surfaces

- Fonts and typography: unchanged from the existing implementation; rendered wrapping remains unverified.
- Spacing and layout rhythm: viewport stretch was removed and compact height baselines were introduced; rendered action visibility remains unverified.
- Colors and visual tokens: unchanged project tokens; rendered contrast remains unverified.
- Image quality and asset fidelity: no raster image assets are required; existing Lucide interface icons remain unchanged.
- Copy and content: all existing labels, validation, helper copy, and actions are preserved.

## Patches made

- Removed the viewport-height minimum from the page grid.
- Reduced UploadTabs from a 420px to a 400px minimum baseline.
- Removed UploadTabs' minimum height entirely and top-aligned the page grid so the guidance rail cannot stretch the creation card.
- Reduced the upload dropzone minimum from 260px to 240px and tightened vertical padding.
- Changed the paste textarea from viewport flex-fill to a 176px vertically resizable field.
- Updated the route loading skeleton to match the compact geometry.

## Implementation checklist

- Capture Upload File and Paste Text at the same laptop viewport as the reference.
- Confirm both primary actions are visible without scrolling.
- Check mobile stacking and textarea resize behavior.
- Correct any remaining P0/P1/P2 differences and repeat the comparison.

final result: blocked
