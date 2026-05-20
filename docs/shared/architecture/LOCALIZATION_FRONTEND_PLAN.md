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
- Shared reusable surfaces have localized fallback copy: analytics cards/charts/tables/progress states, media/video fallback states, skip navigation, setup account, generic progress label, chat redirect fallback, unauthorized access fallback, forgot-password recovery modal, post-login favourite/cart feedback, cart-provider result messages, shared chat workspace defaults, confirmation modal defaults, shared phone/search/password form controls, dashboard sidebar/layout accessibility labels, shared time/read/relative-time formatting, quiz/challenge utility messages, sticky WhatsApp button ARIA, sidebar overlay labels, and student dashboard course-opening toasts.
- Instructor delivery/group-management localization has started with course/student data-load messages, instructor course list, instructor profile feedback, the instructor overview dashboard/mobile summary, instructor analytics workspace, instructor homework queue, create/edit course page shells, shared course builder workflow, internal leaderboard, public certificate download/verification pages, shared ratings/review components, course review/feedback surfaces, delivery course create/edit, offering management dashboard, offering create/edit, course group form, group enrollment, offering enrollment, session generation, group-session setup/homework/attendance/activity/resource workflows, group-session notes/engagement surfaces, localized selection/attendance/activity/resource workspace toasts, and AI workspace dashboard surfaces, including headings, delivery-mode cards, filters, metrics, cards, fields, student picker, delivery notices, weekly schedule controls, statuses, preview states, setup steps, active-language dates, recommendations, charts, and actions.
- Instructor dashboard workspace groups and navigation constants now use translation keys resolved in the dashboard shell instead of hardcoded mixed-language labels.
- Admin analytics overview now reads hero, filter, metric, table, chart, fallback, and load-error copy from translation resources.
- Student dashboard localization has started beyond shell toasts: dashboard shell navigation, workspace labels, header subtitle, access empty state, profile workspace/account/security/notification settings, profile validation, profile load-save toasts, load-error toasts, overview/progress fallbacks, and learning-access state messages now read from translation resources. The overview tab now reads hero, metric, next-action, session, video-progress, homework, learning-format, course-type, date, and fallback copy from translation resources. The courses tab now reads hero, filter, metric, course-card, next-step, quick-access, empty-state, and course-type/mode copy from translation resources. The schedule tab now reads hero, filter, metric, session-card, live-panel, recording, empty-state, and fallback copy from translation resources. The certificates tab now reads status, metric, registry, action, date, fallback, and empty-state copy from translation resources. The progress tab now reads hero, metric, course-card, lesson/quiz status, certificate readiness, session-format, advanced analytics, and empty-state copy from translation resources, and the embedded advanced analytics page now reads filters, metrics, course-progress list, activity feed, charts, workspace context, date fallbacks, and load-error toast copy from translation resources. The instructor chat workflow now reads chat list labels, modal copy, relative time labels, validation toasts, chat/file error fallbacks, and the legacy instructor-chat widget from translation resources. Task submission validation, success, attachment, and fallback error toasts are also localized, and the task workspace now reads status labels, filters, metrics, review/submission summaries, quiz states, draft helpers, attachment preview copy, and empty/unavailable states from translation resources. The resources tab now reads hero, filter, metric, material, recording, activity, preview, and open-error copy from translation resources.

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
2. Browser locale when supported.
3. `ky`.

The selected UI locale should be sent to the backend as `Accept-Language`. Tenant scope remains separate and should continue using tenant/company scope mechanisms only where required.

`company.locale` is a tenant default language setting managed from the main app. It must not decide or change the main app UI language. The tenant learning frontend uses tenant locale as a runtime fallback for tenant-hosted learner/instructor views when the user has not selected a language.

## Implementation Plan

### Phase 1. Contract Alignment

Status: Release-ready for this frontend slice. Locale helper, safe locale persistence, and API `Accept-Language` header injection have been added. Company locale remains tenant settings data and is not used to resolve main app UI language.

