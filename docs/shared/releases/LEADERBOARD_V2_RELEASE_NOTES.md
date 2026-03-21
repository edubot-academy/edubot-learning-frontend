# Leaderboard V2 Release Notes

## Version
- Frontend: `0.3.0`
- Release date: `2026-03-21`

## Scope
This release completes the current leaderboard redesign phase for the LMS frontend.

## Included in this release

### Public leaderboard
- Public-facing leaderboard layout is now separated from the student dashboard mental model.
- Hero section, social proof metrics, spotlight section, and join CTAs were redesigned.
- Public leaderboard does not call authenticated student-only endpoints anymore.
- Public content is now consistently localized in Kyrgyz.

### Student leaderboard
- Personal summary now emphasizes rank, momentum, XP, streak, and next-step guidance.
- Near-you ranking highlights the closest competitors and the XP gap to pass them.
- Challenge cards now provide clearer action-oriented guidance.
- Skill spotlight cards now combine leaderboard leadership with the student's own progress.
- Skill-focused deep links can open the relevant leaderboard skill context.

### Sharing
- Achievement sharing now supports:
  - Telegram
  - WhatsApp
  - X
  - LinkedIn
  - copy link
  - PNG download
  - native share fallback
- Public share pages and branded share-card downloads are supported.
- Share UI received stronger loading, feedback, and motion polish.

### Reliability
- Mock leaderboard fallback content was removed from student/public experiences.
- Empty states and service-warning states now communicate real system status.
- Public leaderboard avoids unauthorized API calls.

### Contract alignment
- Frontend is aligned with backend support for:
  - `GET /leaderboard/me`
  - `GET /leaderboard/near-me`
  - `GET /leaderboard/achievements`
  - `GET /leaderboard/challenges`
- Challenge cards support backend action metadata (`actionKind`, `actionPath`, `actionLabel`).

## Validation
- `npm test`
- `npm run build`

## Still out of scope
The following items remain future backlog and are not blockers for this release:
- track-aware fast-progress aggregation
- persistent achievements/challenges entities
- backend share analytics event persistence
