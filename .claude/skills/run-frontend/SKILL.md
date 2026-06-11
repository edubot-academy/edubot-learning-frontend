---
name: run-frontend
description: Run, start, build, screenshot, or test the edubot-learning frontend React app. Use when asked to verify a UI change, take a screenshot, launch the app, or confirm something renders correctly.
---

This is a React 19 + Vite 6 SPA. Drive it headlessly with Chrome — no custom driver needed. The dev server serves on port 5173 (or next free port). API calls go to `http://localhost:3000` by default; the app degrades gracefully (shows empty lists) when the API is not running.

## Prerequisites

- Node.js 18+, npm
- macOS: Google Chrome at `/Applications/Google Chrome.app`
- No backend required to render pages (courses page shows API data, auth-gated pages redirect to `/login`)

## Build / install

```bash
cd /Users/bektenorunbaev/Documents/projects/edubot-learning/frontend
npm install          # only needed once after cloning
```

## Run (agent path) — Chrome headless screenshot

Start the dev server in the background, wait for it, then screenshot with Chrome headless:

```bash
# 1. Start dev server (prints the actual port — capture it)
npm run dev -- --port 5173 &
sleep 3
# Discover the actual port (5173 or next free)
PORT=$(curl -s http://localhost:5173 >/dev/null 2>&1 && echo 5173 || \
       curl -s http://localhost:5174 >/dev/null 2>&1 && echo 5174 || echo 5173)

# 2. Screenshot a page
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CHROME" \
  --headless=new \
  --disable-gpu \
  --screenshot="/tmp/edubot-screenshot.png" \
  --window-size=1280,900 \
  --virtual-time-budget=3000 \
  "http://localhost:${PORT}/courses"
```

Key routes confirmed working headlessly:

| Route | What it shows |
|---|---|
| `/` | Marketing home — hero, feature list, stats |
| `/courses` | Course catalog (cards with prices, ratings) |
| `/login` | Login form |
| `/signup` | Signup form |
| `/about` | About page |

Screenshots land at whatever `--screenshot=` path you give.

## Run (human path)

```bash
npm run dev
# Opens at http://localhost:5173 (or next free port — check terminal output)
```

Press Ctrl-C to stop.

## Test

```bash
npm test          # vitest run — 25 files, 102 tests, ~5s
npm run test:watch  # interactive watch mode
```

## Gotchas

- **Port collision**: If 5173 is taken, Vite silently picks 5174, 5175, etc. Always read the terminal output line `Local: http://localhost:XXXX` to find the actual port.
- **`--virtual-time-budget`**: Without this flag Chrome headless exits before React finishes rendering. 3000ms is sufficient for static pages; API-dependent content (course cards) may need 5000ms if the backend is running.
- **API not running**: The app renders without a backend. Courses page shows cards from the staging API at `https://api.staging.learning.edubot.it.com` if `VITE_REACT_APP_ENV=staging` is set, or shows empty/loading states with the default localhost config.
- **i18n**: Default language is Kyrgyz (`ky`). The `lang` attribute on `<html>` is `ky`. UI text may appear in Kyrgyz or Russian depending on the user's stored locale.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Screenshot is blank / white | Increase `--virtual-time-budget` to 5000 |
| `Port 5173 is in use` in npm output | Read the actual port from terminal; Vite auto-increments |
| Chrome crashes with `--headless=new` | Try `--headless=old` (Chrome 111 fallback) |
| `ENOENT node_modules` | Run `npm install` first |