Estimated effort: 0.5-1 day.

Tasks:

- Add a locale helper, for example `src/i18n/locale.js`.
- Export `SUPPORTED_LOCALES = ['ky', 'ru', 'en']`.
- Export `DEFAULT_LOCALE = 'ky'`.
- Add `parseSupportedLocale(value)`.
- Add `getStoredLocale()` and `setStoredLocale(locale)` using `edubot_locale`.
- Add `resolveLocale({ browserLocale })`.
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
7. Course/player flows beyond public course details. Started for shared video fallback states, instructor group-management modals, the shared course builder, quiz/challenge playback, and course review/feedback surfaces; deeper review/comment management flows still need coverage.
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

## Localization Backlog

Last reviewed: 2026-05-20.

This backlog turns the current localization review into implementation tasks. Treat these as product-quality issues, not only string replacement work: each task should preserve meaning, role terminology, API contracts, and mobile layout.

### LOC-001. Define and Apply a Product Terminology Glossary

Priority: High.

Status: Complete.

Chosen glossary:

| Concept | Kyrgyz | Russian | English |
| --- | --- | --- | --- |
| student | студент | студент | student |
| instructor | инструктор | инструктор | instructor |
| group | группа | группа | group |
| dashboard | панель | панель | dashboard |
| workspace | иш аймагы | рабочая область | workspace |
| workflow | процесс / агым | процесс | workflow |
| attendance | катышуу | посещаемость | attendance |
| certificate | сертификат | сертификат | certificate |
| offering | курс сунушу | предложение курса | offering |
| delivery course | группа менен өтүүчү курс | курс с группами | delivery course |
| live session | түз эфир сессиясы | сессия в прямом эфире | live session |
| self-paced video course | өз темпиндеги видео курс | видеокурс в своем темпе | self-paced video course |

Progress:

- The initial glossary was chosen for `student`, `instructor`, `group`, and `dashboard`.
- The first high-visibility resource strings were moved toward `студент`, `инструктор`, `группа`, and `панель`.
- Session workspace, groups, and integration copy were moved further toward the selected terms, including replacing `workflow`/`workspace` wording in the affected Kyrgyz/Russian resources with user-facing working-area/process copy.
- The glossary was expanded for `workspace`, `workflow`, `attendance`, `certificate`, `offering`, `delivery course`, `live session`, and `self-paced video course`.
- Kyrgyz/Russian resource values were cleaned up for the remaining mixed developer terms such as `workspace`, `workflow`, `Delivery`, `preview`, `approval`, `enrollment`, `meeting`, `live`, `offline`, `Offering`, `Student #`, `Group #`, and Russian `преподаватель` drift. Interpolation placeholders such as `{{student}}` and `{{group}}` remain unchanged because they are variables, not visible English copy.

Problem:

- Previously, UI copy mixed `student`, `окуучу`, and `студент`; `instructor`, `мугалим`, `преподаватель`, and `инструктор`; `group`, `группа`, and delivery wording; and `dashboard`, `панель`, `кабинет`, and `workspace`.
- Previously, Kyrgyz/Russian strings kept English developer terms such as `dashboard shell`, `workspace`, `Admin override`, `delivery workflow`, `preview`, and `filter`.

Tasks:

- Keep the glossary in this document current when new product concepts become first-class UI terms.
- Keep `src/i18n/locales/ky.js`, `src/i18n/locales/ru.js`, and `src/i18n/locales/en.js` aligned with the glossary.
- Replace internal/developer copy with user-facing product copy before marking any future localized surface complete.

Examples to review:

- Historical examples corrected in the current slice: `EduBot Workspace`, `Жандуу dashboard shell`, `Attendance Workspace`, `Attendance Summary`, `Admin override режими`, mixed `Session workspace`, `Instructor dashboard`, `workflow`, `workspace`, `Delivery`, `preview`, `offering`, and `offline/live` wording.

