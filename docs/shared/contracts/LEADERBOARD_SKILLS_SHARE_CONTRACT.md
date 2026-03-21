# Leaderboard, Skills, and Share Contract

Last updated: 2026-03-21

## Purpose

This document defines the current contract between LMS frontend and LMS backend for:

- student leaderboard experience
- internal leaderboard access
- achievement/challenge cards
- public achievement sharing
- skill ranking vs personal skill progress

This is the source of truth for product semantics. It exists to avoid drift between:

- leaderboard ranking data
- personal progress data
- public share URLs
- internal/admin-facing leaderboard access

## Core product rules

### 1. Ranking and progress are not the same thing

There are now **two different skill concepts** in LMS:

- `skill ranking`
  - competitive view
  - based on `xp_skill_aggregates`
  - used for leaderboard rows
  - answers: "who is strongest in this skill right now?"

- `personal skill progress`
  - mastery/progress view
  - based on `user_skill_progress`
  - used for "Менин skill прогрессим"
  - answers: "how far has this student progressed in this skill?"

Frontend must not present these as if they are the same metric.

### 2. Internal leaderboard is staff-only

`/leaderboard/internal` and `/leaderboard/internal/*` are for:

- `admin`
- `assistant`
- `instructor`

Students must not use internal leaderboard routes.

### 3. Public share links should use backend canonical preview URLs

When frontend creates an achievement share, it should prefer backend `publicUrl` over building a raw SPA route manually.

Reason:

- backend `publicUrl` serves crawler-friendly HTML with OG/Twitter metadata
- that URL can unfurl better in social apps
- real users are redirected to the frontend achievement page

## Backend endpoints

## Public student-facing leaderboard

### `GET /leaderboard/weekly`
Query params:

- `page`
- `limit`
- `track=all|video|live`

Use for:

- weekly top students
- student-facing leaderboard ranking

### `GET /leaderboard/fast-progress`
Query params:

- `page`
- `limit`

Use for:

- fast progress board

Important:

- this is currently **global only**
- it is **not track-aware** because backend aggregation does not yet include course/track dimension in `lesson_activity`

### `GET /leaderboard/student-of-week`
Query params:

- `track=all|video|live`

### `GET /leaderboard/homepage`
Query params:

- `track=all|video|live`

## Authenticated student leaderboard endpoints

### `GET /leaderboard/me`
Auth required: yes

Query params:

- `window=weekly|monthly|allTime`
- `track=all|video|live`

Purpose:

- personal leaderboard summary

Returns fields such as:

- `rank`
- `previousRank`
- `rankDelta`
- `xp`
- `windowXp`
- `streakDays`
- `percentile`
- `strongestSkill`
- `nextTarget`

`strongestSkill` is ranking-oriented and comes from `xp_skill_aggregates`.

### `GET /leaderboard/near-me`
Auth required: yes

Query params:

- `window=weekly|monthly|allTime`
- `limit`
- `track=all|video|live`

Purpose:

- students around the current user in the ranking

### `GET /leaderboard/achievements`
Auth required: yes

Query params:

- `window=weekly|monthly|allTime`
- `track=all|video|live`

Purpose:

- derived achievement cards used by leaderboard/dashboard motivation UI

### `GET /leaderboard/challenges`
Auth required: yes

Query params:

- `window=weekly|monthly|allTime`
- `track=all|video|live`

Purpose:

- derived short-term challenge cards used by leaderboard/dashboard motivation UI

## Internal leaderboard endpoints

All internal leaderboard endpoints now require:

- `JwtAuthGuard`
- `RolesGuard`
- role in `admin | assistant | instructor`

### `GET /leaderboard/internal/weekly`
### `GET /leaderboard/internal/course/:courseId`
### `GET /leaderboard/internal/student-of-week`
### `GET /leaderboard/internal/homepage`

Use these only in staff/admin experiences.

## Skills endpoints

### `GET /skills`
Auth required: yes

Purpose:

- skill catalog
- names/slugs/metadata for skills

### `GET /skills/me/progress`
Auth required: yes

Purpose:

- personal skill mastery/progress view
- source for student-facing "Менин skill прогрессим"

Returned fields:

- `id`
- `skillId`
- `slug`
- `name`
- `description`
- `icon`
- `completedLessons`
- `totalLessons`
- `progressPercent`
- `xp`
- `lastActivityAt`

Important:

- this endpoint is **not a ranking endpoint**
- frontend should treat it as personal progress only

## Skill ranking endpoint

### `GET /leaderboard/skills/:skillSlug`
Purpose:

- top students in a skill

Current ranking source:

- `xp_skill_aggregates`

Returned leaderboard rows may include:

- `studentId`
- `xp`
- `progressPercent`
- `lessonsCompleted`
- `quizzesPassed`
- `lastActivityAt`
- profile fields after backend profile attachment

Important semantic note:

- `progressPercent` here is part of the ranking aggregate and tie-breaking context
- it should not be presented as the same thing as personal mastery from `/skills/me/progress`

## Share contract

### `POST /leaderboard/share`
Auth required: yes

Request body:

- `title`
- `text`
- `rarity`
- `footer`
- optional share meta like:
  - `displayName`
  - `trackLabel`
  - `rank`
  - `xp`
  - `streakDays`

Response:

- `token`
- `payload`
- `publicUrl`
- `appUrl`

Frontend rule:

- prefer `publicUrl` for social sharing
- use `appUrl` only for direct app navigation when needed

### `GET /leaderboard/share/:token`
Purpose:

- JSON payload for frontend share page

### `GET /leaderboard/share/public/:token`
Purpose:

- backend-rendered HTML page with OG/Twitter metadata
- crawler-friendly public share preview
- redirects real users to frontend share page

## Frontend mapping rules

### Student leaderboard page/dashboard

Use:

- `/leaderboard/weekly`
- `/leaderboard/fast-progress`
- `/leaderboard/student-of-week`
- `/leaderboard/me`
- `/leaderboard/near-me`
- `/leaderboard/achievements`
- `/leaderboard/challenges`
- `/skills/me/progress`
- `/leaderboard/skills/:skillSlug`

### Skills tab layout rule

Frontend should show:

- personal progress block first
  - data from `/skills/me/progress`
- ranking blocks second
  - data from `/leaderboard/skills/:skillSlug`

This separation is intentional and should be preserved.

### Sharing rule

Frontend should:

- create share via `POST /leaderboard/share`
- use `publicUrl` for Telegram/WhatsApp/X/LinkedIn/native sharing
- keep downloaded PNG as attachment/fallback asset

## Known limits

### 1. Fast progress is not track-aware

Reason:

- backend `lesson_activity` lacks course/track dimension

Needed later:

- add `courseId` or `courseType` to the aggregation path
- or add a new aggregate dedicated to track-aware fast-progress

### 2. Achievements and challenges are still derived

Current state:

- leaderboard achievements/challenges are computed dynamically from summary state
- they are not yet full persisted product entities with catalog/history tables

This is acceptable for current product behavior, but it is not the final extensible architecture.

### 3. Share preview quality depends on deployment config

Backend should have:

- `FRONTEND_URL`

Without it, public share preview pages may redirect to the backend origin fallback instead of the real frontend origin.

## Recommended future work

1. Add a formal typed API DTO doc for leaderboard responses.
2. Make `fast-progress` track-aware by extending backend aggregation schema.
3. If achievements/challenges become larger product features, promote them into persisted domain models.
4. Add a single API spec page that distinguishes:
   - ranking metrics
   - mastery/progress metrics
   - engagement/share metrics
