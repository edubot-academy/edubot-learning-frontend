# Main Frontend Localization Plan

Last updated: 2026-05-20.

This plan defines the localization work needed in the main EduBot Learning frontend.

- Main platform frontend: this repository
- Tenant learning frontend: `../edubot-learning-tenant-fe`
- Shared backend: `../backend`

The goal is to align this frontend with the shared localization contract used by the backend and tenant frontend, then localize UI copy incrementally without mixing tenant scope, content language, and UI language.

## Scope

In scope:

- Shared supported locale contract: `ky`, `ru`, `en`.
- Default UI locale: `ky`.
- User-selected UI language stored in `localStorage` key `edubot_locale`.
- `Accept-Language` sent on API requests.
- Company and tenant default locale editing with supported values only.
- Frontend translation of navigation, labels, buttons, form hints, toasts, empty states, validation messages, enum labels, and backend error codes.

Out of scope:

- Backend-generated certificate/PDF/export copy.
- Backend email, WhatsApp, or Telegram template selection.
- Course `languageCode`, except where UI needs to display or edit course content language.
- Auth token storage changes. Main frontend auth storage should remain separate from the tenant frontend.

## Current Frontend State

Already present:

- API client is centralized in `src/shared/api/client.js`.
- Company locale values are already surfaced in platform admin screens.
- Tenant/company-scoped calls are already separate from UI language concerns.
- The app has Vitest available for frontend tests.

Partially addressed:

- A shared frontend locale helper exists for supported locales, default locale, parsing, persistence, and display labels.
- `src/shared/api/client.js` sends `Accept-Language`.
- Company locale create/edit controls in platform admin screens use supported values instead of free text.
- `i18next` and `react-i18next` are installed and initialized with baseline `ky`, `ru`, and `en` resources.
- The main header and mobile drawer have a language switcher and localized navigation/search labels.
- Public-facing pages are localized for the first release slice: home, courses, course details, about, contact, login, and signup.
- API error parsing now prefers stable backend error codes for known high-frequency errors while preserving backend message fallback.
- Admin/company management surfaces have been expanded beyond locale controls: company list/detail/settings/members/courses, platform tenant detail, admin shell, admin stats, users, companies, contacts, AI prompts, skills, pending courses, courses/categories/enrollment/transcode, certificate admin actions, and notification center/widget now read common UI copy from translation resources.
- Shared reusable surfaces have localized fallback copy: analytics cards/charts/tables/progress states, media/video fallback states, skip navigation, setup account, generic progress label, chat redirect fallback, unauthorized access fallback, forgot-password recovery modal, post-login favourite/cart feedback, and student dashboard course-opening toasts.
- Instructor delivery/group-management localization has started with course/student data-load messages, instructor course list, instructor profile feedback, the instructor overview dashboard/mobile summary, instructor analytics workspace, instructor homework queue, create/edit course page shells, shared course builder workflow, internal leaderboard, public certificate download/verification pages, shared ratings/review components, delivery course create/edit, offering management dashboard, offering create/edit, course group form, group enrollment, offering enrollment, session generation, group-session setup/homework/attendance/activity/resource workflows, group-session notes/engagement surfaces, localized selection/attendance/activity/resource workspace toasts, and AI workspace dashboard surfaces, including headings, delivery-mode cards, filters, metrics, cards, fields, student picker, delivery notices, weekly schedule controls, statuses, preview states, setup steps, active-language dates, recommendations, charts, and actions.
- Admin analytics overview now reads hero, filter, metric, table, chart, fallback, and load-error copy from translation resources.
- Student dashboard localization has started beyond shell toasts: dashboard shell navigation, workspace labels, header subtitle, access empty state, profile workspace/account/security/notification settings, profile validation, profile load-save toasts, load-error toasts, overview/progress fallbacks, and learning-access state messages now read from translation resources. The courses tab now reads hero, filter, metric, course-card, next-step, quick-access, empty-state, and course-type/mode copy from translation resources. The schedule tab now reads hero, filter, metric, session-card, live-panel, recording, empty-state, and fallback copy from translation resources. The certificates tab now reads status, metric, registry, action, date, fallback, and empty-state copy from translation resources. The progress tab now reads hero, metric, course-card, lesson/quiz status, certificate readiness, session-format, advanced analytics, and empty-state copy from translation resources, and the embedded advanced analytics page now reads filters, metrics, course-progress list, activity feed, charts, workspace context, date fallbacks, and load-error toast copy from translation resources. The instructor chat workflow now reads chat list labels, modal copy, relative time labels, validation toasts, and chat/file error fallbacks from translation resources. Task submission validation, success, attachment, and fallback error toasts are also localized, and the task workspace now reads status labels, filters, metrics, review/submission summaries, quiz states, draft helpers, attachment preview copy, and empty/unavailable states from translation resources. The resources tab now reads hero, filter, metric, material, recording, activity, preview, and open-error copy from translation resources.

Remaining gaps:

- Error handling still needs broader adoption in feature-specific toast paths, especially remaining instructor certificate/reporting and lower-traffic admin flows.
- Dashboard/admin/internal localization is partially complete, but large surfaces still have hardcoded strings outside the current completed slice.
- Translation key parity tests exist for current resources; they need to scale as feature namespaces are added.

## Locale Contract

Supported locales:

- `ky`: Kyrgyz, default and primary product language.
- `ru`: Russian.
- `en`: English.

Frontend canonical locale values must always be the short codes above. Regional browser values should be normalized before use.

Examples:

- `ky-KG` -> `ky`
- `ru-RU` -> `ru`
- `en-US` -> `en`
- unsupported, missing, or malformed values -> `ky`

UI locale resolution order:

1. User-selected `localStorage.edubot_locale`.
2. Active tenant/company locale when available.
3. Browser locale when supported.
4. `ky`.

The selected UI locale should be sent to the backend as `Accept-Language`. Tenant scope remains separate and should continue using tenant/company scope mechanisms only where required.

## Implementation Plan

### Phase 1. Contract Alignment

Status: Release-ready for this frontend slice. Locale helper, safe locale persistence, and API `Accept-Language` header injection have been added. Remaining work is wiring tenant/company locale into initial app-level resolution when that context is globally available.

Estimated effort: 0.5-1 day.

Tasks:

- Add a locale helper, for example `src/i18n/locale.js`.
- Export `SUPPORTED_LOCALES = ['ky', 'ru', 'en']`.
- Export `DEFAULT_LOCALE = 'ky'`.
- Add `parseSupportedLocale(value)`.
- Add `getStoredLocale()` and `setStoredLocale(locale)` using `edubot_locale`.
- Add `resolveLocale({ tenantLocale, browserLocale })`.
- Add `Accept-Language` to `src/shared/api/client.js` request interceptor.
- Preserve existing auth token and CSRF behavior.

Acceptance criteria:

- API requests include `Accept-Language` with `ky`, `ru`, or `en`.
- Invalid stored locales fall back to `ky`.
- Backend tenant/company scope is not inferred from UI language.

### Phase 2. Company Locale Admin UX

Status: Release-ready for the current admin surfaces. Platform tenant detail and admin tenant registry now use supported-value locale selects for create/edit flows. Remaining work is adding broader component-level coverage if these admin surfaces gain tests.

Estimated effort: 0.5 day.

Tasks:

- Replace free-text locale inputs with a select, segmented control, or radio-style control using the three supported values.
- Update platform tenant detail locale editing.
- Update admin companies tab locale editing.
- Show readable labels while still submitting short codes.
- Add focused tests or interaction coverage if the surrounding components already have tests.

Acceptance criteria:

- Admins cannot submit unsupported company locale values through normal UI.
- Existing company locale values render consistently.
- Payload shape remains `{ locale: 'ky' | 'ru' | 'en' }`.

### Phase 3. i18n Foundation

Status: Release-ready for the current public-page slice. `i18next` and `react-i18next` are installed, app initialization is wired, baseline translation resources exist, key parity is tested, and desktop/mobile language switchers are available. Remaining work is deciding the long-term namespace strategy and expanding translated surfaces feature by feature.

Estimated effort: 1-2 days.

Tasks:

- Add `i18next` and `react-i18next`.
- Add i18n initialization, for example `src/i18n/index.js`.
- Add base translation namespaces or files for `ky`, `ru`, and `en`.
- Add a provider/init import at the app entry point.
- Add a language switcher in the appropriate authenticated shell or settings surface.
- Keep `edubot_locale` as the persistence key.
- Add tests for locale resolution and translation key parity.

Acceptance criteria:

- App boots with `ky` by default.
- User-selected locale survives reloads.
- Translation files have matching keys across supported locales.
- The API client reflects the current UI locale.

### Phase 4. Error Code Translation

Status: Partially complete. Shared API error parsing now extracts stable codes, maps the first high-frequency backend codes to localized messages, and uses the localized generic fallback. CSRF retry detection prefers `CSRF_TOKEN_INVALID` while preserving the old message fallback. Several admin, company, certificate, category, user, enrollment, and transcode paths now call `parseApiError`. Remaining work is replacing feature-specific direct `error.response.data.message` usage with the shared helper.

Estimated effort: 1 day for high-frequency errors; ongoing for full coverage.

Tasks:

- Add a small error translation helper that prefers `error.response.data.code`.
- Keep fallback to backend `message`.
- Replace CSRF retry detection with the backend error code when available.
- Translate common auth, tenant/company, course, lesson, AI, notification, enrollment, and certificate codes as they surface in UI flows.

Acceptance criteria:

- Known backend error codes produce localized user-facing messages.
- Unknown errors still show a reasonable fallback.
- Existing CSRF retry behavior continues to work.

### Phase 5. Incremental UI Copy Localization

Status: Partially complete. The public-facing release slice is localized: homepage, courses, course details, about, contact, login, signup, header navigation, desktop user menu, and mobile drawer. Admin/company localization has also advanced through company pages, platform tenant detail, admin shell, admin stats/users/companies/contacts/AI prompts/skills/pending courses, admin courses/categories/enrollment/transcode, certificate admin toasts, and notification center/widget. Shared analytics, media/video fallback states, skip navigation, setup account, and generic progress copy are localized. Remaining dashboard/internal feature screens can be localized incrementally.