Acceptance criteria:

- The same concept uses one chosen term per locale across navigation, cards, empty states, toasts, and form labels.
- No translated resource string contains developer-facing terms unless explicitly approved as a product term.
- Kyrgyz and Russian copy reads naturally to a non-technical user.

### LOC-002. Remove Hardcoded Visible Copy from First-Class Routes

Priority: High.

Status: Complete.

Progress:

- Public catalog route now uses translation keys for visible copy, placeholders, pagination labels, course type labels, duration labels, price labels, loading, error, and empty states.
- Course video upload component now uses translation keys for visible copy and validation errors.
- Assistant tenant/company selection state now uses translation keys.
- AI assistant chat panel now uses translation keys for visible copy, placeholders, icon titles/aria labels, delete confirmation, empty state, send state, and chat toasts.
- Legacy attendance table now uses translation keys for overview, statuses, filters, metrics, bulk actions, pagination, and aria labels.
- Shared video player control labels and image alt text now use translation keys.
- Session workspace now uses translation keys for the page shell, filters, metrics, active context, live-session panel, session header, attendance metrics, session notes toasts, session mode labels, and homework submission fallback statuses.
- Instructor groups section now has no scanned hardcoded visible Kyrgyz copy in the updated component path; schedule weekday labels and student fallbacks render through locale resources.
- Integration tab now uses translation keys for hero copy, filters, metrics, quick filters, table headers, empty states, detail modal labels/actions, copy feedback, and CRM/webhook/risk status labels.
- Certificate management localization has started: repeated certificate state helpers, eligibility reason labels, student-card status/action labels, signature pad copy, exact-preview load error, page hero, course/student selection, metric cards, empty course states, filter controls, certificate rule mode, completion requirement settings, certificate template editor controls, certificate registry, student issuing list, pagination, and certificate preview/signature modals now use translation keys.
- Instructor courses dashboard section now uses translation keys for hero copy, metrics, course-card status/type/price labels, actions, empty states, and localized update dates.
- Instructor dashboard page shell now uses translation keys for delivery-course toasts, submit-for-approval error fallbacks, header actions, loading status copy, certificate-disabled notice, and workspace section status.
- Instructor students dashboard section now uses translation keys for hero copy, metrics, course selection cards, course status labels, filters, student cards, certificate status labels, test statuses, empty states, pagination, and active-language dates.
- Instructor profile dashboard section now uses translation keys for profile hero, metrics, edit form labels/actions, bio fallback, expertise empty state, social-link labels, and social empty state.
- Instructor chat tab now uses translation keys and shared API error parsing for chat/message/file toasts, relative times, stats, fallbacks, status labels, empty states, and chat workspace copy.
- Public course review and feedback surfaces now use translation keys for review counts, star labels, aria labels, loading/error/empty states, fallback reviewer names, and active-language review dates.
- Attendance bulk actions now use translation keys for selected-count summaries, quick actions, status buttons, export/notification actions, parent-notification message text, and bulk action toasts.
- Attendance card view and advanced filters now use translation keys for search/status filters, date fallbacks, student empty states, quick filters, reset actions, status labels, and active-language session dates.
- Attendance table view now uses translation keys for load/save feedback, empty and error states, selection summaries, save controls, student/summary headers, status picker labels, aria labels, and active-language session dates.
- Refactored attendance table view now uses translation keys for load/save feedback, empty states, table headers, view-mode controls, selection summaries, save controls, loading overlay text, and active-language session dates.
- Unified attendance table now uses translation keys for load/save feedback, empty states, table headers, status picker labels, view-mode controls, unsaved-change guidance, discard/save actions, aria labels, loading overlay text, and active-language session dates.
- Attendance summary, enhanced summary, virtualized table, and loading-state components now use translation keys for metrics, trend/category/session headings, status labels, empty/error states, progress text, student counts, table headers, session fallbacks, and active-language session dates.
- Attendance shared config, accessibility hook, attendance cell, and error-handling utilities now avoid hardcoded user-facing labels by using translation keys for status labels, ARIA labels, screen-reader announcements, keyboard shortcut help, fallback names, fallback session titles, date fallbacks, and HTTP error messages.
- Instructor certificate management now also localizes certificate preview canvas copy, preview image alt text, default preview names/titles, preview dates by certificate language, and certificate-workspace hook feedback.
- Course builder step navigation, course language options, retry transcode button copy, and transcode status badge labels/actions now use translation keys.
- Course sidebar, article lesson viewer, video previous/next controls, feedback slider controls, and course-builder final preview step now use translation keys for visible and accessibility copy.
- Course article editor toolbar/link prompts/keyboard hint, quiz formatting insert samples, builder lesson status/kind/duration helpers, and file validation errors now use translation resources.
- Course details runtime access-denied fallbacks, quiz result toasts, course-load fallback, AI assistant availability messages, and runtime tab labels now use translation resources.
- Course instructor info cards, challenge player time-limit unit/comments, contact modal email placeholder, course-builder step fallback labels, and skill option fallback now use translation resources or neutral defaults.
- Instructor dashboard navigation constants and workspace group labels/descriptions now use translation keys and are resolved before rendering sidebar, mobile tabs, and the active workspace section.
- Assistant dashboard navigation, shell, overview, student enrollment, course-load cards, pagination, company-load toast, and enrollment confirmation/feedback messages now use translation keys.
- Shared cart-provider result messages, chat workspace fallback labels/ARIA copy, confirmation modal defaults, and shared phone/search/password controls now use translation keys.
- Shared time-formatting helpers, quiz validation, code-challenge defaults/errors, and dashboard sidebar/layout labels now use translation keys.
- Remaining shared utility edge labels now use translation keys, including read-time and relative-time helpers, sticky WhatsApp ARIA, sidebar overlay ARIA, and shared navigation/search console cleanup.
- Student dashboard overview tab and helper fallbacks now use translation keys for visible copy, course-type labels, session dates, cards, empty states, and actions.
- Legacy instructor chat widget now uses translation keys for loading, fallback names/status, empty state, file/image labels, attachment controls, composer, and send action.
- Leaderboard snapshot momentum strings and challenge-action inference keywords now use translation resources, and skill key normalization no longer relies on hardcoded Cyrillic ranges.
- Admin panel helper number and currency formatting now follows the active UI locale and shared admin currency translation.
- Lesson kind constants now store translation keys instead of Kyrgyz labels, and course-builder lesson-kind options resolve those keys at render time.
- Shared support contact config now stores language-neutral translation key references for address and working hours, with footer/contact surfaces resolving localized values.
- Dashboard keyboard search targeting no longer depends on a Kyrgyz placeholder, rating star gradient IDs now normalize any Unicode letter instead of a Cyrillic-only range, and rating comment implementation comments no longer contain mixed-language notes.
- Public marketing FAQ heading now uses the existing localized FAQ namespace instead of a hardcoded English label.
- Focused UI tests now assert translated labels for catalog, legacy attendance, assistant tenant access, and video upload surfaces.

