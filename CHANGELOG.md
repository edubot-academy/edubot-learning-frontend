# Changelog

## 0.3.1 - 2026-03-22

### Changed
- Student dashboard leaderboard visuals now use an embedded variant aligned with the dashboard shell instead of the public leaderboard styling.
- Student achievement sharing copy now makes it clear when a user is sharing a real achievement versus a public sample card.
- Skills leaderboard now uses the backend `/skills` catalog as the source of truth instead of frontend-injected default skills.

### Fixed
- Fixed mobile clipping and wrapping issues in leaderboard spotlight and student-of-week cards.
- Fixed student dashboard tab syncing so dashboard navigation no longer snaps back to the leaderboard tab.
- Fixed mobile dashboard access by adding a mobile section switcher and clearer dashboard entry points from the header sidebar.
- Fixed homepage “Top learners” to render only the top 3 cards.
- Removed misleading fallback labels like `React Leader` from the homepage leaderboard cards.
- Fixed broken achievement card layout in the student dashboard sidebar column.
- Restricted unauthenticated achievement sharing to public/sample actions only.

## 0.3.0 - 2026-03-21

### Added
- Public leaderboard product surface with clearer Kyrgyz messaging, social proof metrics, value proposition blocks, and stronger CTA placement.
- Student leaderboard hub with personal summary, near-you ranking, challenge rail, skills spotlight, achievements wall, and share-focused interactions.
- Share modal with explicit channels for Telegram, WhatsApp, X, LinkedIn, copy-link, PNG download, and native share fallback.
- Frontend regression tests for leaderboard hub and share experience via Vitest.
- Release notes for leaderboard v2 in `docs/shared/releases/LEADERBOARD_V2_RELEASE_NOTES.md`.

### Changed
- Public leaderboard now avoids authenticated endpoints and only uses public-safe loading flows.
- Kyrgyz copy across leaderboard, skills, achievements, and sharing surfaces was tightened and made more product-oriented.
- Challenge cards now consume backend-provided action metadata instead of relying only on frontend heuristics.
- Skill challenge routing now opens the relevant leaderboard skill context directly.
- Share cards and public share landing flow were refined for clearer UX and better social publishing behavior.

### Fixed
- Removed fabricated leaderboard fallback data from student/public views and replaced it with explicit empty/error states.
- Fixed clipped share modal rendering by moving modal rendering through the shared portal flow.
- Fixed unauthenticated share behavior on public leaderboard surfaces.
- Fixed unstable achievement card CTA layout and mobile wrapping behavior.
