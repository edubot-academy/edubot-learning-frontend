# Frontend structure

The app now follows a feature-first layout with shared utilities and alias paths:

- `src/features/*` – domain modules (courses, ratings, enrollments, assistant, marketing, dashboard, auth, etc.). Each holds its own components and API client slices.
- `src/shared/api/client.js` – axios instance/interceptors; `src/services/api.js` re-exports feature API modules.
- `src/shared/ui` – cross-cutting UI (Header, Footer, PrivateRoute, VideoPlayer, PhoneInput, UI/\*, CoursesSection).
- `src/app` – app shell/routes/layouts/providers (`app/providers` wraps AuthProvider).
- `src/assets` / `src/constants` / `src/utils` – shared assets and helpers.

Aliases (vite/jsconfig):

- `@app` → `src/app`
- `@shared` → `src/shared`
- `@features` → `src/features`
- `@shared-ui` → `src/shared/ui`
- `@pages` → `src/pages`
- `@utils` → `src/utils`
- `@assets` → `src/assets`
- `@services` → `src/services`

Use these aliases for imports instead of deep relative paths. Run `npm run build` (or `npm run dev` for local) to sanity-check after changes.

## Formatting

Prettier config is checked in (`.prettierrc.json`) to keep formatting consistent across devs:

- single quotes, trailing commas (es5), tab width 4, semicolons, print width 100.
- run `npx prettier .` before committing if your editor is not auto-formatting.

## Release docs

- Current frontend version: `0.3.1`
- Changelog: `CHANGELOG.md`
- Leaderboard release notes: `docs/shared/releases/LEADERBOARD_V2_RELEASE_NOTES.md`
- Shared contracts: `docs/shared/contracts/`