Problem:

- Several major routes still render hardcoded visible Kyrgyz or English strings, so changing language produces mixed-language UI.
- Current scan still finds course-content default section-title literals in `src/features/courses/builder/constants.js`; those are intentional content defaults keyed by course language, with matching specs.

Tasks:

- Replace visible text, placeholders, aria labels, button labels, section titles, empty states, toasts, and status labels with translation keys.
- Add keys to all three locale files.
- Use existing namespace patterns when available; create feature namespaces only where a screen has enough surface area.
- Keep backend machine values, IDs, enum values, route names, and CSS class names untranslated.

High-priority files:

- `src/pages/catalog/Catalog.jsx`
- `src/pages/InstructorDashboard.jsx`
- `src/pages/SessionWorkspace.jsx`
- `src/features/instructor-dashboard/components/CertificatesSection.jsx`
- `src/features/instructor-dashboard/components/GroupsSection.jsx`
- `src/features/instructor-dashboard/components/CoursesSection.jsx`
- `src/features/integration/components/IntegrationTab.jsx`
- `src/features/assistant/components/AiAssistantPanel.jsx`
- `src/features/assistant-dashboard/components/AssistantCompanyState.jsx`
- `src/features/student-dashboard/components/tabs/OverviewTab.jsx`
- `src/features/attendance/components/AttendanceTable.jsx`
- `src/features/attendance/components/AttendanceTableView.jsx`
- `src/features/attendance/components/RefactoredAttendanceTableView.jsx`
- `src/features/attendance/components/AttendanceBulkActions.jsx`
- `src/features/courses/components/CourseReview.jsx`
- `src/features/courses/components/FeedbackSection.jsx`
- `src/features/courses/components/VideoUpload.jsx`
- `src/features/courses/course-details/useCourseDetailsRuntime.js`

