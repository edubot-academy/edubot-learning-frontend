# Changelog

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