Estimated effort: several days to 1-2+ weeks depending on depth.

Recommended order:

1. Auth/login/onboarding surfaces. Done for login/signup.
2. App shell navigation and shared UI. Done for header, user menu, mobile drawer, and language switcher.
3. Public marketing and catalog pages. Done for home, courses, course details, about, and contact.
4. Platform admin tenant/company settings. Mostly done for current company and tenant-management surfaces.
5. Admin operations. Partially done for stats, users, companies, contacts, AI prompts, skills, pending courses, courses/categories/enrollment/transcode, certificates, and notifications.
6. Student dashboard and learning flows. Started for shell navigation/workspace labels, profile workspace/settings/toasts, load-error/access-state messaging, course-opening toasts, courses tab UI, schedule tab UI, certificates tab UI, progress tab UI, advanced analytics page, instructor chat, task submission/toast and task workspace UI, and resources tab UI; remaining student tabs and deeper learning-flow copy still need coverage.
7. Course/player flows beyond public course details. Started for shared video fallback states, instructor group-management modals, the shared course builder, and quiz/challenge playback; review/comment flows still need coverage.
8. Attendance, certificates, and reporting. Session attendance and public certificate download/verification pages are partly done; instructor certificate/reporting surfaces still need coverage.
9. Remaining low-traffic admin and edge-case screens.

Tasks:

- Replace hardcoded visible copy with translation keys.
- Centralize enum/status labels in frontend-owned translation maps.
- Localize form validation and toast messages.
- Check long Kyrgyz/Russian strings for layout overflow.
- Keep backend machine values untranslated in data contracts.

Acceptance criteria:

- No major first-class route has mixed-language UI for common workflows.
- Enum/status display labels are translated in frontend code.
- Layout remains readable at desktop and mobile sizes for all supported locales.

## Testing Plan

Unit tests:

- Locale parsing and fallback behavior.
- `edubot_locale` persistence behavior.
- API `Accept-Language` header behavior.
- Translation key parity across `ky`, `ru`, and `en`.
- Error-code-to-message mapping.

Manual QA:

- Switch locale and reload.
- Log in and verify API requests include `Accept-Language`.
- Edit company locale as `ky`, `ru`, and `en`.
- Verify invalid company locale cannot be submitted from UI.
- Trigger common backend errors and verify localized messages.
- Check mobile layout with longer Russian and Kyrgyz strings.

## Release Readiness

Current release slice status: ready for manual smoke QA.

Completed checks:

- `npm run lint`
- `npm test -- --run src/i18n/resources.spec.js src/i18n/locale.spec.js src/shared/utils/navigation.spec.js src/shared/api/client.spec.js src/shared/api/error.spec.js`
- `git diff --check`
- `npm run build`

Recommended smoke QA before deploy:

- Switch `KG`, `RU`, and `EN` from desktop header and mobile drawer.
- Reload after language change and confirm the selected language persists.
- Verify `Accept-Language` on an API request.
- Visit homepage, courses, course details, about, contact, login, and signup in all three languages.
- Check desktop user menu and mobile drawer labels in all three languages.
- Submit invalid contact/signup/login forms and verify localized validation messages.
- Visit company list/detail/settings/members/courses and platform tenant detail in all three languages.
- Visit admin stats, users, companies, contacts, AI prompts, skills, pending courses, courses, certificates, and notifications in all three languages.
- Trigger common admin course/category/enrollment/transcode/certificate API errors and verify localized fallback behavior.
- Check shared analytics empty/loading/error states, setup account, video fallback states, and skip navigation labels.

Known release caveats:

- Admin/internal dashboard localization is incomplete. Remaining high-volume gaps include instructor certificate/reporting surfaces and instructor dashboard sections/modals beyond the completed overview/analytics/admin-analytics/homework-queue/group/offering/session-setup/homework/activity/resource/notes/engagement/leaderboard/course-builder/attendance surfaces.
- Translation files are still monolithic and should be split by namespace later.
- Build currently reports the existing large main chunk warning.

## Risk Assessment

Contract alignment risk: low.

The API client and locale helper changes are small and isolated. The main risk is accidentally tying UI language to tenant/company scope. Keep `Accept-Language` separate from `X-Company-Id`.

i18n foundation risk: medium-low.

This introduces new dependencies and app-wide initialization, but it can be done without translating every screen immediately.

Full UI localization risk: medium-high.

The work is broad and repetitive. The highest risk areas are missed hardcoded strings, duplicated enum labels, translated text overflowing compact dashboard controls, and inconsistent error handling.

## Open Decisions

- Where should the language switcher live in the main platform UI?
- Should platform admins be able to set their own UI language separately from company default locale?
- Should `activeTenant.locale` or selected company locale be available globally enough to participate in initial locale resolution?
- Which screens must be fully localized before release, and which can remain fallback English temporarily?
- Should translation files be organized by feature namespace or one common app namespace first?
