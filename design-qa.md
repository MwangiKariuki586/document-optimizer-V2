# Design QA: Account utility rail

- Source visual truth: user-provided account settings rail screenshot in the active conversation
- Implementation target: `components/usage/AccountUsageWorkspace.tsx` on `/account`
- Implementation screenshot: unavailable; the in-app browser connection could not be established
- Intended viewport: desktop account page with a 320px utility rail
- State: authenticated account with Clerk profile and session data

## Full-view comparison evidence

Blocked. The source screenshot is available in the conversation, but a rendered `/account` screenshot could not be captured from the required in-app browser. No visual-match claim can be made from code inspection alone.

## Focused region comparison evidence

Blocked for the same reason. The intended focus region is the complete right utility rail containing profile, account controls, storage management, data/privacy, and session/access cards.

## Findings

- [P1] Rendered layout has not been visually compared
  - Location: `/account` right utility rail.
  - Evidence: implementation screenshot is unavailable.
  - Impact: spacing, density, card height, typography, and sticky behavior may still differ from the reference.
  - Fix: capture `/account` at the desktop viewport and compare the 320px rail against the supplied screenshot.

## Required fidelity surfaces

- Fonts and typography: code uses existing project typography tokens; rendered weight, line height, and truncation remain unverified.
- Spacing and layout rhythm: five-card structure and compact padding are implemented; rendered vertical rhythm remains unverified.
- Colors and visual tokens: implementation uses existing accent, border, surface, text, success, and error tokens; rendered contrast remains unverified.
- Image quality and asset fidelity: no custom imagery is required; profile initials and Lucide icons use existing product patterns. Rendered icon scale remains unverified.
- Copy and content: reference card structure is implemented with live profile, storage, provider, and last-sign-in values plus MVP-safe account-management copy.

## Patches made

- Replaced the previous account utility content with five reference-matched cards.
- Added Clerk-backed provider, last-sign-in, and sign-out behavior.
- Added active navigation for uploaded files and allowlisted Coming Soon destinations for inactive settings.
- Replaced Clerk-supported account links with the working Clerk user-profile modal and removed every unprioritized Coming Soon action from the rail.
- Updated the account loading rail to five placeholder cards.

## Implementation checklist

- Capture the authenticated `/account` route in the in-app browser.
- Compare the same rail width and desktop state with the source screenshot.
- Correct any P0/P1/P2 spacing, typography, color, or responsive mismatches.
- Repeat capture until the final result can be marked passed.

final result: blocked