Acceptance criteria:

- Switching `ky`, `ru`, and `en` changes all common visible copy on the updated screen.
- No user-visible Kyrgyz/Russian/English literals remain in the updated feature files except brand names, test data, route IDs, or backend content.
- Existing tests pass, and new/updated tests assert at least one translated label for high-risk screens.

### LOC-003. Standardize Error and Toast Localization

Priority: High.

Status: Complete.

Progress:

- Signup now uses the shared API error parser instead of directly reading `error.response.data.message`.
- Course video upload now uses the shared API error parser and localized fallback errors.
- Course quiz/challenge runtime errors now use the shared API error parser with localized fallbacks.
- Instructor group-management API error paths now use the shared API error parser.
- Course API delete/download/upload-url error paths now use localized toasts/errors.
- Attendance update hooks now use localized success/failure toasts and the shared API error parser for update failures.
- Attendance bulk action update/export/notification feedback now uses localized toast copy.
- Attendance table view load/save/no-change feedback now uses localized toast copy.
- Refactored attendance table view load/save/no-change feedback now uses localized toast copy.
- Unified attendance table load/save/no-change feedback now uses localized toast copy.
- Attendance error-handling utility fallback messages now use localized resources.
- Instructor certificate workspace load, settings, regeneration, asset upload, action, and feature-disabled feedback now use localized resources.
- Retry-transcode validation and fallback errors now use localized resources.
- Unknown backend error codes now use the localized fallback instead of leaking raw backend `message` text.
- Instructor group load/create/update, group student load/search/enrollment, and session preview/generation error fallbacks now come from locale resources.
- Integration tab load/detail/copy feedback now uses localized fallback messages.
- Session workspace engagement and notes error fallbacks now use localized resources and shared workspace error status handling.
- AI assistant chat panel create/load/delete/send toasts now use localized fallbacks through the shared API error parser.
- Certificate exact-preview load error now uses a localized resource instead of hardcoded Kyrgyz.
- Public contact and course-contact request flows now use the shared API error parser instead of trusting backend `message`/`error` text.
- Transcoding status polling and retry feedback now use localized fallback messages instead of hardcoded or raw thrown messages.
- Leaderboard fallback metadata now uses the shared API error parser and localized leaderboard fallback copy.
- Course file-upload preparation, file-size, and upload failure paths now throw localized errors, and course-builder upload feedback preserves only explicitly localized thrown errors.
- Course details load failure and admin transcode history details now use the shared API error parser with localized fallbacks.
- Current scans for direct `response.data.message`/`data.message` rendering in production source are clean for the audited patterns. Remaining `error.message` uses are localized local errors or shared display components that render caller-provided messages.

Problem:

- Previously, some feature code displayed `error.response.data.message`, `data.message`, or hardcoded toast strings directly.
- Backend messages may be untranslated, inconsistent, too technical, or not suitable as final UI copy, so frontend code should continue using stable codes and localized fallbacks.

Tasks:

- Use `parseApiError` or a shared localized helper for new backend error surfaces.
- Prefer backend stable error codes where available.
- Add missing error codes to the `errors` namespace as backend contracts grow.
- Keep a safe localized fallback for unknown errors.
- Review success, warning, info, and validation toasts for the same localization standard when adding new features.

Files to review first:

- `src/pages/Signup.jsx`
- `src/features/instructor-dashboard/components/GroupsSection.jsx`
- `src/features/courses/api.js`
- `src/features/courses/components/VideoUpload.jsx`
- `src/features/courses/course-details/useCourseDetailsRuntime.js`

Acceptance criteria:

- Known backend error codes produce localized messages in `ky`, `ru`, and `en`.
- Unknown errors do not leak raw technical copy unless explicitly intended for admin/debug surfaces.
- All high-frequency auth, enrollment, course, attendance, certificate, and quiz/challenge errors have localized fallbacks.

### LOC-004. Localize Enum, Status, and Option Labels Centrally

Priority: High.

Status: Complete.

Progress:

- Public catalog course type labels, duration labels, and price labels now render through translation keys.
- Legacy attendance table status labels and bulk status actions now render through translation keys.
- Shared video player quality fallback and control state labels now render through translation keys.
- Session workspace session modes, session statuses, delivery modes, homework review fallback statuses, and schedule day labels now render through translation keys.
- Integration tab risk severity, risk issue type, enrollment status, access status, and dispatch status labels now render through translation keys while keeping machine values unchanged in filters/payloads.
- Certificate student-card statuses and certificate eligibility reason labels now render through translation keys while preserving backend status/reason machine values.
- Course-builder lesson-kind option metadata now uses centralized translation keys instead of localized literals in shared constants.
- Shared enum-label helpers now centralize course type, delivery mode, certificate status, and page orientation labels under `common.enums`.
- Catalog, instructor course lists, admin course lists, company course assignment, student dashboard course views, session workspace delivery labels, attendance delivery labels, certificate orientation/status labels, and shared video quality fallback labels now use centralized translation keys without changing payload/filter machine values.

Problem:

- Completed. High-frequency enum/status/option labels now resolve from translation resources or shared label helpers.

Tasks:

- Done: centralized frontend-owned display labels in translation resources.
- Done: added shared enum display helpers in `src/shared/i18n/enumLabels.js`.
- Done: replaced duplicated inline label maps in large feature components.
- Done: preserved machine values in payloads and filters.

Examples to review:

- `src/pages/catalog/Catalog.jsx`: price, course type, duration labels.
- `src/pages/SessionWorkspace.jsx`: session status, homework review status, delivery mode labels.
- `src/features/instructor-dashboard/components/CertificatesSection.jsx`: certificate reasons, language options, page orientation options, registry statuses.
- `src/features/integration/components/IntegrationTab.jsx`: CRM, webhook, and risk status labels.
- `src/features/attendance/components/AttendanceTable.jsx`: attendance status filters and metric labels.

Acceptance criteria:

- Enum labels render through translation keys in updated screens.
- Adding or renaming an enum label does not require editing multiple unrelated components.
- Tests or snapshots cover at least one enum/status label in each updated feature area.

### LOC-005. Fix Known Text Quality Issues

Priority: Medium.

Status: Complete.

Progress:

- Language switcher now displays `KY` instead of country code `KG`.
- `AI Assistent` typo was corrected to `AI Assistant`.
- The first dashboard/attendance resource strings were updated away from developer-facing terms such as `dashboard shell`, `Attendance Workspace`, `Attendance Summary`, and `Admin override`.
- Several compact tab labels were expanded in the main dashboard tab resources.
- Known explicit text-quality examples were corrected in production source: `Live сессия`, `Online Live сессия`, `Session workflow`, and `Exact certificate preview`.
- Shared media controls now expose natural localized labels instead of English-only aria/alt text.
- Groups/session/integration resources were reviewed for mixed developer wording in this slice; `workflow`, `workspace`, and mixed `pending enrollment` copy were replaced where touched.
- Remaining explicit text-quality examples were cleaned up: Russian `Live-сессия`, Kyrgyz/Russian `Offline` and `Online Live` course labels, Kyrgyz `Live` metric label, English `Exact preview` certificate messages, `workspace context`, `session workflow`, `tenant shell`, and `operational notes`.
- Kyrgyz/Russian visible `Оффлайн/оффлайн` spelling was normalized to `Офлайн/офлайн`.

Problem:

- Completed for the known backlog examples. Future new surfaces should still be copy-reviewed during localization.

Tasks:

- Done: fixed `AI Assistent` to `AI Assistant` and localized assistant wording in Kyrgyz/Russian.
- Done: replaced the language switcher `KG` label with `KY`.
- Done: reviewed abbreviated tab labels; scanned examples are no longer present as shortened labels in active resources.
- Done: reviewed and corrected the known mixed-language examples.
- Done: removed the known internal wording examples from user-facing resource strings.

Acceptance criteria:

- Known typos are fixed.
- Language selector labels are linguistically correct.
- Compact labels remain understandable with screen-reader labels or full text where space allows.
- Kyrgyz/Russian copy is reviewed as user-facing copy, not literal English translation.

### LOC-006. Split Monolithic Translation Resources by Namespace

Priority: Medium.

Status: Complete.

Progress:

- Split each locale into ownership modules under `src/i18n/locales/{locale}/`.
- Kept the public runtime contract unchanged: resources still merge back into `resources[locale].translation`, and existing translation keys do not need caller changes.
- Current ownership modules: `shared`, `public`, `dashboard`, `admin`, `instructor`, `student`, `courses`, `attendance`, `certificates`, and `integrations`.
- Key parity tests continue to validate the merged locale resource tree across `ky`, `ru`, and `en`.

Problem:

- `src/i18n/locales/en.js`, `src/i18n/locales/ky.js`, and `src/i18n/locales/ru.js` are over 5,700 lines each.
- Large monolithic files make review, ownership, and translator handoff difficult.

Tasks:

- Decide namespace structure: shared/common, public, dashboard, admin, instructor, student, courses, attendance, certificates, integrations.
- Move resources incrementally without changing translation keys used by components unless there is a planned migration.
- Keep key parity tests working across all namespaces.
- Document where new feature keys should be added.

New key placement:

- Shared primitives, global navigation, reusable utility copy, and cross-feature UI helpers: `shared`.
- Public marketing/catalog/auth/course-detail pages under the existing `public.*` key tree: `public`.
- Dashboard shell, dashboard states, assistant dashboard, and shared dashboard UI: `dashboard`.
- Platform admin, analytics, users, AI prompts, contacts, skills, pending courses, admin course/certificate workflows: `admin`.
- Instructor dashboard, homework, chat, course/student/group workspaces: `instructor`.
- Student dashboard workspaces and student-facing learning panels: `student`.
- Course builder/runtime helpers outside `public.courseDetails`: `courses`.
- Attendance, group sessions, and internal leaderboard workflows: `attendance`.
- Shared certificate verification/download and admin certificate management: `certificates`.
- Integration tab and company management surfaces: `integrations`.

Acceptance criteria:

- Locale resources are organized by feature ownership.
- Key parity tests still compare all active namespaces across `ky`, `ru`, and `en`.
- Developers can add localized strings without editing a 5,000+ line file.

### LOC-007. Add Hardcoded String Detection to QA

Priority: Medium.

Status: Complete.

Progress:

- Added `npm run audit:localization`, a dependency-free Node audit that scans production `src/**/*.js(x)` files for hardcoded JSX text, literal UI props, toast literals, direct backend message rendering, missing static `t('...')` keys, and Cyrillic/Kyrgyz source text outside locale resources.
- The audit reports findings without failing by default, and supports `-- --fail-on-findings` when the known backlog is low enough for CI gating.
- Current audit baseline: 0 findings after excluding intentional demo/test/generated/resource surfaces and marking reviewed technical literals with `l10n-audit-ignore`.

Problem:

- Localization regressions are easy to introduce because there is no automated warning for new hardcoded visible strings.

Tasks:

- Add an audit script or lint-like check for JSX text, placeholder/title/aria-label literals, toast literals, and missing static translation keys.
- Allow explicit exceptions for brand names, technical IDs, test files, example/demo files, and backend-provided content.
- Include the audit command in localization QA docs and optionally CI once the known backlog is reduced.
- Current explicit exception: `src/examples/**` contains unused demo snippets and should be excluded from hardcoded-copy counts unless those examples become routable product UI.
- Current explicit exceptions also include locale metadata (`src/i18n/locale.js`) and intentional course-language content defaults (`src/features/courses/builder/constants.js`).
- Use `l10n-audit-ignore` only for reviewed technical literals such as placeholders, IDs, brand marks, and non-translatable protocol examples.

Audit command:

```bash
npm run audit:localization
npm run audit:localization -- --fail-on-findings
```

Acceptance criteria:

- New hardcoded UI strings are caught during review or CI.
- Static translation keys used by production source resolve in the default locale resource tree.
- The audit has documented false-positive rules.
- The scan count is currently 0 for the configured production-source audit.

### LOC-008. Mobile and Layout QA for Long Localized Text

Priority: Medium.

Status: Complete.

Progress:

- Hardened compact mobile dashboard tabs so long localized labels use two-line clamping visually while preserving full `aria-label` and `title` values.
- Hardened dashboard sidebar labels, dashboard header actions, and shared metric cards so longer Kyrgyz/Russian labels can wrap instead of forcing horizontal overflow.
- Added regression coverage for compact dashboard tabs with long labels and overflow-menu items.
- Smoke-tested the release gate across `ky`, `ru`, and `en` resource loading with the full test/build suite.

Problem:

- Kyrgyz and Russian strings can be longer than English or existing compact tab labels.
- Dashboard tabs, cards, filters, and modals are likely overflow points.

Tasks:

- Smoke-test key screens in `ky`, `ru`, and `en` on mobile and desktop.
- Pay special attention to dashboard tabs, sidebars, metric cards, filter bars, modals, certificate settings, attendance tables, and course cards.
- Replace overly abbreviated visible labels with icon tooltips, responsive full labels, or accessible names where needed.

Acceptance criteria:

- Text does not overlap, truncate critical meaning, or overflow controls in common viewports.
- Compact controls have accessible full labels.
- Layout changes preserve usability in all supported locales.

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

The API client and locale helper changes are small and isolated. The main risk is accidentally tying UI language to tenant/company scope. Keep `Accept-Language` separate from `X-Company-Id`, and do not use `company.locale` to resolve main app UI language.

i18n foundation risk: medium-low.

This introduces new dependencies and app-wide initialization, but it can be done without translating every screen immediately.

Full UI localization risk: medium-high.

The work is broad and repetitive. The highest risk areas are missed hardcoded strings, duplicated enum labels, translated text overflowing compact dashboard controls, and inconsistent error handling.

## Open Decisions

- Where should the language switcher live in the main platform UI?
- Should platform admins have a persisted account-level UI language later, separate from local `edubot_locale`?
- Which screens must be fully localized before release, and which can remain fallback English temporarily?
- Should translation files be organized by feature namespace or one common app namespace first?
