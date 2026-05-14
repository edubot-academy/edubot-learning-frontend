# Page-by-Page UX/UI Audit

## Purpose

This document is the working source of truth for UX/UI and frontend audits across public and authenticated pages.

Use it to:

- track audits page by page
- convert findings into implementation tasks
- keep severity, ownership, and status visible
- standardize what "audited" means before moving to the next page

## Audit Status Legend

- `Not started`: page has not been reviewed yet
- `In progress`: page audit is underway
- `Audited`: findings documented, tasks created
- `Fixing`: implementation is in progress
- `Re-audit needed`: changes landed and page should be reviewed again
- `Done`: issues resolved and page re-checked

## Severity Legend

- `P0`: critical usability/accessibility breakage
- `P1`: high-impact UX, UI, accessibility, responsiveness, or behavioral issue
- `P2`: medium issue, inconsistency, or technical debt with visible product impact
- `P3`: polish issue or low-risk cleanup

## Prioritized Roadmap

### P1 Now

These items should be tackled first because they either affect many surfaces at once, block safe iteration, or fix direct correctness/accessibility problems.

1. Fix shared navigation and dialog semantics.
   Scope:
    - `src/features/dashboard/components/DashboardSidebar.jsx`
    - `src/components/ui/dashboard/DashboardTabs.jsx`
    - `src/shared/ui/BasicModal.jsx`
    - `src/shared/ui/ConfirmationModal.jsx`
      Reason:
    - These primitives affect a large portion of the app.
    - Their current semantics and interaction models are inconsistent.

2. Stabilize the public shell.
   Scope:
    - `src/shared/Header.jsx`
    - `src/shared/Footer.jsx`
    - `src/app/layouts/MainLayout.jsx`
      Reason:
    - Public pages repeat the same shell-level accessibility and navigation problems.

3. Refactor oversized operational controllers.
   Scope:
    - `StudentDashboard.jsx`
    - `InstructorDashboard.jsx`
    - `AdminPanel.jsx`
    - `SessionWorkspace.jsx`
    - `Attendance.jsx`
    - `useCourseBuilder.js`
      Reason:
    - These are the largest complexity hotspots and currently slow down UX improvement.

4. Clarify ambiguous workflow ownership.
   Scope:
    - `/cart`
    - `/chat`
    - create/edit course approval flow
    - company workspace route strategy
    - analytics standalone vs embedded strategy
      Reason:
    - Some workflows are implemented, but the product model behind them is still unclear.

5. Fix direct correctness and accessibility bugs already identified.
   Scope examples:
    - `StudentAnalytics.jsx` undefined `navigate()`
    - course-detail review state bug captured in the audit
    - password visibility non-button behavior
    - nested interactive card patterns
      Reason:
    - These are low-ambiguity fixes with immediate payoff.

### P2 Next

These should follow once the shared foundation and route/workspace ownership are clearer.

1. Redesign the main discovery and conversion surfaces.
   Scope:
    - `/`
    - `/courses`
    - `/courses/:id`
    - `/favourites`
    - `/catalog`

2. Rework account, auth, and onboarding flows.
   Scope:
    - `/login`
    - `/register`
    - `/setup-account`
    - `/profile`
    - `/unauthorized`

3. Improve operational queue and management surfaces.
   Scope:
    - `/instructor/courses`
    - `InstructorHomework.jsx`
    - company members/settings/courses flows
    - assistant enrollment workspace

4. Unify async, empty, error, and confirmation patterns.
   Scope:
    - loaders
    - empty states
    - destructive confirmations
    - route-level loading/error handling across public and internal surfaces

5. Clean up localization and terminology system-wide.
   Scope:
    - mixed Kyrgyz/Russian/English copy in builder flows, company tools, auth, leaderboard/trust pages, and shared components

### P3 Later

These are valuable once the system is structurally stable.

1. Deep visual polish and narrative refinement.
   Scope:
    - About
    - Contact
    - marketing sections
    - leaderboard share
    - certificate verification

2. Scalability upgrades for large lists and tables.
   Scope:
    - pagination improvements
    - richer filtering/sorting
    - result metadata improvements
    - high-volume workspace states

3. Advanced preview, personalization, and motivational UX.
   Scope:
    - instructor public-profile preview
    - course publish-readiness and preview systems
    - saved items / leaderboard / progress refinements

4. Cleanup and consolidation of stale or duplicate page-like files.
   Scope:
    - standalone analytics files
    - embedded-vs-routed duplicates
    - thin wrappers with unclear canonical ownership

### Recommended Execution Batches

#### Batch 1: Foundation

- shared nav semantics
- modal/confirmation foundation
- public shell semantics
- direct correctness bugs

#### Batch 2: Architecture

- dashboard/controller decomposition
- session workspace and attendance decomposition
- course builder decomposition
- canonical route/workspace ownership decisions

#### Batch 3: Core User Journeys

- home/catalog/course browsing
- auth/onboarding/profile
- cart and favourites

#### Batch 4: Operational Workspaces

- instructor course management
- assistant workspace
- company workspace
- homework and analytics consolidation

#### Batch 5: Brand and Trust

- about/contact polish
- leaderboard public storytelling
- share pages
- certificate verification

### Success Criteria

- Shared primitives behave consistently across public and authenticated surfaces.
- Large operational pages are decomposed enough to iterate safely.
- Discovery, auth, and conversion flows have clear product logic.
- Embedded and standalone workspaces no longer drift from one another.
- Localization, loading states, and confirmation patterns feel like one product.

## Required Audit Scope Per Page

Each page audit should cover:

- information hierarchy and visual clarity
- layout structure and responsive behavior
- accessibility semantics, keyboard flow, focus states, and motion safety
- loading, empty, error, and fallback states
- CTA clarity and interaction consistency
- content quality, localization, and trust signals
- component reuse, maintainability, and frontend implementation risks

## Standard Task Format

Use this format for every issue:

| ID          | Severity | Area          | Issue                                      | Task                                                                        | Owner | Status  |
| ----------- | -------- | ------------- | ------------------------------------------ | --------------------------------------------------------------------------- | ----- | ------- |
| EXAMPLE-001 | P1       | Accessibility | Missing main landmark on public page shell | Add semantic `main` wrapper and stable `id="main-content"` for public pages | TBD   | Example |

## Audit Queue

| Page                     | Route                              | Type                              | Status  | Notes                                                              |
| ------------------------ | ---------------------------------- | --------------------------------- | ------- | ------------------------------------------------------------------ |
| Home                     | `/`                                | Public marketing                  | Audited | Initial baseline audit completed                                   |
| Courses                  | `/courses`                         | Public catalog                    | Audited | Initial catalog audit completed                                    |
| Course Details           | `/courses/:id`                     | Public / conversion               | Audited | Initial course detail audit completed                              |
| About                    | `/about`                           | Public marketing                  | Audited | Initial about-page audit completed                                 |
| Contact                  | `/contact`                         | Public marketing / lead gen       | Audited | Initial contact-page audit completed                               |
| Login                    | `/login`                           | Auth                              | Audited | Initial login-page audit completed                                 |
| Register                 | `/register`                        | Auth                              | Audited | Initial signup-page audit completed                                |
| Student Dashboard        | `/student`                         | Authenticated app                 | Audited | Initial student-dashboard audit completed                          |
| Instructor Dashboard     | `/instructor`                      | Authenticated app                 | Audited | Initial instructor-dashboard audit completed                       |
| Admin                    | `/admin`                           | Authenticated app                 | Audited | Initial admin-dashboard audit completed                            |
| Setup Account            | `/setup-account`                   | Auth / onboarding                 | Audited | Initial setup-account audit completed                              |
| Profile                  | `/profile`                         | Authenticated app                 | Audited | Initial profile-page audit completed                               |
| Unauthorized             | `/unauthorized`                    | System / access control           | Audited | Initial unauthorized-page audit completed                          |
| Favourites               | `/favourites`                      | Authenticated app / conversion    | Audited | Initial favourites-page audit completed                            |
| Cart                     | `/cart`                            | Authenticated app / conversion    | Audited | Initial cart-page audit completed                                  |
| Instructor Course Create | `/instructor/course/create`        | Authenticated app / creation flow | Audited | Initial create-course audit completed                              |
| Instructor Courses       | `/instructor/courses`              | Authenticated app / management    | Audited | Initial instructor-courses audit completed                         |
| Instructor Course Edit   | `/instructor/courses/edit/:id`     | Authenticated app / editing flow  | Audited | Initial edit-course audit completed                                |
| Assistant                | `/assistant`                       | Authenticated app                 | Audited | Initial assistant-dashboard audit completed                        |
| Catalog                  | `/catalog`                         | Public or hybrid catalog          | Audited | Initial catalog-page audit completed                               |
| Companies                | `/companies`                       | Public or hybrid listing          | Audited | Initial companies-list audit completed                             |
| Company Detail           | `/companies/:id`                   | Public or hybrid detail           | Audited | Initial company-detail audit completed                             |
| Company Courses          | `/companies/:id/courses`           | Public or hybrid catalog          | Audited | Initial company-courses audit completed                            |
| Chat Redirect            | `/chat`                            | Utility / redirect                | Audited | Initial chat-redirect audit completed                              |
| Leaderboard              | `/leaderboard`                     | Public or hybrid engagement       | Audited | Initial public-leaderboard audit completed                         |
| Leaderboard Share        | `/share/achievement/:token`        | Legacy redirect                   | Removed | Share page/API removed; legacy URL redirects to public leaderboard |
| Certificate Download     | `/certificates/:publicId/download` | Authenticated utility / download  | Audited | Added during repo-verification pass                                |
| Certificate Verification | `/certificates/:publicId/verify`   | Public trust / verification       | Audited | Initial certificate-verification audit completed                   |
| Internal Leaderboard     | `/leaderboard/internal`            | Authenticated app                 | Audited | Initial internal-leaderboard audit completed                       |

---

## Repo Verification Snapshot

Verified against `src/app/routes.jsx` and the current source tree on 2026-05-10.

### Confirmed True

- The audit queue matches the routed public/authenticated pages except for `CertificateDownload`, which has now been added.
- `/dashboard`, `/student/analytics`, `/instructor/sessions`, `/instructor/analytics`, `/instructor/homework`, and `/admin/analytics` are redirect/alias routes, not independent page experiences.
- `StudentAnalytics.jsx` navigation wiring issue was fixed on 2026-05-12 by adding `useNavigate`.
- `MainLayout.jsx` now wraps page content in `main#main-content` as of 2026-05-12.
- `Header.jsx` primary navigation now renders inside a labeled `nav` as of 2026-05-12.
- `Footer.jsx` external destinations now use semantic anchors as of 2026-05-12.
- `CardCourse.jsx` no longer wraps internal action buttons inside a full-card `Link` as of 2026-05-12; pointer users can still click non-action card areas to open the course, while keyboard users get explicit image/title links and separate action buttons.
- `Courses.jsx` is scoped to public video courses only as of 2026-05-12. It now has sort, result summary, loading skeleton, empty state, and retryable error handling, and no longer duplicates the global search or uses the marketing `SectionContainer` wrapper for the catalog grid.
- `CourseDetails.jsx` still imports `CourseHeader` without rendering it.
- `Attendance.jsx` and `SessionWorkspace.jsx` remain the largest page-like controller files and should stay high in the refactor queue.

### Corrected Or Clarified

- `FeedbackSection.jsx` does receive `rightContent` and passes it to `FeedbackSlider` as `arrows`; the stale finding was clarified to focus on header placement and semantic arrow controls rather than claiming the controls are not rendered at all.
- `CompanyMembers.jsx` and `CompanySettings.jsx` are not direct routes, but they are embedded tabs inside `CompanyDetail.jsx`; they should be audited as part of the company-detail workspace, not treated as unreachable stale files.
- `CompanyCourses.jsx` is both a direct route at `/companies/:id/courses` and an embedded tab inside `CompanyDetail.jsx`, so it carries real duplicate-context drift risk.

### Still Missing From The Audit

- A full visual/browser verification pass is still needed. This document has been checked against code structure and obvious implementation claims, not against rendered screenshots across breakpoints.
- The audit still needs deeper component-level coverage for certificate management inside `CertificatesSection.jsx`, including the exact preview iframe behavior that recently regressed in production.
- The audit should eventually split "public catalog" and "company workspace" route strategy more clearly because `/catalog`, `/companies`, `/companies/:id`, and `/companies/:id/courses` currently overlap in product purpose.

## Remaining File Inventory

### Routed aliases or redirects already covered indirectly

- `/dashboard` -> alias to `StudentDashboard`
- `/student/analytics` -> redirects to `/student?tab=progress`
- `/instructor/sessions` -> redirects to `/instructor?tab=sessions`
- `/instructor/analytics` -> redirects to `/instructor?tab=analytics`
- `/instructor/homework` -> redirects to `/instructor?tab=homework`
- `/admin/analytics` -> redirects to `/admin?tab=analytics`

These do not need standalone UX/UI audits unless they diverge from their target dashboard behavior.

### Page-like files not currently routed directly

- `src/pages/Attendance.jsx`
- `src/pages/SessionWorkspace.jsx`
- `src/pages/InstructorAnalytics.jsx`
- `src/pages/InstructorHomework.jsx`
- `src/pages/StudentAnalytics.jsx`
- `src/pages/AdminAnalytics.jsx`
- `src/features/assistant-dashboard/pages/AssistantDashboard.jsx`

These should be triaged separately as one of:

- embedded operational surfaces that deserve component-level audits inside parent pages
- future routes that need standalone page audits once exposed
- stale files that should be consolidated or removed

### Embedded company-detail tabs

- `src/pages/company/CompanyMembers.jsx`
- `src/pages/company/CompanySettings.jsx`

These are not directly routed, but they are active company-detail tab surfaces and should be audited inside the `Company Detail` workspace.

### Suggested next audit order

1. `Setup Account`, `Profile`, `Cart`, `Favourites`
2. `Instructor Course Create`, `Instructor Courses`, `Instructor Course Edit`
3. `Leaderboard`, `Leaderboard Share`, `Certificate Verification`
4. `Catalog`, `Companies`, `Company Detail`, `Company Courses`
5. `Assistant`, `Internal Leaderboard`, `Unauthorized`, `Chat Redirect`

---

## Home Page Audit

### Page Summary

- Route: `/`
- Source: `src/pages/Home.jsx`
- Related components:
    - `src/features/marketing/components/HeroStart.jsx`
    - `src/shared/ui/StickyButton.jsx`
    - `src/features/marketing/components/Benefits.jsx`
    - `src/features/courses/components/TopCourses.jsx`
    - `src/features/leaderboard/components/TopLearnersHome.jsx`
    - `src/features/ratings/components/TopInstructors.jsx`
    - `src/features/marketing/components/Apply.jsx`
    - `src/features/marketing/components/Feedback.jsx`
    - `src/features/marketing/components/FAQ.jsx`
    - `src/shared/Header.jsx`
    - `src/shared/Footer.jsx`
    - `src/app/layouts/MainLayout.jsx`

### Audit Summary

The Home page has strong content volume and a workable section sequence, but it currently behaves more like a stack of independently-designed blocks than a cohesive landing page system. The highest-impact issues are in accessibility semantics, motion handling, responsive discipline, and inconsistent async-state UX.

### Detailed Tasks

| ID       | Severity | Area                      | Issue                                                                                             | Task                                                                                                                                                                                | Owner | Status |
| -------- | -------- | ------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ------ |
| HOME-001 | P1       | Accessibility             | Public layout does not expose a semantic `main` landmark                                          | Update `src/app/layouts/MainLayout.jsx` to wrap page content in a semantic `main` container with `id="main-content"` and ensure public pages support skip-navigation targeting      | Codex | Done   |
| HOME-002 | P1       | Accessibility             | Header navigation is visually present but not exposed as a semantic navigation landmark           | Refactor `src/shared/Header.jsx` so primary public navigation is rendered inside a semantic `nav` with a clear accessible label                                                     | Codex | Done   |
| HOME-003 | P1       | Accessibility / Motion    | Hero carousel auto-rotates without pause controls or reduced-motion handling                      | Refactor `HeroStart.jsx` to support pause/play, manual navigation, and `prefers-reduced-motion`; stop auto-rotation when reduced motion is requested                                | Codex | Done   |
| HOME-004 | P1       | Accessibility             | Hidden hero slides may remain in the accessibility tree                                           | Rework hero slide rendering so inactive slides are removed from interactive flow or explicitly hidden with correct ARIA/state handling                                              | Codex | Done   |
| HOME-005 | P1       | Conversion UX             | Hero CTA pattern is inconsistent across slides, and slide 3 lacks a clear primary action          | Standardize hero CTA behavior across all slides and define one primary conversion action plus one secondary support action                                                          | Codex | Done   |
| HOME-006 | P1       | Responsive UI             | Hero relies on fixed heights and absolute-positioned overlays that are brittle on smaller screens | Rebuild hero layout with content-driven sizing, safer breakpoints, and reduced dependence on fixed pixel heights and decorative absolute positioning                                | Codex | Done   |
| HOME-007 | P2       | Visual hierarchy          | Home sections do not fully share a unified spacing, heading, and rhythm system                    | Define homepage section spacing and heading rules, then normalize `Benefits`, `TopCourses`, `TopLearnersHome`, `TopInstructors`, `Apply`, `Feedback`, and `FAQ` against that system | Codex | Done   |
| HOME-008 | P1       | Interaction UX            | Floating WhatsApp CTA is visually intrusive and continuously animated                             | Replace the current sticky CTA with a less disruptive pattern, add an `aria-label`, support reduced motion, and avoid transform animation conflicts                                 | Codex | Done   |
| HOME-009 | P2       | Accessibility / Semantics | Benefits icons use empty alt values without clarifying whether they are decorative                | Confirm decorative intent and keep them hidden from assistive tech, or provide meaningful labels if they carry content value                                                        | Codex | Done   |
| HOME-010 | P1       | Responsive UI             | Apply section uses rigid widths/heights and offset artwork that can break on mobile/tablet        | Rebuild `Apply.jsx` with fluid width constraints, content-based height, and safer image placement                                                                                   | Codex | Done   |
| HOME-011 | P2       | Content quality           | Footer uses router `Link` for external destinations                                               | Replace external `Link` usage in `src/shared/Footer.jsx` with semantic anchors using correct external-link behavior                                                                 | Codex | Done   |
| HOME-012 | P2       | Reliability / Privacy     | Footer QR code depends on an external third-party image generation service                        | Replace the runtime QR service with a verified local QR PNG and keep a direct link fallback                                                                                         | Codex | Done   |
| HOME-013 | P2       | Async states              | Top courses section has no explicit loading or structured error state on the Home page            | Add loading and error handling for `fetchTopCourses()` and pass structured state into `TopCourses`/`SectionContainer`                                                               | Codex | Done   |
| HOME-014 | P2       | Async states              | Top instructors returns a raw text error block that breaks the page’s visual quality              | Replace the raw error output in `TopInstructors.jsx` with a styled inline state matching the rest of the marketing page                                                             | Codex | Done   |
| HOME-015 | P2       | Async states              | Feedback section silently disappears when no data is returned                                     | Add loading, empty, and error states to `FeedbackSection.jsx` so the section fails gracefully and predictably                                                                       | Codex | Done   |
| HOME-016 | P2       | Accessibility             | FAQ accordion is visually functional but lacks explicit accordion semantics                       | Add `aria-expanded`, `aria-controls`, stable panel ids, and button-to-panel relationships in `FAQ.jsx`                                                                              | Codex | Done   |
| HOME-017 | P2       | Localization / Content    | Home page mixes language tone, capitalization styles, and marketing voice between sections        | Review homepage copy for consistent Kyrgyz localization, capitalization, and CTA wording                                                                                            | Codex | Done   |
| HOME-018 | P3       | Technical quality         | Home page data fetching is split across sections with inconsistent patterns                       | Standardize marketing-section data fetching patterns and state contracts to reduce repeated ad hoc logic                                                                            | Codex | Done   |

### Component Audit Breakdown

#### `Home.jsx`

| ID        | Severity | Area         | Issue                                                                                       | Task                                                                                                                                                                | Owner | Status |
| --------- | -------- | ------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ------ |
| HOME-C001 | P2       | Composition  | The page is assembled as a simple section stack without a stronger homepage layout contract | Introduce a clearer homepage composition contract for section spacing, background transitions, and container widths so sections stop behaving like unrelated blocks | Codex | Done   |
| HOME-C002 | P2       | Async states | `Home.jsx` fetches top courses but does not manage loading or error UI at the page level    | Add explicit loading and error state for top-courses fetch and pass those states into the section instead of relying on empty fallback rendering                    | Codex | Done   |

#### `HeroStart.jsx`

| ID        | Severity | Area                   | Issue                                                                            | Task                                                                                                          | Owner | Status |
| --------- | -------- | ---------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ----- | ------ |
| HOME-C003 | P1       | Accessibility / Motion | Auto-advancing carousel lacks pause/play controls and reduced-motion support     | Add pause/play controls, manual next/previous navigation, and `prefers-reduced-motion` behavior               | Codex | Done   |
| HOME-C004 | P1       | Accessibility          | Inactive slides remain mounted and may remain discoverable by assistive tech     | Remove inactive slides from the interactive tree or mark them hidden with correct semantics and focus control | Codex | Done   |
| HOME-C005 | P1       | Responsive UI          | Fixed heights and absolute stat cards make the hero brittle on mobile and tablet | Rebuild the hero with fluid vertical sizing and simplify decorative overlays so content drives height         | Codex | Done   |
| HOME-C006 | P1       | Conversion UX          | Slide 3 breaks the CTA model established by slides 1 and 2                       | Standardize CTA structure and content hierarchy across all hero slides                                        | Codex | Done   |
| HOME-C007 | P2       | Content                | Hero typography tone and capitalization vary sharply between slides              | Normalize hero messaging style, capitalization, and sentence rhythm so the carousel feels like one campaign   | Codex | Done   |

#### `StickyButton.jsx`

| ID        | Severity | Area             | Issue                                                                                                 | Task                                                                                                      | Owner | Status |
| --------- | -------- | ---------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ----- | ------ |
| HOME-C008 | P1       | Interaction UX   | Floating WhatsApp button is visually intrusive and permanently rotating                               | Replace with a calmer sticky help/contact pattern and reduce animation intensity                          | Codex | Done   |
| HOME-C009 | P1       | Accessibility    | The CTA lacks an explicit accessible label and reduced-motion handling                                | Add `aria-label`, visible/focus states, and disable motion for reduced-motion users                       | Codex | Done   |
| HOME-C010 | P2       | Frontend quality | Transform-based rotation conflicts conceptually with Tailwind translate centering on the same element | Refactor animation implementation so positioning and motion are not competing on the same transform stack | Codex | Done   |

#### `Benefits.jsx`

| ID        | Severity | Area          | Issue                                                                                      | Task                                                                                                      | Owner | Status |
| --------- | -------- | ------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- | ----- | ------ |
| HOME-C011 | P2       | Visual system | Benefits section is serviceable but visually generic relative to the rest of the homepage  | Redesign benefit cards with stronger hierarchy, more distinctive spacing, and clearer value communication | Codex | Done   |
| HOME-C012 | P2       | Accessibility | Decorative icons use empty alt text but decorative intent is implicit rather than explicit | Mark decorative icons consistently and verify they are ignored by assistive technology                    | Codex | Done   |
| HOME-C013 | P3       | Content       | Benefit descriptions have inconsistent capitalization and tone                             | Normalize copy style and make the benefits read as polished product claims                                | Codex | Done   |

#### `TopCourses.jsx` and `SectionContainer.jsx`

| ID        | Severity | Area             | Issue                                                                                                                                                                       | Task                                                                                                              | Owner | Status |
| --------- | -------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----- | ------ |
| HOME-C014 | P2       | Async states     | Top courses can collapse into a generic empty message because the shared container does not distinguish loading, empty, and error states well enough for marketing surfaces | Extend `SectionContainer.jsx` to support richer marketing-grade loading, empty, and error variants                | Codex | Done   |
| HOME-C015 | P2       | Visual hierarchy | Shared section container enforces a generic look that reduces section individuality                                                                                         | Add controlled variants for section headers and support richer section-level layout without copy-pasting wrappers | Codex | Done   |
| HOME-C016 | P3       | Conversion UX    | The “view all” action only appears when there are at least three courses, which makes the section CTA dependent on API count rather than user need                          | Revisit CTA visibility logic so catalog exploration stays available even when fewer items are returned            | Codex | Done   |

#### `CardCourse.jsx`

| ID        | Severity | Area                      | Issue                                                                                                                          | Task                                                                                                                     | Owner | Status |
| --------- | -------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ | ----- | ------ |
| HOME-C017 | P1       | Accessibility / Semantics | Interactive controls are nested inside a card that is itself wrapped by a `Link`, creating invalid nested interactive behavior | Refactor the course card so the card and its internal actions have valid, separate interaction targets                   | Codex | Done   |
| HOME-C018 | P2       | Responsive UI             | Course meta chips and footer actions can become cramped in narrower card widths                                                | Rework chip wrapping and footer layout so metadata and CTA remain readable on small widths                               | Codex | Done   |
| HOME-C019 | P2       | Content clarity           | Mixed purchase states like `LMSте сатып алынбайт`, `Себетте`, and price messaging need clearer product framing                 | Review card messaging for course types, availability, and CTA wording so users understand what can actually be purchased | Codex | Done   |
| HOME-C020 | P3       | Technical quality         | The component contains dead debugging code and duplicated payload-shaping logic                                                | Remove the empty `useEffect`, reduce duplication in course payload building, and tighten the component API               | Codex | Done   |

#### `TopLearnersHome.jsx`

| ID        | Severity | Area            | Issue                                                                                                                 | Task                                                                                         | Owner | Status |
| --------- | -------- | --------------- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ----- | ------ |
| HOME-C021 | P2       | Trust / Content | Badges and labels mix English and emoji-heavy gamification with Kyrgyz copy                                           | Localize badge language and reduce novelty styling where it weakens credibility              | Codex | Done   |
| HOME-C022 | P2       | Data UX         | Fallback and empty states are clearer here than in other sections, but their visual system is not shared elsewhere    | Extract a reusable pattern for homepage inline status states so sections fail consistently   | Codex | Done   |
| HOME-C023 | P3       | Visual cohesion | This section looks more polished than neighboring sections, increasing the “assembled from different systems” feeling | Use this section as a reference and normalize adjacent sections toward a common polish level | Codex | Done   |

#### `TopInstructors.jsx` and `CardInstrictor.jsx`

| ID        | Severity | Area              | Issue                                                                                     | Task                                                                                                            | Owner | Status |
| --------- | -------- | ----------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ----- | ------ |
| HOME-C024 | P2       | Async states      | Instructors section falls back to a plain text error string that breaks the page visually | Replace raw error text with a styled inline state consistent with homepage sections                             | Codex | Done   |
| HOME-C025 | P2       | Content hierarchy | Instructor cards are visually flat and do not surface why a given instructor is “top”     | Add clearer proof points such as specialty, rating summary, student count meaning, or outcome-oriented metadata | Codex | Done   |
| HOME-C026 | P2       | Responsive UI     | Instructor image height is fixed at `h-96`, which can produce oversized and uneven cards  | Use a more controlled media ratio so cards feel balanced across breakpoints                                     | Codex | Done   |
| HOME-C027 | P3       | Technical quality | `CardInstrictor.jsx` prop definitions and displayed fields are slightly inconsistent      | Align prop types with actual rendered fields and clean up naming/shape inconsistencies                          | Codex | Done   |

#### `Apply.jsx`

| ID        | Severity | Area             | Issue                                                                                                                | Task                                                                                                               | Owner | Status |
| --------- | -------- | ---------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ----- | ------ |
| HOME-C028 | P1       | Responsive UI    | Apply block uses rigid width, height, and decorative positioning that can break on smaller screens                   | Rebuild the section around fluid layout constraints and content-led spacing                                        | Codex | Done   |
| HOME-C029 | P2       | Conversion UX    | The section repeats the same CTA from the hero without adding a stronger reason to convert at this point in the page | Rework the section copy so it provides a distinct late-page conversion argument instead of repeating hero language | Codex | Done   |
| HOME-C030 | P3       | Visual hierarchy | The artwork and floating logo feel disconnected from the card content                                                | Redesign the composition so illustration, brand mark, and CTA belong to one coherent visual frame                  | Codex | Done   |

#### `Feedback.jsx` and `FeedbackSection.jsx`

| ID        | Severity | Area                 | Issue                                                                                                                                                                                  | Task                                                                                                                                                    | Owner | Status |
| --------- | -------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ------ |
| HOME-C031 | P1       | Accessibility        | Feedback navigation uses clickable images rather than semantic buttons                                                                                                                 | Replace arrow images with real buttons, accessible labels, and keyboard/focus behavior                                                                  | Codex | Done   |
| HOME-C032 | P2       | Async states         | Feedback section silently disappears when no data is returned                                                                                                                          | Add explicit loading, empty, and error states so the section’s absence never feels accidental                                                           | Codex | Done   |
| HOME-C033 | P2       | Layout / Interaction | `rightContent` is passed through to `FeedbackSlider` as arrow controls rather than rendered as part of the section header, making the section API and visual control placement unclear | Decide whether feedback controls belong in the section header or inside the slider, then rename/simplify the API and make the controls semantic buttons | Codex | Done   |

#### `FAQ.jsx`

| ID        | Severity | Area            | Issue                                                                                         | Task                                                                                                   | Owner | Status |
| --------- | -------- | --------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ----- | ------ |
| HOME-C034 | P2       | Accessibility   | FAQ items lack full accordion semantics                                                       | Add `aria-expanded`, `aria-controls`, stable ids, and panel relationships                              | Codex | Done   |
| HOME-C035 | P2       | Content quality | FAQ answers include support information that may age quickly and should be governed centrally | Move volatile support data to a shared config/content source instead of hardcoding it in the component | Codex | Done   |

#### `Header.jsx`

| ID        | Severity | Area            | Issue                                                                                                           | Task                                                                                            | Owner | Status |
| --------- | -------- | --------------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ----- | ------ |
| HOME-C036 | P1       | Accessibility   | Public navigation lacks a proper semantic `nav` landmark                                                        | Render navigation links inside a labeled `nav`                                                  | Codex | Done   |
| HOME-C037 | P2       | Search UX       | Search fires on each change and appears to have no debouncing or richer search-result affordances               | Add debouncing, improved keyboard support, and clearer empty/loading behavior for course search | Codex | Done   |
| HOME-C038 | P2       | Content density | Desktop header is trying to carry logo, search, nav, theme toggle, favorites, cart, and account actions at once | Simplify header density and prioritize the primary marketing actions more clearly               | Codex | Done   |

#### `Footer.jsx`

| ID        | Severity | Area                  | Issue                                                                     | Task                                                                                        | Owner | Status |
| --------- | -------- | --------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ----- | ------ |
| HOME-C039 | P2       | Semantics             | External destinations are rendered with router `Link` instead of anchors  | Replace external links with semantic anchors and correct target/rel handling                | Codex | Done   |
| HOME-C040 | P2       | Reliability / Privacy | Footer QR image is loaded from a third-party service at runtime           | Replace the runtime QR service with a verified local QR PNG and keep a direct link fallback | Codex | Done   |
| HOME-C041 | P3       | Content clarity       | Footer contact labels and handles should be checked for brand consistency | Review and normalize brand handle naming, phone formatting, and footer copy consistency     | Codex | Done   |

#### `MainLayout.jsx`

| ID        | Severity | Area          | Issue                                                                             | Task                                                                                                      | Owner | Status |
| --------- | -------- | ------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ----- | ------ |
| HOME-C042 | P1       | Accessibility | Public layout lacks a semantic `main` landmark and targetable main-content region | Wrap page children in `main` with `id="main-content"` so public pages support proper navigation semantics | Codex | Done   |

### Implementation Order

1. Fix page shell semantics and navigation landmarks.
2. Rebuild hero accessibility, motion behavior, and responsive layout.
3. Replace or tone down the sticky WhatsApp CTA.
4. Normalize loading, empty, and error states across all async homepage sections.
5. Rework rigid section layouts such as `Apply`.
6. Clean up footer semantics, QR dependency, and copy consistency.
7. Finish accordion semantics and lower-priority polish items.

### Re-audit Checklist For Home

- Public pages expose `header`, `nav`, `main`, and `footer` landmarks correctly.
- Hero is usable with keyboard only.
- Hero respects reduced-motion preferences.
- Hero CTA hierarchy is consistent on all slides.
- No section overflows or overlaps on common mobile widths.
- Floating CTA does not obscure content or distract excessively.
- Each async section has explicit loading, empty, success, and error behavior.
- Footer external links behave correctly.
- FAQ is screen-reader and keyboard friendly.

---

## Courses Page Audit

### Page Summary

- Route: `/courses`
- Source: `src/pages/Courses.jsx`
- Related components:
    - `src/features/marketing/components/SectionContainer.jsx`
    - `src/features/courses/components/CardCourse.jsx`
    - `src/shared/ui/Loader.jsx`
    - Shared shell inherited from public pages:
        - `src/shared/Header.jsx`
        - `src/shared/Footer.jsx`
        - `src/app/layouts/MainLayout.jsx`

### Audit Summary

The Courses page is the public video-course catalog. Offline and online-live courses are not public here, and global search owns cross-site searching. The page now needs to stay focused on public video-course browsing, sorting, state handling, and scale strategy rather than duplicating global search or exposing private course modalities.

### Detailed Tasks

| ID          | Severity | Area                      | Issue                                                                                                                         | Task                                                                                                                                              | Owner | Status |
| ----------- | -------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ------ |
| COURSES-001 | P1       | Catalog UX                | The page is only a flat listing and does not provide core discovery controls such as sorting or visible result state          | Design and implement a focused public video-catalog interaction model with sorting and result-summary controls, without duplicating global search | Codex | Done   |
| COURSES-002 | P1       | Async states              | API failure only logs to console and leaves users with an empty-looking page                                                  | Add explicit error state for catalog fetch failure with retry behavior and useful copy                                                            | Codex | Done   |
| COURSES-003 | P2       | Information architecture  | The page heading exists, but there is no result count, category context, or explanation of how the list is organized          | Add result meta such as course count, catalog scope, and active filter/sort state                                                                 | Codex | Done   |
| COURSES-004 | P2       | Layout                    | The page uses ad hoc margins and then nests `SectionContainer`, which introduces extra padding and weakens layout consistency | Rebuild the page-level layout with a dedicated catalog container and spacing system instead of reusing a marketing section wrapper as-is          | Codex | Done   |
| COURSES-005 | P2       | Empty states              | Empty results use the generic `SectionContainer` message rather than a catalog-specific empty state                           | Add a dedicated empty-state design for no courses and no matching results                                                                         | Codex | Done   |
| COURSES-006 | P2       | Accessibility             | The page inherits public-shell landmark/navigation issues already found on Home                                               | Resolve shared `Header`, `MainLayout`, and public navigation semantics and verify Courses benefits from those fixes                               | Codex | Done   |
| COURSES-007 | P2       | Performance / Scalability | The page renders all fetched courses at once with no pagination or lazy-loading strategy                                      | Add pagination or incremental loading strategy appropriate for catalog scale                                                                      | Codex | Done   |
| COURSES-008 | P3       | Content                   | The subtitle `Сиз үчүн сунушталган курстар` implies personalization even though the page appears to be a generic catalog      | Replace or qualify the subtitle so it accurately reflects the page’s real behavior                                                                | Codex | Done   |

### Component Audit Breakdown

#### `Courses.jsx`

| ID           | Severity | Area         | Issue                                                                                     | Task                                                                                                               | Owner | Status |
| ------------ | -------- | ------------ | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ----- | ------ |
| COURSES-C001 | P1       | Product UX   | `Courses.jsx` is a data-fetch-and-render wrapper, not a true catalog page                 | Introduce catalog page state for public video-course filtering, sorting, pagination planning, and result summaries | Codex | Done   |
| COURSES-C002 | P2       | Layout       | `ml-10 mt-5` header spacing and nested padded wrappers make the layout feel improvised    | Replace margin-based header positioning with a proper page container and consistent vertical rhythm                | Codex | Done   |
| COURSES-C003 | P2       | Async states | The page only handles loading success and loading spinner states                          | Add explicit success, empty, and error state branches at the page level                                            | Codex | Done   |
| COURSES-C004 | P3       | API contract | `setCourses(data.items)` assumes a stable payload shape without guarding for missing data | Normalize the response defensively so catalog rendering does not depend on optimistic shape assumptions            | Codex | Done   |

#### `SectionContainer.jsx`

| ID           | Severity | Area           | Issue                                                                                                      | Task                                                                                                                 | Owner | Status |
| ------------ | -------- | -------------- | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ----- | ------ |
| COURSES-C005 | P2       | Reuse strategy | `SectionContainer` is a marketing-oriented wrapper and is a poor fit for a full catalog page               | Stop using the marketing section wrapper as the primary catalog layout primitive, or add a dedicated catalog variant | Codex | Done   |
| COURSES-C006 | P2       | Async states   | The shared empty-state behavior is too generic for catalog use cases                                       | Extend `SectionContainer` or replace it in catalog contexts with richer state handling                               | Codex | Done   |
| COURSES-C007 | P3       | API clarity    | `Courses.jsx` passes unused/unsupported props like `buttonText`, which suggests a muddy component contract | Tighten the container API and remove dead prop usage from callers                                                    | Codex | Done   |

#### `CardCourse.jsx`

| ID           | Severity | Area                      | Issue                                                                                                                      | Task                                                                                                      | Owner | Status |
| ------------ | -------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ----- | ------ |
| COURSES-C008 | P1       | Accessibility / Semantics | The card wraps the full component in a `Link` while also containing internal buttons, creating nested interactive elements | Refactor the card interaction model so primary navigation and secondary actions are semantically valid    | Codex | Done   |
| COURSES-C009 | P2       | Discovery UX              | Card metadata is useful but not prioritized for catalog scanning, especially when many cards appear in a grid              | Rework typography, spacing, and metadata emphasis for faster compare-and-scan behavior in catalog context | Codex | Done   |
| COURSES-C010 | P2       | Responsive UI             | Metadata chips and footer CTA can become cramped in dense grids                                                            | Improve chip wrapping and action layout for smaller card widths                                           | Codex | Done   |
| COURSES-C011 | P2       | Product clarity           | Purchase availability messaging is ambiguous across course types                                                           | Clarify course availability, enrollment path, and purchase model directly in the card UI                  | Codex | Done   |
| COURSES-C012 | P3       | Technical quality         | The component still contains dead debug code and duplicated payload-building logic                                         | Remove dead code and simplify internal data-shaping helpers                                               | Codex | Done   |

#### `Loader.jsx`

| ID           | Severity | Area       | Issue                                                                                                 | Task                                                                                 | Owner | Status |
| ------------ | -------- | ---------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ----- | ------ |
| COURSES-C013 | P3       | Loading UX | Full-screen loader blocks the entire page without skeleton context, making catalog loading feel blank | Consider catalog-specific skeleton loading in place of a generic full-screen spinner | Codex | Done   |

### Implementation Order

1. Build a real catalog page structure with result summary, search, filter, sort, and pagination strategy.
2. Replace generic loading/empty/error handling with catalog-specific states.
3. Stop relying on `SectionContainer` as the primary page layout primitive for `/courses`.
4. Refactor `CardCourse` interaction semantics and improve scanability in grid context.
5. Align page copy and subtitle with the actual catalog behavior.

### Re-audit Checklist For Courses

- Users can search, filter, and sort courses meaningfully.
- The page exposes clear loading, error, empty, and success states.
- The catalog shows result counts and active state context.
- The grid remains readable on mobile, tablet, and desktop.
- Course cards do not contain nested interactive elements.
- The page no longer feels like a reused homepage section wrapper.

---

## Course Details Audit

### Page Summary

- Route: `/courses/:id`
- Source: `src/pages/CourseDetails.jsx`
- Related components:
    - `src/features/courses/components/CourseContent.jsx`
    - `src/features/courses/components/CourseVideoPlayer.jsx`
    - `src/features/courses/components/CourseDescription.jsx`
    - `src/features/courses/components/CourseReview.jsx`
    - `src/features/courses/components/InstructorsInfo.jsx`
    - `src/features/courses/components/CourseHeader.jsx`
    - `src/features/courses/components/CardVideo.jsx`
    - `src/features/courses/components/ArticleLessonViewer.jsx`
    - `src/features/courses/components/LessonQuizPlayer.jsx`
    - `src/features/courses/components/LessonChallengePlayer.jsx`
    - `src/features/ratings/components/Comment.jsx`
    - `src/shared/ui/Loader.jsx`
    - Shared shell inherited from public pages:
        - `src/shared/Header.jsx`
        - `src/shared/Footer.jsx`
        - `src/app/layouts/MainLayout.jsx`

### Audit Summary

The Course Details page has the right raw ingredients for a strong conversion and learning surface, but it is currently overloaded, inconsistent, and difficult to maintain. One page component is managing course marketing, enrollment gating, lesson playback, quizzes, coding challenges, progress state, instructor chat, responsive layout branching, and review/discussion surfaces all at once. The biggest issues are page complexity, duplicated desktop/mobile rendering, weak error-state UX, and component-level interaction defects.

### Detailed Tasks

| ID               | Severity | Area                           | Issue                                                                                                              | Task                                                                                                                                                                     | Owner | Status      |
| ---------------- | -------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----- | ----------- |
| COURSEDETAIL-001 | P1       | Architecture / Maintainability | `CourseDetails.jsx` is doing too much and mixes many independent responsibilities in one file                      | Split the page into dedicated hooks and view components for enrollment state, lesson runtime, sidebar/program state, quiz/challenge state, and marketing/review sections | Codex | In progress |
| COURSEDETAIL-002 | P1       | Responsive UI                  | The page duplicates large render trees for mobile and desktop, which increases drift risk and inconsistency        | Refactor the layout so mobile and desktop share the same core content modules with layout-only differences                                                               | Codex | Done        |
| COURSEDETAIL-003 | P1       | Error UX                       | Error handling falls back to raw text blocks like `Ката: ...` and `Курс табылган жок`                              | Replace raw error/not-found output with designed empty/error states including recovery actions                                                                           | Codex | Done        |
| COURSEDETAIL-004 | P1       | Conversion UX                  | The page mixes pre-enrollment sales content and post-enrollment learning workspace in one unstable structure       | Define a clearer split between prospect view and enrolled learning view so the page hierarchy changes intentionally rather than ad hoc                                   | Codex | Done        |
| COURSEDETAIL-005 | P2       | Accessibility                  | The page inherits public-shell landmark issues already found on Home                                               | Resolve shared public-page landmark and navigation issues and verify this page benefits from them                                                                        | Codex | Done        |
| COURSEDETAIL-006 | P2       | Interaction density            | Instructor chat, course content, AI assistant, reviews, comments, and lesson runtime compete for attention         | Rebalance priorities so the primary learning task or primary conversion task dominates based on enrollment state                                                         | Codex | Done        |
| COURSEDETAIL-007 | P2       | State integrity                | The page coordinates local storage, URL params, runtime fetches, and progress state in one large flow              | Normalize state sources and define a single precedence model for resume lesson, active lesson, and progress restoration                                                  | Codex | Done        |
| COURSEDETAIL-008 | P2       | Content quality                | Language style is inconsistent across course details surfaces, mixing Kyrgyz, English, and Russian comments/labels | Audit and normalize UI copy, labels, and helper text across the page                                                                                                     | Codex | Done        |

### Component Audit Breakdown

#### `CourseDetails.jsx`

> Note: The broad Course Details/Login implementation batch from 2026-05-13 was reverted because it caused visual and behavioral regressions. Re-implement these rows only as small, isolated changes with review after each task.

| ID                | Severity | Area                    | Issue                                                                                                                                                         | Task                                                                                                                   | Owner | Status      |
| ----------------- | -------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----- | ----------- |
| COURSEDETAIL-C001 | P1       | Complexity              | The page component contains too many concerns: data loading, enrollment gating, player state, quiz state, challenge state, chat state, and layout rendering   | Extract focused hooks/components and reduce the page component to orchestration plus layout                            | Codex | Done        |
| COURSEDETAIL-C002 | P1       | Responsive architecture | Mobile and desktop branches duplicate major chunks of UI and business wiring                                                                                  | Create shared content modules and only branch on layout containers or slot placement                                   | Codex | Done        |
| COURSEDETAIL-C003 | P2       | Async states            | Course loading, error, and not-found states are minimal and product-incomplete                                                                                | Replace raw spinner/error/not-found rendering with a course-detail-specific loading skeleton and styled failure states | Codex | Done        |
| COURSEDETAIL-C004 | P2       | Dead code / drift       | `CourseHeader` is imported but not used, suggesting layout drift and unclear component ownership                                                              | Remove dead imports or restore a deliberate header strategy for the page                                               | Codex | Done        |
| COURSEDETAIL-C005 | P2       | State correctness       | The initial lesson-selection flow mixes fetched progress, last-viewed lesson, local storage, and resume params in one effect with muted exhaustive-deps rules | Break the initialization flow into explicit stages and document precedence between state sources                       | Codex | Done        |
| COURSEDETAIL-C006 | P3       | Accessibility           | Fixed-position chat launcher and chat panel need explicit keyboard/focus handling review                                                                      | Add focus management, close behavior, and a11y review for the instructor chat launcher/panel                           | Codex | Done        |

#### `CourseContent.jsx`

| ID                | Severity | Area                   | Issue                                                                                                                                 | Task                                                                                                                            | Owner | Status      |
| ----------------- | -------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ----- | ----------- |
| COURSEDETAIL-C007 | P1       | Discovery UX           | Course content acts as both a sales outline and an enrolled learning navigator, but the behavior differences are not cleanly designed | Split prospect-preview behavior and enrolled-program behavior into clearer variants with intentional copy and interaction rules | TBD   | Not started |
| COURSEDETAIL-C008 | P2       | Accessibility          | Section toggles use `aria-expanded` but do not expose explicit controlled-region ids/relationships                                    | Add `aria-controls`, stable panel ids, and stronger accordion semantics                                                         | Codex | Done        |
| COURSEDETAIL-C009 | P2       | Content / Localization | Labels such as `Preview`, `Кичинекей`, and mixed-language helper text reduce polish and clarity                                       | Normalize labels into consistent Kyrgyz product language                                                                        | Codex | Done        |
| COURSEDETAIL-C010 | P2       | Interaction design     | Lesson cards are button-based rows with nested checkbox and download actions, creating dense multi-action targets                     | Simplify action hierarchy for lesson rows and ensure secondary actions are easier to parse and operate                          | Codex | Done        |
| COURSEDETAIL-C011 | P2       | Responsive UI          | The content panel depends on explicit `maxHeight` and internal scrolling, which can make nested scrolling awkward                     | Revisit sidebar/content scroll behavior so program navigation remains usable without brittle height coupling                    | TBD   | Not started |
| COURSEDETAIL-C012 | P3       | Code quality           | The component contains leftover comments, mixed-language inline notes, and some unclear naming                                        | Clean up comments and improve naming so the component is easier to maintain                                                     | Codex | Done        |

#### `CourseVideoPlayer.jsx`

| ID                | Severity | Area          | Issue                                                                                                                        | Task                                                                                      | Owner | Status |
| ----------------- | -------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ----- | ------ |
| COURSEDETAIL-C013 | P2       | Accessibility | Previous/next lesson controls are visually overlaid but need stronger focus visibility and keyboard review in player context | Review focus order, hit areas, and visual focus treatment for overlay navigation controls | Codex | Done   |
| COURSEDETAIL-C014 | P2       | UX            | Player navigation arrows are low-context controls without lesson labels or stronger affordance                               | Improve next/previous affordance with tooltip or lesson-title context                     | Codex | Done   |

#### `CourseDescription.jsx`

| ID                | Severity | Area                     | Issue                                                                                                    | Task                                                                                                                 | Owner | Status |
| ----------------- | -------- | ------------------------ | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ----- | ------ |
| COURSEDETAIL-C015 | P2       | Information architecture | Description, outcomes, metadata, and freshness badges are blended into one generic block                 | Separate course overview, outcomes, metadata, and update information more clearly                                    | Codex | Done   |
| COURSEDETAIL-C016 | P2       | Content strategy         | Falling back to `course.description` as a learning-outcomes list weakens content credibility             | Use distinct content fields for marketing description versus learning outcomes                                       | Codex | Done   |
| COURSEDETAIL-C017 | P3       | Loading UX               | Rendering a full-screen loader inside the description component is not appropriate for an inline section | Replace the internal full-screen loader fallback with a local inline placeholder or rely on page-level loading state | Codex | Done   |

#### `CourseReview.jsx`

| ID                | Severity | Area            | Issue                                                                                                                                         | Task                                                                                      | Owner | Status |
| ----------------- | -------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ----- | ------ |
| COURSEDETAIL-C018 | P1       | Frontend defect | The component calls `setRating(star)` even though no such state exists, which is a direct implementation bug                                  | Remove the dead interactive behavior or implement a real rating interaction intentionally | Codex | Done   |
| COURSEDETAIL-C019 | P2       | UX clarity      | The component is presented as read-only summary but still renders clickable-looking stars and a “view all” action without a clear destination | Make the component either truly read-only or connect it to a real review flow             | Codex | Done   |
| COURSEDETAIL-C020 | P2       | Accessibility   | Review bars and summary stars need clearer semantic labeling for screen-reader interpretation                                                 | Add accessible labels/values for rating summary and star display                          | Codex | Done   |

#### `InstructorsInfo.jsx`

| ID                | Severity | Area                   | Issue                                                                                                                                | Task                                                                            | Owner | Status      |
| ----------------- | -------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- | ----- | ----------- |
| COURSEDETAIL-C021 | P2       | Localization / Content | Instructor card mixes Kyrgyz with English labels like `TOP tutor`, `years experience`, `courses`, and `students`                     | Localize the component consistently and align tone with the rest of the product | Codex | Done        |
| COURSEDETAIL-C022 | P2       | Information hierarchy  | The instructor panel is content-rich but visually busy and not tightly prioritized for either trust-building or instructor discovery | Rework the layout so key proof points and social links are easier to scan       | TBD   | Not started |

#### Shared learning components on this page

| ID                | Severity | Area          | Issue                                                                                                                                            | Task                                                                                             | Owner | Status      |
| ----------------- | -------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ----- | ----------- |
| COURSEDETAIL-C023 | P2       | Flow cohesion | `Comment`, `CourseReview`, and `InstructorsInfo` are repeated or repositioned differently across enrolled/non-enrolled and mobile/desktop states | Define stable placement rules for trust, review, and discussion modules across all page variants | TBD   | Not started |
| COURSEDETAIL-C024 | P2       | Learning UX   | Prospect view and enrolled view currently share some components but not a clear narrative structure                                              | Redesign the page around two intentional journeys: conversion and active learning                | TBD   | Not started |

### Implementation Order

1. Split `CourseDetails.jsx` into manageable hooks/components and remove duplicated mobile/desktop render trees.
2. Design proper loading, error, and not-found states for course details.
3. Define a clear prospect journey versus enrolled learning journey.
4. Fix direct component defects in `CourseReview.jsx` and improve `CourseContent.jsx` interaction semantics.
5. Normalize copy and metadata presentation across description, instructor, and review surfaces.

### Re-audit Checklist For Course Details

- The page has clear, designed loading/error/not-found states.
- Mobile and desktop do not rely on duplicated business-render branches.
- Prospect users get a clear conversion-focused layout.
- Enrolled users get a clear learning-focused layout.
- Course content navigation is keyboard-friendly and semantically structured.
- Review summary behaves consistently and contains no broken interactive code.
- Copy is localized and consistent across the page.

---

## About Page Audit

### Page Summary

- Route: `/about`
- Source: `src/pages/About.jsx`
- Related components:
    - `src/features/marketing/components/AboutHero.jsx`
    - `src/features/marketing/components/Metrics.jsx`
    - `src/features/marketing/components/Vision.jsx`
    - `src/features/marketing/components/InfoCards.jsx`
    - Unused/orphaned related components discovered during audit:
        - `src/features/marketing/components/AboutText.jsx`
        - `src/features/marketing/components/Evaluate.jsx`
    - Shared shell inherited from public pages:
        - `src/shared/Header.jsx`
        - `src/shared/Footer.jsx`
        - `src/app/layouts/MainLayout.jsx`

### Audit Summary

The About page is readable, but it does not yet feel like a deliberate brand story. It is currently a short stack of sections with weak container discipline, oversized typography, and repeated content between sections. The page also shows signs of content-direction drift through unused alternative components that overlap with the active About narrative. The biggest issues are narrative clarity, responsive composition, and inconsistent visual hierarchy.

### Detailed Tasks

| ID        | Severity | Area               | Issue                                                                                                                         | Task                                                                                                                 | Owner | Status |
| --------- | -------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ----- | ------ |
| ABOUT-001 | P1       | Narrative UX       | The page does not build a strong “who we are / why we exist / why trust us” story arc                                         | Redesign the About page around a clearer narrative sequence: brand intro, proof, mission/vision, and differentiators | Codex | Done   |
| ABOUT-002 | P2       | Layout             | The page relies on one outer margin wrapper and then lets each section define its own structure independently                 | Introduce a dedicated About page layout system with consistent section containers, spacing, and max-width rules      | Codex | Done   |
| ABOUT-003 | P2       | Content quality    | Messaging is partially repetitive across hero, vision, and info cards                                                         | Consolidate repeated copy and give each section a distinct purpose                                                   | Codex | Done   |
| ABOUT-004 | P2       | Responsive UI      | Several sections use very large heading sizes and loose image placement that are likely to feel unbalanced on smaller screens | Rework responsive typography and image scaling across the page                                                       | Codex | Done   |
| ABOUT-005 | P2       | Accessibility      | The page inherits shared public-shell landmark/navigation issues already identified on Home                                   | Resolve shared public-page semantic issues and verify the About page benefits from those fixes                       | Codex | Done   |
| ABOUT-006 | P3       | Content governance | Unused About-related components suggest competing versions of the About story are living in the codebase                      | Decide which About content direction is canonical and remove or archive orphaned alternatives                        | Codex | Done   |

### Component Audit Breakdown

#### `About.jsx`

| ID         | Severity | Area          | Issue                                                                          | Task                                                                                                                                          | Owner | Status |
| ---------- | -------- | ------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ------ |
| ABOUT-C001 | P2       | Composition   | The page is a thin wrapper that simply stacks sections and one raw image       | Create a more intentional page composition with section framing and transitions instead of a bare sequence                                    | Codex | Done   |
| ABOUT-C002 | P2       | Layout        | The shared outer wrapper `mx-4 md:mx-12` is too weak as a page layout contract | Replace ad hoc margins with a consistent page container and section spacing system                                                            | Codex | Done   |
| ABOUT-C003 | P3       | Accessibility | The team image is inserted as a standalone visual with empty context around it | Decide whether the image is decorative or informative and give it either better semantic support or hide it from assistive tech intentionally | Codex | Done   |

#### `AboutHero.jsx`

| ID         | Severity | Area                | Issue                                                                                                  | Task                                                                                     | Owner | Status |
| ---------- | -------- | ------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- | ----- | ------ |
| ABOUT-C004 | P2       | Responsive UI       | The hero headline is extremely large (`text-7xl` / `text-8xl`) relative to the page content density    | Rebalance hero typography for more controlled scaling across breakpoints                 | Codex | Done   |
| ABOUT-C005 | P2       | Narrative hierarchy | The hero body copy is long and dense for an introductory block                                         | Tighten hero copy and push supporting detail lower into the page                         | Codex | Done   |
| ABOUT-C006 | P3       | Visual cohesion     | Decorative assets like the arrow and globe feel loosely placed rather than integral to the composition | Recompose the hero so graphics support the story instead of appearing as adjacent assets | Codex | Done   |

#### `Metrics.jsx`

| ID         | Severity | Area             | Issue                                                                                                        | Task                                                                                        | Owner | Status |
| ---------- | -------- | ---------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- | ----- | ------ |
| ABOUT-C007 | P2       | Trust / Proof    | Metrics are useful, but they lack context about what exactly is being measured and why it matters            | Improve metric labels and surrounding context so the proof feels more credible and specific | Codex | Done   |
| ABOUT-C008 | P2       | Responsive UI    | Metric cards can become cramped because large numbers and long descriptions are forced into horizontal cards | Rework metric card layout for better vertical rhythm and more stable small-screen behavior  | Codex | Done   |
| ABOUT-C009 | P3       | Frontend quality | There is a broken Tailwind class composition in the metric number styling (`text-[#141619]dark:text...`)     | Fix the malformed class string and review the component for similar utility mistakes        | Codex | Done   |

#### `Vision.jsx`

| ID         | Severity | Area             | Issue                                                                                                         | Task                                                                                          | Owner | Status |
| ---------- | -------- | ---------------- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ----- | ------ |
| ABOUT-C010 | P2       | Layout           | The section uses a very large gap and oversized heading that can make the layout feel sparse and disconnected | Tighten the image-text relationship and rebalance spacing/typography                          | Codex | Done   |
| ABOUT-C011 | P2       | Content strategy | Vision copy overlaps conceptually with hero and info-card content                                             | Rewrite the section so it adds new value rather than restating the intro                      | Codex | Done   |
| ABOUT-C012 | P3       | Accessibility    | The main image has empty alt text without clarified decorative intent                                         | Confirm decorative intent or provide a meaningful description if the image is content-bearing | Codex | Done   |

#### `InfoCards.jsx`

| ID         | Severity | Area                     | Issue                                                                                                              | Task                                                                                                                         | Owner | Status |
| ---------- | -------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- | ----- | ------ |
| ABOUT-C013 | P2       | Information architecture | The cards repeat “about / vision / mission” content that the page already presents elsewhere                       | Rework the card set so each card adds distinct value, proof, or principles instead of repeating headings from other sections | Codex | Done   |
| ABOUT-C014 | P2       | Responsive UI            | Fixed card height (`h-64`) risks truncation or awkward whitespace as content changes                               | Replace fixed-height cards with content-driven sizing                                                                        | Codex | Done   |
| ABOUT-C015 | P3       | Content polish           | The mission card includes an emoji in the heading while neighboring cards do not, which weakens visual consistency | Normalize heading style across the card set                                                                                  | Codex | Done   |

#### `AboutText.jsx` and `Evaluate.jsx` (unused/orphaned)

| ID         | Severity | Area               | Issue                                                                                                              | Task                                                                                       | Owner | Status |
| ---------- | -------- | ------------------ | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | ----- | ------ |
| ABOUT-C016 | P3       | Content governance | `AboutText.jsx` appears to be an unused alternative About page narrative                                           | Decide whether to retire, merge, or repurpose this component and remove dead content paths | Codex | Done   |
| ABOUT-C017 | P3       | Product clarity    | `Evaluate.jsx` appears to be an unused feedback/rating surface that does not belong to the current About page flow | Decide whether this belongs on Contact, Reviews, or nowhere, then remove or relocate it    | Codex | Done   |

### Implementation Order

1. Redesign the About page narrative structure and define what each section must uniquely communicate.
2. Introduce a real About page layout/container system and rebalance responsive typography.
3. Rework metrics, vision, and info cards so they reinforce trust instead of repeating copy.
4. Clean up orphaned About-related components and settle the canonical content direction.
5. Verify shared public-page accessibility fixes apply here as well.

### Re-audit Checklist For About

- The page tells a clear brand story from intro to trust/proof to mission/vision.
- Section spacing and max-widths feel consistent across the page.
- Typography scales cleanly on mobile and desktop.
- Metrics feel credible and easy to scan.
- Images are either meaningfully described or intentionally decorative.
- No orphaned About-page variants remain in active code without purpose.

---

## Contact Page Audit

### Page Summary

- Route: `/contact`
- Source: `src/pages/Contact.jsx`
- Related components:
    - `src/features/contact/api.js`
    - Unused related input component discovered during audit:
        - `src/shared/ui/forms/PhoneInput.jsx`
    - Shared shell inherited from public pages:
        - `src/shared/Header.jsx`
        - `src/shared/Footer.jsx`
        - `src/app/layouts/MainLayout.jsx`

### Audit Summary

The Contact page covers the essentials, but it still feels like a single-file prototype rather than a deliberate lead-generation surface. The form works conceptually, yet the page lacks stronger trust cues, clearer submission-state UX, better validation ergonomics, and a more polished layout hierarchy. The main issues are form usability, content consistency, and page structure.

### Detailed Tasks

| ID          | Severity | Area                     | Issue                                                                                                                     | Task                                                                                                                | Owner | Status |
| ----------- | -------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ----- | ------ |
| CONTACT-001 | P1       | Form UX                  | The page does not expose pending/submitting state, so users do not get strong feedback during send actions                | Add explicit submit-pending state, disable repeat submission, and show clearer success/failure behavior             | Codex | Done   |
| CONTACT-002 | P1       | Validation UX            | Validation is basic and technically functional, but the error presentation is weak and not tightly associated with inputs | Improve inline validation, field-level accessibility wiring, and clearer guidance for correction                    | Codex | Done   |
| CONTACT-003 | P2       | Information architecture | The page combines form, contact methods, and map in a flat stack without a stronger lead-gen hierarchy                    | Redesign the page so primary conversion, alternate contact channels, and location information have clearer priority | Codex | Done   |
| CONTACT-004 | P2       | Content consistency      | Copy mixes Kyrgyz and Russian labels, reducing polish and trust                                                           | Normalize all contact-page copy into one consistent language style                                                  | Codex | Done   |
| CONTACT-005 | P2       | Accessibility            | The page inherits shared public-shell landmark/navigation issues already identified on Home                               | Resolve shared public-page semantic issues and verify Contact benefits from them                                    | Codex | Done   |
| CONTACT-006 | P2       | Trust UX                 | The page lacks reassurance cues such as response expectations, privacy reassurance, or reason-to-contact framing          | Add supporting trust copy around response time, support scope, and what happens after submission                    | Codex | Done   |
| CONTACT-007 | P3       | Component strategy       | The whole page lives in one component despite containing distinct form, contact-info, and map sections                    | Split the page into smaller presentational sections for maintainability and reuse                                   | Codex | Done   |

### Component Audit Breakdown

#### `Contact.jsx`

| ID           | Severity | Area                       | Issue                                                                                                          | Task                                                                                                                  | Owner | Status |
| ------------ | -------- | -------------------------- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----- | ------ |
| CONTACT-C001 | P1       | Submission UX              | The submit button does not show loading state or prevent duplicate sends                                       | Add `isSubmitting` state, disable submit while pending, and reflect request state in button copy                      | Codex | Done   |
| CONTACT-C002 | P2       | Validation / Accessibility | Error text is rendered above fields, but inputs are not explicitly wired to errors with ids/aria attributes    | Add `aria-invalid`, `aria-describedby`, and stable error ids for each field                                           | Codex | Done   |
| CONTACT-C003 | P2       | Input ergonomics           | Phone input only accepts raw digits and does not guide users with formatting or country context                | Use a dedicated phone input strategy or clearly format/label the expected number style                                | Codex | Done   |
| CONTACT-C004 | P2       | Content consistency        | Field labels include mixed-language text such as `Электронная почта`                                           | Normalize field labels and helper/error copy into consistent Kyrgyz product language                                  | Codex | Done   |
| CONTACT-C005 | P2       | Responsive UI              | The form and supporting illustration use a basic two-column switch without stronger visual framing             | Improve the page composition so the form remains primary and the illustration supports rather than merely fills space | Codex | Done   |
| CONTACT-C006 | P2       | Contact details hierarchy  | Social/contact info blocks have inconsistent alignment patterns across the three columns                       | Redesign the contact-info area as a consistent card/grid system with stronger scanability                             | Codex | Done   |
| CONTACT-C007 | P2       | Map UX                     | The embedded map is useful, but it is visually detached from the address and action flow                       | Integrate map, address, and route/action cues more tightly                                                            | Codex | Done   |
| CONTACT-C008 | P3       | Technical quality          | The page imports and renders `Toaster` locally rather than relying on a more centralized notification strategy | Review whether notifications should be handled at app-shell level rather than per-page                                | Codex | Done   |

#### `src/features/contact/api.js`

| ID           | Severity | Area           | Issue                                                                     | Task                                                                                                     | Owner | Status |
| ------------ | -------- | -------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ----- | ------ |
| CONTACT-C009 | P3       | Error handling | Form submission failures are surfaced only through one generic toast path | Review API error mapping so backend validation or delivery failures can produce more actionable feedback | Codex | Done   |

#### Unused related input component

| ID           | Severity | Area           | Issue                                                                                   | Task                                                                                          | Owner | Status |
| ------------ | -------- | -------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ----- | ------ |
| CONTACT-C010 | P3       | Reuse strategy | `src/shared/ui/forms/PhoneInput.jsx` exists but the contact page still uses a raw input | Decide whether to adopt the shared phone input here or remove redundant field implementations | Codex | Done   |

### Implementation Order

1. Improve submission-state UX and field-level validation/accessibility.
2. Normalize copy and phone-input behavior.
3. Redesign the page hierarchy so form, contact options, and map each have a clearer role.
4. Decide whether to reuse the shared phone-input component or consolidate input strategy.
5. Verify shared public-page accessibility fixes apply here as well.

### Re-audit Checklist For Contact

- Users get clear pending, success, and failure feedback when submitting the form.
- Validation errors are clearly tied to the correct inputs.
- Form labels, errors, and supporting copy use consistent language.
- Contact methods are easy to scan and trust.
- The map feels integrated rather than appended.
- The page works cleanly on mobile and desktop.

---

## Login Page Audit

### Page Summary

- Route: `/login`
- Source: `src/pages/Login.jsx`
- Related components:
    - `src/features/auth/components/ForgotPassword.jsx`
    - `src/shared/ui/forms/DefaultLabel.jsx`
    - `src/shared/ui/forms/LabelPassword.jsx`
    - Related config/helpers:
        - `src/shared/auth-config`
        - `src/shared/utils/auth`
    - Shared shell inherited from public pages:
        - `src/shared/Header.jsx`
        - `src/shared/Footer.jsx`
        - `src/app/layouts/MainLayout.jsx`

### Audit Summary

The Login page is functional, but it still feels like a utilitarian auth screen rather than a polished acquisition and re-entry surface. The largest issues are weak state/flow clarity, limited field-level validation and accessibility support, and mixed responsibilities between authentication and “pending action” recovery. The forgot-password flow is also serviceable but underdesigned and not strongly integrated into the overall auth experience.

### Detailed Tasks

| ID        | Severity | Area                  | Issue                                                                                                                              | Task                                                                                                                         | Owner | Status      |
| --------- | -------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----- | ----------- |
| LOGIN-001 | P1       | Auth UX               | The page does not clearly handle destination intent after login beyond a generic redirect to `/` or ad hoc pending-action recovery | Define a clearer post-login routing model that respects origin intent, pending actions, and user role/dashboard expectations | Codex | Done        |
| LOGIN-002 | P1       | Accessibility         | The login form has weak field-level accessibility wiring and uses a clickable `div` for the forgot-password trigger                | Add semantic controls, error associations, and proper interactive elements throughout the auth flow                          | Codex | Done        |
| LOGIN-003 | P2       | Information hierarchy | The page focuses on fields but provides little contextual reassurance or guidance about account access paths                       | Add clearer support copy for who can log in, account creation paths, and recovery expectations                               | Codex | Done        |
| LOGIN-004 | P2       | Content consistency   | The page mixes Kyrgyz with Russian copy in pending-action success toasts                                                           | Normalize all login and recovery copy into one consistent language strategy                                                  | Codex | Done        |
| LOGIN-005 | P2       | Architecture          | Login page is doing both authentication and deferred commerce/favourite action recovery                                            | Extract pending-action recovery logic into a dedicated auth/post-login workflow utility                                      | Codex | Done        |
| LOGIN-006 | P2       | Accessibility         | The page inherits shared public-shell landmark/navigation issues already identified on Home                                        | Resolve shared public-page semantic issues and verify Login benefits from them                                               | TBD   | Not started |

### Component Audit Breakdown

#### `Login.jsx`

| ID         | Severity | Area            | Issue                                                                                                                                              | Task                                                                                                         | Owner       | Status |
| ---------- | -------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ----------- | ------ |
| LOGIN-C001 | P1       | Flow design     | The page mixes primary login behavior with deferred localStorage-driven cart/favourite actions                                                     | Move deferred action recovery out of the page component and treat it as a separate post-auth success path    | Codex       | Done   |
| LOGIN-C002 | P2       | Validation UX   | The form only shows one generic error state and does not validate empty/invalid email state before submission                                      | Add lightweight client-side validation and more specific error messaging before and after request submission | Codex       | Done   |
| LOGIN-C003 | P2       | Accessibility   | The forgot-password trigger is a `div` with click behavior instead of a button                                                                     | Replace it with a semantic button or link and ensure keyboard/focus behavior is correct                      | Codex       | Done   |
| LOGIN-C004 | P2       | Responsive UI   | The left-side branding panel is visually acceptable, but the page still feels like a split-layout template rather than a purpose-built auth screen | TBD                                                                                                          | Not started |
| LOGIN-C005 | P3       | Code quality    | `useEffect`, `useLocation`, and `getAuthDebugInfo` appear imported but unused, indicating drift                                                    | Remove unused imports and tighten the page implementation                                                    | Codex       | Done   |
| LOGIN-C006 | P3       | Product clarity | Successful pending-action redirects use inconsistent destinations such as `/favourite` instead of `/favourites`                                    | Audit the redirect targets and align them with the actual routing structure                                  | Codex       | Done   |

#### `ForgotPassword.jsx`

| ID         | Severity | Area                | Issue                                                                                                                    | Task                                                                                                               | Owner | Status |
| ---------- | -------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | ----- | ------ |
| LOGIN-C007 | P1       | Recovery UX         | Forgot-password is a functional overlay, but the flow is visually and structurally too raw for a sensitive recovery path | Redesign the forgot-password modal into a clearer step-by-step recovery flow with better state feedback            | Codex | Done   |
| LOGIN-C008 | P2       | Validation UX       | The reset flow does not appear to validate method selection or identifier format before submission                       | Add field validation and clearer requirements per recovery method                                                  | Codex | Done   |
| LOGIN-C009 | P2       | Accessibility       | The overlay lacks explicit dialog semantics and focus-management guarantees in its own implementation                    | Migrate the recovery flow onto an accessible shared modal primitive or add dialog semantics/focus control directly | Codex | Done   |
| LOGIN-C010 | P2       | Content consistency | Method labels, placeholders, and errors are generic and do not guide users well                                          | Improve copy so users understand what identifier to enter and what happens next                                    | Codex | Done   |

#### `DefaultLabel.jsx`

| ID         | Severity | Area           | Issue                                                                                                  | Task                                                                                | Owner | Status      |
| ---------- | -------- | -------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- | ----- | ----------- |
| LOGIN-C011 | P2       | Accessibility  | Floating-label input does not expose strong label/input/id/error relationships                         | Add explicit `id`, `htmlFor`, and `aria-describedby` support to the field primitive | Codex | Done        |
| LOGIN-C012 | P2       | Field behavior | The component manages mirrored local state even when used as a controlled input, increasing complexity | Simplify the component so it behaves more predictably as a controlled form input    | TBD   | Not started |
| LOGIN-C013 | P3       | UX             | Required-state signaling depends on focus/blur behavior rather than clear, consistent form conventions | Revisit required/error visual treatment for clearer behavior                        | TBD   | Not started |

#### `LabelPassword.jsx`

| ID         | Severity | Area             | Issue                                                                                        | Task                                                                            | Owner | Status      |
| ---------- | -------- | ---------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ----- | ----------- |
| LOGIN-C014 | P2       | Accessibility    | Password visibility toggle is implemented as a clickable `div` rather than a semantic button | Codex                                                                           | Done  |
| LOGIN-C015 | P2       | Form consistency | Password field repeats the same mirrored-local-state complexity as `DefaultLabel.jsx`        | Simplify the input contract and align behavior with the rest of the form system | TBD   | Not started |

### Implementation Order

1. Fix semantic/form accessibility issues on login and forgot-password flows.
2. Clarify login error handling, empty-state validation, and submission feedback.
3. Separate post-login pending-action recovery from core login-page responsibilities.
4. Redesign the forgot-password flow on top of a stronger shared modal/dialog pattern.
5. Clean up auth-form primitives and remove unused code drift.

### Re-audit Checklist For Login

- The login page communicates clearly who can log in and what to do if access is missing.
- Inputs and errors are semantically wired and keyboard-friendly.
- Forgot-password is accessible and step-based, not just technically functional.
- Post-login redirects and pending-action recovery are predictable.
- Copy is localized and consistent.
- Desktop and mobile auth layouts feel intentional rather than template-like.

---

## Register Page Audit

### Page Summary

- Route: `/register`
- Source: `src/pages/Signup.jsx`
- Related components:
    - `src/shared/ui/forms/PhoneInput.jsx`
    - `src/shared/ui/forms/DefaultLabel.jsx`
    - `src/shared/ui/forms/LabelPassword.jsx`
    - Related auth/config context:
        - `src/shared/auth-config`
        - `src/features/auth/api.js`
    - Shared shell inherited from public pages:
        - `src/shared/Header.jsx`
        - `src/shared/Footer.jsx`
        - `src/app/layouts/MainLayout.jsx`

### Audit Summary

The Register page is functional, but it still behaves like a basic form implementation rather than a polished acquisition flow. The largest issues are registration-flow clarity, weak field-level validation semantics, fragile password-guidance behavior, and duplication of deferred post-auth action logic already seen in login. The page also needs stronger communication around who should self-register, what happens after account creation, and how password/phone requirements are enforced.

### Detailed Tasks

| ID           | Severity | Area                | Issue                                                                                                                | Task                                                                                                                           | Owner | Status      |
| ------------ | -------- | ------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ----- | ----------- |
| REGISTER-001 | P1       | Signup UX           | The page does not clearly explain what happens after registration or who should use self-signup                      | Add clear onboarding guidance about eligibility, next step after registration, and expected destination after account creation | Codex | Done        |
| REGISTER-002 | P1       | Accessibility       | Form primitives and password guidance do not provide strong semantic accessibility support                           | Add proper label/input/error wiring, accessible password guidance, and semantic controls throughout the flow                   | Codex | Done        |
| REGISTER-003 | P2       | Validation UX       | Validation is split between generic page error, toasts, and inline tooltip hints, which makes the form hard to parse | Consolidate validation into a clearer per-field and per-form strategy with predictable placement and language                  | Codex | Done        |
| REGISTER-004 | P2       | Architecture        | Signup page mixes registration and deferred pending-action recovery logic                                            | Extract deferred post-auth action recovery into shared auth success handling rather than duplicating it on auth pages          | Codex | Done        |
| REGISTER-005 | P2       | Content consistency | The page needs a more coherent tone for field labels, password guidance, and error messaging                         | Normalize copy and naming across all registration states                                                                       | Codex | Done        |
| REGISTER-006 | P2       | Accessibility       | The page inherits shared public-shell landmark/navigation issues already identified on Home                          | Resolve shared public-page semantic issues and verify Register benefits from them                                              | TBD   | Not started |

### Component Audit Breakdown

#### `Signup.jsx`

| ID            | Severity | Area              | Issue                                                                                                               | Task                                                                                                                         | Owner | Status      |
| ------------- | -------- | ----------------- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----- | ----------- |
| REGISTER-C001 | P1       | Flow design       | The page does not clearly define where a newly registered user goes and what setup state they are in afterward      | Define a stronger post-registration path, especially if account setup, verification, or role-specific onboarding is expected | Codex | Done        |
| REGISTER-C002 | P2       | Validation UX     | Password mismatch is shown as page-level error while phone errors are shown as toasts, creating fragmented feedback | Unify validation feedback so users can correct issues directly at the relevant fields                                        | Codex | Done        |
| REGISTER-C003 | P2       | Password UX       | Password requirements are shown via an ad hoc tooltip pattern that may be fragile and inaccessible                  | Replace the floating password rules tooltip with a stable, accessible helper/rule list tied to the password field            | Codex | Done        |
| REGISTER-C004 | P2       | Responsive UI     | The form uses the same split-layout auth template as login and does not feel like a tailored signup experience      | Rework the registration page composition so the brand panel and form content feel purpose-built                              | TBD   | Not started |
| REGISTER-C005 | P3       | Code quality      | `useEffect`, `useLocation`, `showPassword`, and `showRepeatPassword` appear unused, indicating drift                | Remove unused state/imports and tighten the page implementation                                                              | Codex | Done        |
| REGISTER-C006 | P3       | Route consistency | Deferred action redirects again use inconsistent targets such as `/favourite`                                       | Align redirect targets and centralize route usage                                                                            | Codex | Done        |

#### `PhoneInput.jsx`

| ID            | Severity | Area          | Issue                                                                                                       | Task                                                                                     | Owner | Status      |
| ------------- | -------- | ------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ----- | ----------- |
| REGISTER-C007 | P2       | Input UX      | Phone input accepts raw `+` and digits but gives little inline guidance about expected international format | Add clearer label/help text and better formatting guidance for international phone entry | Codex | Done        |
| REGISTER-C008 | P2       | Accessibility | The field is a plain input with no built-in label/error association pattern                                 | Integrate it into the same accessible form-field system as other auth inputs             | Codex | Done        |
| REGISTER-C009 | P3       | Consistency   | The phone field styling and interaction model do not fully match the floating-label auth inputs             | Align phone input visuals and behavior with the rest of the auth form system             | TBD   | Not started |

#### `DefaultLabel.jsx` and `LabelPassword.jsx`

| ID            | Severity | Area              | Issue                                                                                                                | Task                                                                                         | Owner | Status |
| ------------- | -------- | ----------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ----- | ------ |
| REGISTER-C010 | P2       | Accessibility     | Shared auth inputs still need proper `id`, `htmlFor`, `aria-invalid`, and `aria-describedby` support                 | Upgrade the shared form primitives so register fields become semantically correct by default | Codex | Done   |
| REGISTER-C011 | P2       | State model       | These field components still use mirrored local state even in controlled form usage                                  | Simplify the shared inputs to behave predictably as controlled components                    | Codex | Done   |
| REGISTER-C012 | P2       | Password controls | Password visibility support is buried in the shared component but still relies on non-semantic toggle implementation | Replace visibility toggles with accessible buttons and explicit labels/state                 | Codex | Done   |

### Implementation Order

1. Fix field semantics, validation placement, and password-guidance accessibility.
2. Clarify the registration journey and post-signup destination/expectations.
3. Extract deferred post-auth action recovery from the page into shared auth logic.
4. Align phone input and auth field primitives into one coherent form system.
5. Clean up auth-page code drift and route inconsistencies.

### Re-audit Checklist For Register

- Users understand who should self-register and what happens next.
- Validation feedback is consistent, local, and accessible.
- Password rules are visible and usable without fragile hover/focus behavior.
- Phone-number expectations are clear.
- Post-registration routing is intentional.
- Shared auth fields are semantically correct and consistent.

---

## Student Dashboard Audit

### Page Summary

- Route: `/student`
- Source: `src/pages/StudentDashboard.jsx`
- Related components:
    - `src/components/ui/dashboard/DashboardLayout.jsx`
    - `src/components/ui/dashboard/DashboardHeader.jsx`
    - `src/components/ui/dashboard/DashboardTabs.jsx`
    - `src/features/student-dashboard/components/tabs/OverviewTab.jsx`
    - `src/features/student-dashboard/components/tabs/CoursesTab.jsx`
    - `src/features/student-dashboard/components/tabs/ScheduleTab.jsx`
    - `src/features/student-dashboard/components/tabs/ResourcesTab.jsx`
    - `src/features/student-dashboard/components/tabs/TasksTab.jsx`
    - `src/features/student-dashboard/components/tabs/ProgressTab.jsx`
    - `src/features/student-dashboard/components/tabs/ProfileTab.jsx`
    - `src/features/student-dashboard/components/ChatTab.jsx`
    - `src/features/student-dashboard/components/shared/StudentEmptyState.jsx`
    - `src/features/student-dashboard/components/shared/StudentPanelEmpty.jsx`
    - `src/features/leaderboard/components/LeaderboardHub.jsx`
    - `src/features/notifications/components/NotificationsTab.jsx`

### Audit Summary

The Student Dashboard is significantly more structured than the public pages, but it is carrying too much orchestration in one page component and is starting to show scaling strain. The strongest aspects are the standardized dashboard shell and clearer tab separation. The biggest issues are page-level state complexity, duplicated loading/reload logic, inconsistent tab data ownership, and a few UX tensions around access gating, live refresh behavior, and cross-tab mental model clarity.

### Detailed Tasks

| ID          | Severity | Area                   | Issue                                                                                                                                                                                      | Task                                                                                                                             | Owner | Status      |
| ----------- | -------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- | ----- | ----------- |
| STUDENT-001 | P1       | Architecture           | `StudentDashboard.jsx` owns too many concerns: routing state, tab loading, polling, filters, data fetching, profile save flows, task submission, access gating, and render branching       | Split the page into dedicated data hooks and tab controllers so the top-level component becomes orchestration-only               | TBD   | Not started |
| STUDENT-002 | P1       | State design           | Tab data loading is handled through a large shared state bag with many interdependent effects                                                                                              | Introduce a clearer tab data model with isolated loaders/cache ownership per domain instead of one monolithic page state machine | TBD   | Not started |
| STUDENT-003 | P2       | UX clarity             | The dashboard combines overview, course discovery, schedule, resources, tasks, progress, leaderboard, notifications, profile, and chat, but cross-tab relationships are not always obvious | Clarify tab responsibilities and add stronger cross-tab wayfinding so users understand where to act versus where to monitor      | TBD   | Not started |
| STUDENT-004 | P2       | Access gating          | The `hasActiveStudentAccess` guard is pragmatic but opaque, so “empty state vs gated state vs unloaded state” can blur together                                                            | Make access-state logic and resulting empty-state messaging more explicit and explain why a student is blocked or sees no data   | TBD   | Not started |
| STUDENT-005 | P2       | Performance / Behavior | The tasks tab uses repeated polling plus focus/visibility listeners, which can become noisy and hard to reason about                                                                       | Rework task refresh strategy to a more deliberate real-time or refresh-on-demand model with clearer intervals/ownership          | TBD   | Not started |
| STUDENT-006 | P2       | Accessibility          | Keyboard shortcut logic is custom and page-specific, which can drift from the shared dashboard shell                                                                                       | Consolidate dashboard-wide keyboard/skip-navigation behavior into shared infrastructure instead of per-page listeners            | TBD   | Not started |

### Component Audit Breakdown

#### `StudentDashboard.jsx`

| ID           | Severity | Area             | Issue                                                                                                                               | Task                                                                                                                            | Owner | Status      |
| ------------ | -------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ----- | ----------- |
| STUDENT-C001 | P1       | Complexity       | The page is carrying a very large number of states, callbacks, effects, and derived values                                          | Break the page into domain hooks such as `useStudentOverview`, `useStudentTasks`, `useStudentProfile`, and `useStudentTabState` | TBD   | Not started |
| STUDENT-C002 | P2       | URL/state sync   | URL params, active tab, course filter, and group filter are synchronized through multiple effects, increasing drift risk            | Centralize URL-to-dashboard-state sync and reduce repeated effect-based reconciliation                                          | TBD   | Not started |
| STUDENT-C003 | P2       | Refresh behavior | Task polling every 5 seconds plus focus/visibility refresh is aggressive and could feel jumpy or wasteful                           | Replace with event-driven refresh, manual refresh, or slower intelligent polling with visible refresh cues                      | TBD   | Not started |
| STUDENT-C004 | P2       | Feedback UX      | Many async flows rely on toasts without corresponding inline state changes, especially for access/loading edge cases                | Add more local inline status messaging where it improves task clarity and reduces toast dependency                              | TBD   | Not started |
| STUDENT-C005 | P3       | Consistency      | The page imports and coordinates some areas directly while others are delegated fully to tabs, creating uneven ownership boundaries | Normalize what belongs in tabs versus what belongs in the page-level controller                                                 | TBD   | Not started |

#### `DashboardLayout.jsx`

| ID           | Severity | Area           | Issue                                                                                                                | Task                                                                                                                     | Owner | Status      |
| ------------ | -------- | -------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ----- | ----------- |
| STUDENT-C006 | P2       | Responsiveness | Layout responsiveness depends on a resize listener and local `isMobile` state rather than purely CSS-driven behavior | Revisit whether some shell layout branching can be simplified and made more resilient with CSS-first responsive patterns | TBD   | Not started |
| STUDENT-C007 | P3       | Shared UX      | Dashboard shell is strong, but keyboard/skip behavior still depends on page-level additions elsewhere                | Consolidate navigation shortcuts and focus affordances into the shell where possible                                     | TBD   | Not started |

#### `OverviewTab.jsx`

| ID           | Severity | Area              | Issue                                                                                                                                                    | Task                                                                                                               | Owner | Status      |
| ------------ | -------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ----- | ----------- |
| STUDENT-C008 | P2       | Cognitive load    | Overview is rich and useful, but it is accumulating many concepts at once: next session, video continuation, stats, tasks, attendance, and notifications | Rebalance the overview to emphasize the few highest-priority actions per student context                           | TBD   | Not started |
| STUDENT-C009 | P2       | Live behavior     | The one-second timer for countdown/state freshness increases motion and state churn in the overview surface                                              | Review whether per-second live updates are necessary everywhere or only for join-window-critical elements          | TBD   | Not started |
| STUDENT-C010 | P2       | Content hierarchy | The hero copy changes intelligently by modality, but the rest of the page may not always reinforce that same mode-specific story                         | Tighten modality-specific overview variants so video learners and session learners see clearer tailored priorities | TBD   | Not started |

#### `CoursesTab.jsx`

| ID           | Severity | Area            | Issue                                                                                                                    | Task                                                                                                                     | Owner | Status      |
| ------------ | -------- | --------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ | ----- | ----------- |
| STUDENT-C011 | P2       | Product framing | The tab mixes self-serve video courses and scheduled delivery courses in one card system, which weakens comparability    | Consider stronger mode separation or clearer visual differentiation between self-paced and cohort/schedule-based courses | TBD   | Not started |
| STUDENT-C012 | P2       | Discovery UX    | Search/filter controls are useful, but the results area still depends on relatively dense cards with mixed action models | Refine card scanability and clarify the primary action for each course type                                              | TBD   | Not started |
| STUDENT-C013 | P3       | Asset strategy  | The tab relies on a remote fallback cover image URL, which creates unnecessary external dependency in-app                | Replace with a local fallback asset or generated placeholder                                                             | TBD   | Not started |

#### `TasksTab.jsx`

| ID           | Severity | Area           | Issue                                                                                                                                                       | Task                                                                                              | Owner | Status      |
| ------------ | -------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ----- | ----------- |
| STUDENT-C014 | P1       | Task UX        | The tab supports many task states and submission paths, but the surface is becoming operationally dense                                                     | Simplify the task UI hierarchy and reduce the amount of decision-making visible at once           | TBD   | Not started |
| STUDENT-C015 | P2       | Accessibility  | File preview, submission drafting, filters, and expanded task content create a complex interactive environment that needs careful keyboard and focus review | Run a dedicated accessibility pass for modal, preview, and expanded-task interactions             | TBD   | Not started |
| STUDENT-C016 | P2       | Error handling | Submission validation is solid, but some failure/success states still rely heavily on toasts instead of stable inline cues                                  | Add inline submission-state indicators and clearer draft/attachment feedback near the active task | TBD   | Not started |

#### `ProfileTab.jsx`

| ID           | Severity | Area                   | Issue                                                                                                          | Task                                                                                                            | Owner | Status      |
| ------------ | -------- | ---------------------- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ----- | ----------- |
| STUDENT-C017 | P2       | Form consistency       | Profile editing uses a different field system from auth forms and partially different validation patterns      | Align profile field behaviors and validation patterns with a shared form system where appropriate               | TBD   | Not started |
| STUDENT-C018 | P2       | Security UX            | Password change is embedded directly into profile edit mode, which can blur account-editing and security tasks | Consider separating profile info editing from password/security management more clearly                         | TBD   | Not started |
| STUDENT-C019 | P3       | Notification ownership | Profile and notifications are combined in one workspace, which is workable but may dilute clarity as both grow | Re-evaluate whether notifications should remain here or become their own full workspace with clearer boundaries | TBD   | Not started |

### Implementation Order

1. Decompose `StudentDashboard.jsx` into focused data/state hooks and reduce page-level orchestration complexity.
2. Clarify access-state, loading-state, and refresh behavior across tabs.
3. Rebalance tab responsibilities and improve wayfinding between overview, courses, schedule, resources, and tasks.
4. Simplify high-density surfaces like `TasksTab` and strengthen inline state feedback.
5. Consolidate shared dashboard accessibility and keyboard behaviors into the shell.

### Re-audit Checklist For Student Dashboard

- The page shell and tabs have clear ownership boundaries.
- Access-gated, empty, loading, and loaded states are clearly distinguishable.
- Task refresh behavior feels intentional rather than noisy.
- Overview prioritizes the most important next actions for each learner type.
- Course, task, and profile surfaces are keyboard-friendly and semantically clear.
- Dashboard logic is modular enough to scale without turning the page into a monolith.

---

## Instructor Dashboard Audit

### Page Summary

- Route: `/instructor`
- Source: `src/pages/InstructorDashboard.jsx`
- Related components:
    - `src/components/ui/dashboard/DashboardLayout.jsx`
    - `src/components/ui/dashboard/DashboardHeader.jsx`
    - `src/components/ui/dashboard/DashboardTabs.jsx`
    - `src/features/instructor-dashboard/components/InstructorOverviewSection.jsx`
    - `src/features/instructor-dashboard/components/CoursesSection.jsx`
    - `src/features/instructor-dashboard/components/StudentsSection.jsx`
    - `src/features/instructor-dashboard/components/GroupsSection.jsx`
    - `src/features/instructor-dashboard/components/OfferingsSection.jsx`
    - `src/features/instructor-dashboard/components/CertificatesSection.jsx`
    - `src/features/instructor-dashboard/components/ProfileSection.jsx`
    - `src/features/instructor-dashboard/components/AiSection.jsx`
    - `src/features/instructor-dashboard/components/ChatTab.jsx`
    - Embedded routed workspaces surfaced via tabs:
        - `src/pages/Attendance.jsx`
        - `src/pages/SessionWorkspace.jsx`
        - `src/pages/InstructorAnalytics.jsx`
        - `src/pages/InternalLeaderboard.jsx`
        - `src/pages/InstructorHomework.jsx`

### Audit Summary

The Instructor Dashboard is one of the richest product surfaces in the app, but it is also one of the heaviest page controllers. It inherits the stronger shared dashboard shell, yet the page-level orchestration has grown into a large operational hub that coordinates profile, courses, students, certificates, groups, offerings, analytics, attendance, homework, and embedded sub-workspaces. The biggest issues are controller complexity, blurred ownership between “dashboard tab” and “standalone workspace”, and inconsistent depth across sections.

### Detailed Tasks

| ID             | Severity | Area                          | Issue                                                                                                                             | Task                                                                                                                                 | Owner | Status      |
| -------------- | -------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ----- | ----------- |
| INSTRUCTOR-001 | P1       | Architecture                  | `InstructorDashboard.jsx` orchestrates too many operational domains in one page controller                                        | Split the page into dedicated domain controllers/hooks for courses, students, certificates, profile, and navigation state            | TBD   | Not started |
| INSTRUCTOR-002 | P1       | Product structure             | The dashboard mixes summary tabs with deeply operational workspaces like attendance, sessions, homework, and analytics            | Re-evaluate the information architecture so “dashboard overview” and “workbench/workspace” concerns are more intentionally separated | TBD   | Not started |
| INSTRUCTOR-003 | P2       | State ownership               | Loading, fetching, and refresh behavior are unevenly distributed between page-level logic and section components                  | Normalize ownership boundaries so each domain owns its own fetch/update cycle more cleanly                                           | TBD   | Not started |
| INSTRUCTOR-004 | P2       | UX consistency                | Some tabs behave like lightweight dashboard panels while others behave like full applications embedded inside the dashboard shell | Define explicit tab categories and layout expectations so switching between tabs feels coherent                                      | TBD   | Not started |
| INSTRUCTOR-005 | P2       | Accessibility                 | Keyboard shortcut logic is again implemented in the page controller instead of being fully shared by the dashboard shell          | Consolidate dashboard-wide keyboard/focus infrastructure into shared layout behavior                                                 | TBD   | Not started |
| INSTRUCTOR-006 | P2       | Performance / Maintainability | Re-fetching full course lists after many actions is pragmatic but expensive and increases coupling                                | Move toward more localized cache updates or domain-level refresh strategies instead of broad global reloads                          | TBD   | Not started |

### Component Audit Breakdown

#### `InstructorDashboard.jsx`

| ID              | Severity | Area              | Issue                                                                                                                             | Task                                                                                                                                                                        | Owner | Status      |
| --------------- | -------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ----------- |
| INSTRUCTOR-C001 | P1       | Complexity        | The page owns too many slices of domain state, side effects, and mutation flows                                                   | Extract focused hooks such as `useInstructorCourses`, `useInstructorStudents`, `useInstructorCertificates`, and `useInstructorTabState` into stronger top-level composition | TBD   | Not started |
| INSTRUCTOR-C002 | P2       | Navigation design | The current tab model collapses dashboard overview and operational tool surfaces into the same primary navigation layer           | Rework the instructor IA so high-frequency workspaces and overview/navigation functions are separated more deliberately                                                     | TBD   | Not started |
| INSTRUCTOR-C003 | P2       | Refresh behavior  | Many mutations trigger broad course-list reloads and cross-domain refreshes                                                       | Replace broad re-fetch patterns with narrower refresh scopes where possible                                                                                                 | TBD   | Not started |
| INSTRUCTOR-C004 | P2       | Feedback UX       | The page relies heavily on toasts while many long-running operations would benefit from stronger inline or section-local feedback | Add more visible inline action state for high-stakes operations like course submission, certificate actions, and delivery-course updates                                    | TBD   | Not started |
| INSTRUCTOR-C005 | P3       | Shared behavior   | The page duplicates the same global keyboard shortcut approach seen in the student dashboard                                      | Move shortcut handling into the shared dashboard framework instead of repeating it per page                                                                                 | TBD   | Not started |

#### `DashboardLayout.jsx`

| ID              | Severity | Area         | Issue                                                                                                              | Task                                                                                                     | Owner | Status      |
| --------------- | -------- | ------------ | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- | ----- | ----------- |
| INSTRUCTOR-C006 | P3       | Shared shell | The layout is a net positive, but responsive branching and shared keyboard behavior still have room to consolidate | Continue maturing the dashboard shell as the canonical place for layout and accessibility infrastructure | TBD   | Not started |

#### `InstructorOverviewSection.jsx`

| ID              | Severity | Area             | Issue                                                                                                                                                  | Task                                                                                                                                   | Owner | Status      |
| --------------- | -------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- | ----- | ----------- |
| INSTRUCTOR-C007 | P2       | Overview clarity | The overview is visually strong, but it leans heavily on navigation and high-level stats rather than surfacing concrete instructor risks or priorities | Add more operationally meaningful overview signals such as pending reviews, student risk, attendance gaps, or course approval blockers | TBD   | Not started |
| INSTRUCTOR-C008 | P3       | Mobile parity    | Mobile overview delegates to a separate `MobileDashboardOverview` path, which may drift from the desktop overview model                                | Review mobile/desktop parity and ensure overview logic remains aligned across both surfaces                                            | TBD   | Not started |

#### `CoursesSection.jsx`

| ID              | Severity | Area            | Issue                                                                                                        | Task                                                                                                                  | Owner | Status      |
| --------------- | -------- | --------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- | ----- | ----------- |
| INSTRUCTOR-C009 | P2       | Product framing | Video courses and delivery courses are handled together, but their management workflows differ substantially | Consider stronger segmentation between self-paced course management and delivery-course/group workflows               | TBD   | Not started |
| INSTRUCTOR-C010 | P2       | Action density  | Each course card carries status, metrics, view/edit flows, and submission actions, which can become crowded  | Simplify the course-card action model and make primary next actions more explicit by course state                     | TBD   | Not started |
| INSTRUCTOR-C011 | P3       | Modal ownership | The section wrapper also conditionally owns delivery-course modals, which muddies section responsibility     | Consider lifting modal orchestration or encapsulating it more clearly within a dedicated course-management controller | TBD   | Not started |

#### `StudentsSection.jsx`

| ID              | Severity | Area           | Issue                                                                                                                                 | Task                                                                                                         | Owner | Status      |
| --------------- | -------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ----- | ----------- |
| INSTRUCTOR-C012 | P2       | Flow clarity   | The section starts with course selection and then becomes a student-management workspace, which is effective but context-switch heavy | Make the transition from “pick a course” to “manage students” more explicit and easier to reverse            | TBD   | Not started |
| INSTRUCTOR-C013 | P2       | UX scalability | The section combines selection, stats, filters, and a student table in one flow that may become heavy as data grows                   | Review filter/table density and prioritize the most important student-management actions for faster scanning | TBD   | Not started |
| INSTRUCTOR-C014 | P3       | Asset strategy | The section relies on a remote fallback course-cover URL                                                                              | Replace remote fallback imagery with local placeholders or generated fallbacks                               | TBD   | Not started |

#### `ProfileSection.jsx`

| ID              | Severity | Area             | Issue                                                                                                                                  | Task                                                                                     | Owner | Status      |
| --------------- | -------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ----- | ----------- |
| INSTRUCTOR-C015 | P2       | Form UX          | Profile editing is workable, but long-form bio, expertise, and social-link editing still feel like a generic form dump                 | Improve information grouping, validation, and guidance for public-facing profile content | TBD   | Not started |
| INSTRUCTOR-C016 | P2       | Trust / Brand UX | This profile is likely student-facing, but the section does not strongly frame how profile quality affects course trust and enrollment | Add better coaching and preview framing for what students will actually see              | TBD   | Not started |

### Implementation Order

1. Decompose `InstructorDashboard.jsx` into focused domain controllers/hooks.
2. Clarify the dashboard IA so overview and deep operational workspaces are more intentionally separated.
3. Reduce broad re-fetch coupling and improve section-local loading/action feedback.
4. Simplify high-density sections like courses and students.
5. Consolidate shared dashboard accessibility and keyboard behavior into the layout layer.

### Re-audit Checklist For Instructor Dashboard

- The page controller is modular rather than monolithic.
- Overview and operational workspaces have clearer boundaries.
- Loading and mutation feedback are visible at the right local level.
- Course and student management flows scale cleanly with more data.
- Shared dashboard keyboard/accessibility behavior is not duplicated at page level.
- Navigation between tabs feels coherent despite differing workspace depth.

---

## Admin Dashboard Audit

### Page Summary

- Route: `/admin`
- Source:
    - `src/pages/Admin.jsx`
    - `src/features/admin/pages/AdminPanel.jsx`
- Related components:
    - `src/components/ui/dashboard/DashboardLayout.jsx`
    - `src/components/ui/dashboard/DashboardHeader.jsx`
    - `src/components/ui/dashboard/DashboardTabs.jsx`
    - `src/features/admin/components/AdminStatsTab.jsx`
    - `src/features/admin/components/AdminUsersTab.jsx`
    - `src/features/admin/components/AdminCoursesTab.jsx`
    - `src/features/admin/components/AdminCompaniesTab.jsx`
    - `src/features/admin/components/AdminSkillsTab.jsx`
    - `src/features/admin/components/AdminAiPromptsTab.jsx`
    - `src/features/admin/components/AdminContactsTab.jsx`
    - `src/features/admin/components/AdminPendingCoursesTab.jsx`
    - Shared/embedded operational surfaces:
        - `src/features/integration/components/IntegrationTab.jsx`
        - `src/pages/Attendance.jsx`
        - `src/pages/AdminAnalytics.jsx`
        - `src/features/instructor-dashboard/components/CertificatesSection.jsx`

### Audit Summary

The Admin dashboard is the most operationally dense control surface in the product. It benefits from the shared dashboard shell, but the page controller has become a large all-in-one admin workbench responsible for users, courses, companies, skills, AI prompts, contacts, pending approvals, analytics, attendance, integrations, certificates, and video-transcoding operations. The biggest issues are controller sprawl, inconsistent domain boundaries, and the risk that critical admin actions become too hard to reason about or verify in context.

### Detailed Tasks

| ID        | Severity | Area              | Issue                                                                                                                                                                         | Task                                                                                                                                       | Owner | Status      |
| --------- | -------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ----- | ----------- |
| ADMIN-001 | P1       | Architecture      | `AdminPanel.jsx` is handling too many unrelated admin domains in one page controller                                                                                          | Split admin into stronger domain controllers/hooks for users, courses, companies, AI prompts, certificates, and analytics/navigation state | TBD   | Not started |
| ADMIN-002 | P1       | Product structure | The admin dashboard blends high-level oversight with dangerous operational tooling and deep technical controls in one navigation layer                                        | Rework the admin IA so governance/overview, content operations, and technical tooling are separated more intentionally                     | TBD   | Not started |
| ADMIN-003 | P2       | Action safety     | Many admin actions are high-impact, but the surface still relies heavily on toasts and inline buttons without always providing enough context, review, or recovery affordance | Add stronger inline confirmation, clearer state transitions, and safer local feedback for destructive or high-impact admin actions         | TBD   | Not started |
| ADMIN-004 | P2       | State ownership   | Data loading and mutation patterns are centralized in the page rather than owned by the relevant admin domains                                                                | Move toward tab/domain-owned loading and refresh boundaries to reduce coupling                                                             | TBD   | Not started |
| ADMIN-005 | P2       | Accessibility     | Keyboard shortcut logic is again implemented in the page controller instead of being fully shared by the dashboard shell                                                      | Consolidate dashboard-wide accessibility/keyboard behavior into shared infrastructure                                                      | TBD   | Not started |
| ADMIN-006 | P2       | Scalability       | The admin page is accumulating operational features faster than its layout and information architecture are evolving                                                          | Define explicit admin-surface design principles for density, action hierarchy, and safe operations before adding more tabs                 | TBD   | Not started |

### Component Audit Breakdown

#### `Admin.jsx`

| ID         | Severity | Area      | Issue                                                                                                         | Task                                                                      | Owner | Status      |
| ---------- | -------- | --------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----- | ----------- |
| ADMIN-C001 | P3       | Structure | `src/pages/Admin.jsx` is now a thin forwarding wrapper, which is fine but should remain intentionally minimal | Keep this file as a stable route entry and avoid reintroducing logic here | TBD   | Not started |

#### `AdminPanel.jsx`

| ID         | Severity | Area              | Issue                                                                                                                                                                          | Task                                                                                                                          | Owner | Status      |
| ---------- | -------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- | ----- | ----------- |
| ADMIN-C002 | P1       | Complexity        | The page controller contains a very large amount of state, loading logic, action handlers, and tab rendering                                                                   | Break it into focused hooks/controllers per admin domain and reduce the page to orchestration plus layout                     | TBD   | Not started |
| ADMIN-C003 | P2       | Navigation design | The current tab model puts stats, users, courses, technical video tooling, companies, AI prompts, contacts, certificates, attendance, analytics, and integrations at one level | Re-evaluate the tab hierarchy and group related admin capabilities more clearly                                               | TBD   | Not started |
| ADMIN-C004 | P2       | Feedback UX       | High-impact actions still resolve mainly through toast feedback, which is insufficient for many admin workflows                                                                | Add more inline operation status, last-updated cues, and visible success/failure context in the relevant tab                  | TBD   | Not started |
| ADMIN-C005 | P2       | Reuse strategy    | There are existing admin hooks like `useAdminTabState` and `useAdminUsersFilters`, but the page still carries a large amount of duplicated state logic                         | Either adopt the admin hooks more fully or simplify/remove partial abstractions that are not meaningfully reducing complexity | TBD   | Not started |
| ADMIN-C006 | P3       | Shared behavior   | The page repeats dashboard keyboard shortcut handling seen elsewhere                                                                                                           | Move shared keyboard navigation into the dashboard shell instead of repeating it here                                         | TBD   | Not started |

#### `AdminStatsTab.jsx`

| ID         | Severity | Area                | Issue                                                                                                                                               | Task                                                                                             | Owner | Status      |
| ---------- | -------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ----- | ----------- |
| ADMIN-C007 | P2       | Information density | The stats tab is visually organized, but it still packs many metrics and trend surfaces into one screen                                             | Review metric prioritization and make sure the most important governance signals stand out first | TBD   | Not started |
| ADMIN-C008 | P3       | Content consistency | Some labels and time windows are clear, but the tab would benefit from stronger explanatory framing for what actions should follow from the numbers | Add light interpretation or next-step context where it helps decision-making                     | TBD   | Not started |

#### `AdminUsersTab.jsx`

| ID         | Severity | Area      | Issue                                                                                                           | Task                                                                                                  | Owner | Status      |
| ---------- | -------- | --------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ----- | ----------- |
| ADMIN-C009 | P2       | Safety UX | Role changes and deletion actions are easy to access, which is efficient but risky in a high-impact admin table | Review confirmation, auditability, and role-change safety affordances for user-management actions     | TBD   | Not started |
| ADMIN-C010 | P2       | Density   | Filtering, paging, role changes, and destructive actions all live in one list surface                           | Improve action hierarchy so high-frequency actions and destructive actions are more clearly separated | TBD   | Not started |

#### `AdminCoursesTab.jsx`

| ID         | Severity | Area               | Issue                                                                                                                    | Task                                                                                                                    | Owner | Status      |
| ---------- | -------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- | ----- | ----------- |
| ADMIN-C011 | P1       | Product structure  | This tab is mixing catalog governance, enrollments, categories, and technical video transcoding operations in one place  | Split content governance from technical media operations or introduce clearer sub-sections with stronger boundaries     | TBD   | Not started |
| ADMIN-C012 | P2       | Operational safety | Technical transcoding controls are powerful but complex and could be error-prone without stronger guardrails and context | Add clearer contextual guidance, safer batching UX, and more explicit status/history feedback for transcoding workflows | TBD   | Not started |
| ADMIN-C013 | P2       | Cognitive load     | The tab packs too many responsibilities into one surface, raising comprehension cost for admins                          | Reduce density or segment the tab into clearer workflows                                                                | TBD   | Not started |

#### `AdminCompaniesTab.jsx`

| ID         | Severity | Area             | Issue                                                                                                                             | Task                                                                                                                      | Owner | Status      |
| ---------- | -------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ----- | ----------- |
| ADMIN-C014 | P2       | Workflow clarity | Company creation, editing, logo upload, and course assignment are all present, but the workflow may feel fragmented as data grows | Rework the company-management flow to make editing, branding, and course linkage feel like one coherent company workspace | Codex | Done        |
| ADMIN-C015 | P3       | Density          | The tab currently surfaces several operations but may need stronger grouping and pagination/search scaling if company count grows | Plan for scaling beyond the current small-list assumption                                                                 | TBD   | Not started |

### Implementation Order

1. Decompose `AdminPanel.jsx` into focused admin-domain controllers/hooks.
2. Redesign the admin information architecture so governance, operational workflows, and technical tooling are more clearly separated.
3. Improve action safety and inline feedback for destructive or high-impact admin operations.
4. Simplify dense tabs like users and courses, especially where technical controls and governance actions collide.
5. Consolidate shared dashboard accessibility and keyboard behavior into the shell.

### Re-audit Checklist For Admin Dashboard

- The admin controller is modular instead of all-in-one.
- Navigation groups related admin capabilities coherently.
- Dangerous actions have sufficient confirmation and visible state feedback.
- Technical tooling is separated enough from routine governance actions.
- Dense tabs remain understandable and operable as data volume grows.
- Shared dashboard keyboard/accessibility behavior is not duplicated at page level.

---

## Setup Account Page Audit

### Page Summary

- Route: `/setup-account`
- Source: `src/pages/SetupAccount.jsx`
- Related components:
    - `src/shared/ui/forms/LabelPassword.jsx`
    - `src/app/layouts/MainLayout.jsx`

### Audit Summary

The setup-account page is functionally straightforward, but it still behaves like an isolated auth utility rather than a polished onboarding surface. The main issues are weak invalid/expired-token handling, limited password-guidance UX, and shared form-control accessibility problems inherited from `LabelPassword.jsx`.

### Detailed Tasks

| ID        | Severity | Area                | Issue                                                                                                   | Task                                                                                                                           | Owner | Status      |
| --------- | -------- | ------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ----- | ----------- |
| SETUP-001 | P1       | Error-state UX      | Missing or expired setup tokens collapse into a small inline error instead of a dedicated recovery path | Add explicit invalid-token and expired-link states with recovery actions such as requesting a new invite or returning to login | TBD   | Not started |
| SETUP-002 | P1       | Accessibility       | Password fields rely on a shared control that uses a clickable non-button visibility toggle             | Refactor `LabelPassword.jsx` so visibility toggles are semantic buttons with accessible names and keyboard support             | Codex | Done        |
| SETUP-003 | P2       | Onboarding UX       | The page gives little reassurance about whose account is being activated or what happens next           | Add contextual trust cues such as account email, expected next step, and clearer post-success destination framing              | TBD   | Not started |
| SETUP-004 | P2       | Validation UX       | Password requirements are enforced only after submit and are minimally explained                        | Surface password rules before submission and give inline confirmation/mismatch feedback while typing                           | TBD   | Not started |
| SETUP-005 | P2       | Layout design       | The auth split-screen visual is serviceable but generic and not well tied to onboarding intent          | Rework the visual hierarchy so the setup action is the focus and the illustration panel feels less like a reused signup shell  | TBD   | Not started |
| SETUP-006 | P3       | Content consistency | The page mixes LMS language, CRM language, and generic auth copy without a strong onboarding voice      | Standardize copy around one clear invitation/setup narrative                                                                   | TBD   | Not started |

### Component Audit Breakdown

#### `SetupAccount.jsx`

| ID         | Severity | Area           | Issue                                                                                                          | Task                                                                                              | Owner | Status      |
| ---------- | -------- | -------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ----- | ----------- |
| SETUP-C001 | P1       | Recovery UX    | The page disables submit without giving a strong alternate path when no token exists                           | Replace the passive disabled-state experience with a dedicated recovery block and support actions | TBD   | Not started |
| SETUP-C002 | P2       | Async feedback | Loading state exists on submit, but there is no persistent success or failure framing beyond toast/inline text | Improve success and failure messaging with more visible page-level feedback                       | TBD   | Not started |
| SETUP-C003 | P2       | Responsive UI  | The left illustration panel uses large fixed imagery and typography that can feel oversized on medium widths   | Review split-layout proportions and make the visual side more fluid                               | TBD   | Not started |

#### `LabelPassword.jsx`

| ID         | Severity | Area           | Issue                                                                                                                  | Task                                                                           | Owner | Status      |
| ---------- | -------- | -------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ----- | ----------- |
| SETUP-C004 | P1       | Accessibility  | Password visibility is controlled by a clickable `div` rather than a button                                            | Replace it with a semantic button including accessible label and pressed state | TBD   | Not started |
| SETUP-C005 | P2       | Form behavior  | The component duplicates local state around externally controlled value props, increasing complexity and risk of drift | Simplify the component into a clearly controlled input pattern                 | TBD   | Not started |
| SETUP-C006 | P2       | Label behavior | Floating-label and asterisk logic is decorative but not especially informative for validation state                    | Simplify label behavior and connect required/error messaging more clearly      | TBD   | Not started |

### Implementation Order

1. Fix `LabelPassword.jsx` accessibility and controlled-input behavior.
2. Redesign invalid-token, expired-link, and success states in `SetupAccount.jsx`.
3. Improve password guidance and onboarding copy.
4. Refine the split-screen auth layout for better focus and responsiveness.

### Re-audit Checklist For Setup Account

- Invalid or expired links produce a clear recovery path.
- Password controls are fully keyboard accessible and screen-reader friendly.
- Password rules and mismatch states are visible before submit.
- The page clearly explains what account is being prepared and what happens next.

---

## Profile Page Audit

### Page Summary

- Route: `/profile`
- Source: `src/pages/Profile.jsx`
- Related components:
    - `src/shared/ui/forms/PhoneInput.jsx`
    - `src/shared/ui/Loader.jsx`

### Audit Summary

The profile page is functional but overloaded. It mixes base account settings, avatar upload, password changes, and instructor-facing public-profile editing in one long surface, which makes the experience harder to scan and harder to maintain. The biggest issues are weak separation between account and instructor concerns, inconsistent form semantics, and coarse loading/save feedback.

### Detailed Tasks

| ID          | Severity | Area                     | Issue                                                                                                                                              | Task                                                                                                       | Owner | Status      |
| ----------- | -------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----- | ----------- |
| PROFILE-001 | P1       | Information architecture | Account settings and instructor public-profile management are merged into one uninterrupted page                                                   | Split the page into clearer sections or tabs for account, security, and instructor/public profile concerns | TBD   | Not started |
| PROFILE-002 | P1       | Accessibility            | Many fields use visible labels without consistent `htmlFor`, helper text wiring, or explicit error associations                                    | Normalize form semantics so labels, helper text, validation, and disabled states are correctly wired       | TBD   | Not started |
| PROFILE-003 | P2       | Save-state UX            | The page relies heavily on toasts and button disablement rather than strong inline save status, dirty-state explanation, or section-level feedback | Add section-local success/error states, unsaved-change cues, and clearer save/cancel behavior              | TBD   | Not started |
| PROFILE-004 | P2       | Security UX              | Password change lives inside general profile editing with minimal framing or feedback                                                              | Move password changes into a dedicated security section with clearer rules and confirmation states         | TBD   | Not started |
| PROFILE-005 | P2       | Data integrity           | Social links are rendered and submitted with limited normalization or validation                                                                   | Add URL validation, normalization, and preview behavior for instructor public links                        | TBD   | Not started |
| PROFILE-006 | P2       | Mobile UX                | The long stacked profile/editor layout is likely to feel heavy on mobile, especially with instructor extras                                        | Rework spacing, grouping, and section collapse behavior for smaller screens                                | TBD   | Not started |

### Component Audit Breakdown

#### `Profile.jsx`

| ID           | Severity | Area                   | Issue                                                                                                                                                       | Task                                                                                                              | Owner | Status      |
| ------------ | -------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----- | ----------- |
| PROFILE-C001 | P1       | Complexity             | The page owns account fetch, account update, avatar preview, password edits, instructor-profile fetch, and instructor-profile update logic in one component | Extract focused hooks or section controllers for account profile and instructor profile concerns                  | TBD   | Not started |
| PROFILE-C002 | P2       | Loading UX             | Instructor profile loading is represented by a small inline loader inside the header area                                                                   | Introduce stronger skeleton/loading states so the instructor section does not feel partially broken while loading | TBD   | Not started |
| PROFILE-C003 | P2       | Public-profile framing | Instructor information is editable, but the page does not clearly show what students will actually see                                                      | Add stronger preview framing or “student-facing profile” context for trust-building fields                        | TBD   | Not started |
| PROFILE-C004 | P3       | Data model clarity     | `numberOfStudents` is displayed in the view state even though it is not part of the normalized local profile state                                          | Align displayed fields with the actual normalized profile shape and clean up data-contract drift                  | TBD   | Not started |

#### `PhoneInput.jsx`

| ID           | Severity | Area       | Issue                                                                                                 | Task                                                                                                    | Owner | Status      |
| ------------ | -------- | ---------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ----- | ----------- |
| PROFILE-C005 | P2       | Input UX   | The phone field is a minimal raw tel input with strict character filtering but little formatting help | Upgrade to a more guided phone-input pattern with country-aware formatting and clearer validation hints | TBD   | Not started |
| PROFILE-C006 | P2       | API design | The component accepts only a narrow prop surface, making it harder to reuse semantically across forms | Expand support for `id`, `aria-*`, helper text, error state, and className overrides consistently       | TBD   | Not started |

### Implementation Order

1. Split `Profile.jsx` into clearer account, security, and instructor-profile concerns.
2. Normalize form semantics and improve inline validation/save feedback.
3. Strengthen phone and social-link input behavior.
4. Add better instructor public-profile framing and mobile layout refinement.

### Re-audit Checklist For Profile

- Account and instructor concerns are clearly separated.
- Forms have correct semantics, helper text, and validation wiring.
- Save and loading feedback are visible within each section, not only via toasts.
- Instructor fields make it clear what is student-facing.

---

## Cart Page Audit

### Page Summary

- Route: `/cart`
- Source: `src/pages/Cart.jsx`
- Related components:
    - `src/shared/ui/BasicModal.jsx`
    - `src/features/courses/components/ContactCourseModal.jsx`
    - `src/shared/ui/UnauthModal.jsx`
    - `src/shared/ui/Loader.jsx`

### Audit Summary

The cart page is usable, but it still feels like a provisional conversion surface rather than a polished checkout-prep experience. The biggest issues are mixed checkout paths, weak hierarchy between cart contents and the order summary, and several interaction patterns that are fragile or misleading when authentication and purchase intent intersect.

### Detailed Tasks

| ID       | Severity | Area                  | Issue                                                                                                                         | Task                                                                                                                      | Owner | Status      |
| -------- | -------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ----- | ----------- |
| CART-001 | P1       | Conversion UX         | The page ends in a generic contact modal instead of a clear purchase, enrollment, or lead-handoff flow                        | Define and design one explicit checkout or sales-contact path so the user knows what “buy” actually means                 | TBD   | Not started |
| CART-002 | P1       | Interaction semantics | Each cart item is wrapped in a full-card `Link` while also containing internal destructive actions                            | Refactor cart-item interaction zones so navigation and removal actions are clearly separate and semantically valid        | TBD   | Not started |
| CART-003 | P2       | Empty-state design    | The empty cart state is clean but generic and lacks personalized recovery or recommendations                                  | Improve the empty state with stronger next-step guidance and relevant discovery links                                     | TBD   | Not started |
| CART-004 | P2       | Checkout readiness    | The order summary is too lightweight for a purchase-intent page and does not explain taxes, fulfillment, or what happens next | Expand the summary to set expectations around payment/contact follow-up and enrollment outcome                            | TBD   | Not started |
| CART-005 | P2       | Auth transition UX    | Guest checkout interruption is handled through a modal, but the journey feels detached from the cart context                  | Make auth interception more explicit about what will be preserved and what the user returns to after login/signup         | TBD   | Not started |
| CART-006 | P3       | Content consistency   | Copy shifts between commerce, order, and course-contact language                                                              | Standardize terminology so the page consistently communicates whether this is a cart, order request, or lead capture flow | TBD   | Not started |

### Component Audit Breakdown

#### `Cart.jsx`

| ID        | Severity | Area             | Issue                                                                                                                | Task                                                                                             | Owner | Status      |
| --------- | -------- | ---------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ----- | ----------- |
| CART-C001 | P1       | Workflow clarity | The page contains both a register modal and an unauth modal, but only one actual unauth path is used from checkout   | Simplify auth-interruption logic and remove dead or redundant modal flows                        | TBD   | Not started |
| CART-C002 | P2       | Density          | Cart cards are visually adequate, but the summary/sidebar does not strongly anchor the primary next action           | Rework layout hierarchy so the order summary and primary CTA read as one coherent purchase block | TBD   | Not started |
| CART-C003 | P2       | Reliability      | `removeFromCart(item.id)` may be too loosely coupled if the cart source distinguishes product IDs from cart item IDs | Verify cart action identity handling and align removal with the actual cart-item data model      | TBD   | Not started |

#### `ContactCourseModal.jsx`

| ID        | Severity | Area          | Issue                                                                                                                          | Task                                                                                                               | Owner | Status      |
| --------- | -------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | ----- | ----------- |
| CART-C004 | P1       | Product fit   | The modal is course-specific, but the cart can represent multiple courses and the modal is not clearly adapted to that context | Redesign the contact modal or replace it for cart checkout so it reflects a multi-course purchase inquiry properly | TBD   | Not started |
| CART-C005 | P2       | Trust UX      | The modal presents hardcoded course metadata patterns and shows price with `$`, which conflicts with the cart’s `сом` pricing  | Align currency, metadata, and copy with the actual commerce model used elsewhere                                   | TBD   | Not started |
| CART-C006 | P2       | Accessibility | Field labels and validation messages are visible, but the form lacks stronger accessible error and focus management patterns   | Improve focus handling, error associations, and submit-result feedback inside the modal                            | TBD   | Not started |

#### `UnauthModal.jsx`

| ID        | Severity | Area                  | Issue                                                                                                                                | Task                                                                                             | Owner | Status      |
| --------- | -------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ----- | ----------- |
| CART-C007 | P2       | Auth recovery         | The modal stores pending actions in `localStorage`, but the preservation and replay behavior is not clearly communicated to the user | Explain preserved intent more clearly and validate that pending-action recovery is reliable      | TBD   | Not started |
| CART-C008 | P2       | Interaction hierarchy | “Register”, “login”, and “stay on page” actions compete visually in a compact footer row                                             | Rework action hierarchy so the primary and secondary auth choices are clearer and easier to scan | TBD   | Not started |

### Implementation Order

1. Define the real cart-to-purchase flow and redesign the primary CTA path around it.
2. Fix cart-card interaction semantics and remove redundant auth modal logic.
3. Replace or refit `ContactCourseModal.jsx` for cart context.
4. Improve the order summary, auth interception messaging, and empty state.

### Re-audit Checklist For Cart

- The page communicates one clear purchase or sales-contact journey.
- Cart items have valid interaction semantics and safe destructive actions.
- Guest users understand exactly what is preserved through auth.
- The summary explains what happens after clicking the primary CTA.

---

## Favourites Page Audit

### Page Summary

- Route: `/favourites`
- Source: `src/pages/Favourite.jsx`
- Related components:
    - `src/features/courses/components/CardCourse.jsx`
    - `src/shared/ui/Button.jsx`

### Audit Summary

The favourites page works as a basic saved-courses grid, but it is still a thin wrapper around `CardCourse` rather than a deliberate saved-items experience. The biggest issues are inconsistent localization, weak empty/error/loading-state polish, and limited utilities for managing or converting saved items into stronger purchase intent.

### Detailed Tasks

| ID      | Severity | Area                | Issue                                                                                                        | Task                                                                                               | Owner | Status      |
| ------- | -------- | ------------------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- | ----- | ----------- |
| FAV-001 | P1       | Product UX          | The page is essentially a generic course grid with no saved-items-specific controls or organization          | Design this as a real saved-items surface with clearer management, sorting, and conversion actions | TBD   | Not started |
| FAV-002 | P1       | Content consistency | The page mixes Kyrgyz, Russian, and generic auth terminology in key headings and messages                    | Standardize localization and naming across title, error, auth-gate, and empty-state copy           | TBD   | Not started |
| FAV-003 | P2       | State design        | Loading, empty, error, guest, and populated states all exist but feel visually inconsistent with one another | Create a more cohesive state system so all page states feel like one designed surface              | TBD   | Not started |
| FAV-004 | P2       | Conversion UX       | Saved courses do not have a strong next-step path into compare, cart, or enrollment                          | Add clearer next actions such as move to cart, compare, or continue browsing from favourites       | TBD   | Not started |
| FAV-005 | P3       | Scalability         | As saved-course counts grow, the page offers no filtering, ordering, or grouping                             | Add lightweight management tools before the page becomes unwieldy for active users                 | TBD   | Not started |

### Component Audit Breakdown

#### `Favourite.jsx`

| ID       | Severity | Area              | Issue                                                                                                                                              | Task                                                                                            | Owner | Status      |
| -------- | -------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ----- | ----------- |
| FAV-C001 | P1       | State polish      | The guest, loading, error, empty, and populated states use different layout density and voice, making the page feel assembled rather than designed | Normalize state layouts, spacing, and language so the page feels coherent across all conditions | TBD   | Not started |
| FAV-C002 | P2       | Localization      | The error-state heading uses `Избранное` while the rest of the page uses Kyrgyz copy                                                               | Clean up mixed-language strings and centralize favourites terminology                           | TBD   | Not started |
| FAV-C003 | P2       | Data presentation | The page defines `formatPrice()` but never uses it, which suggests drift between intended and actual card rendering responsibility                 | Remove dead helpers or intentionally own price formatting where appropriate                     | TBD   | Not started |

#### `CardCourse.jsx`

| ID       | Severity | Area                  | Issue                                                                                      | Task                                                                                                             | Owner | Status      |
| -------- | -------- | --------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- | ----- | ----------- |
| FAV-C004 | P1       | Interaction semantics | This page inherits the previously identified nested interactive issues in `CardCourse.jsx` | Resolve card/action semantics so favourite-related actions remain valid and accessible here as well              | Codex | Done        |
| FAV-C005 | P2       | Saved-items context   | The generic course card does not adapt well to a saved-items surface                       | Consider a favourites-specific card variant or additional controls instead of reusing the catalog card unchanged | TBD   | Not started |

### Implementation Order

1. Normalize page states and fix localization inconsistencies.
2. Resolve `CardCourse.jsx` interaction issues as they affect favourites.
3. Add favourites-specific management and conversion actions.
4. Improve scalability with simple sort/filter options if usage warrants it.

### Re-audit Checklist For Favourites

- All states use consistent layout and language.
- The page offers meaningful saved-items actions beyond passive browsing.
- Card interactions are valid and accessible.
- The page scales beyond a small handful of saved courses.

---

## Instructor Course Create Audit

### Page Summary

- Route: `/instructor/course/create`
- Source: `src/pages/CreateCourse.jsx`
- Related components:
    - `src/features/courses/builder/hooks/useCourseBuilder.js`
    - `src/features/courses/builder/components/CourseInfoStep.jsx`
    - `src/features/courses/builder/components/CurriculumStep.jsx`
    - `src/features/courses/builder/components/PreviewStep.jsx`
    - `src/features/courses/components/CourseBuilderStepNav.jsx`

### Audit Summary

The create-course flow is materially stronger than many other authenticated surfaces because it uses a shared builder architecture, but it still feels like a power-user content tool rather than a carefully guided creation journey. The main issues are weak step guidance, high curriculum-editor complexity, and several accessibility and copy-quality problems inside the shared builder components.

### Detailed Tasks

| ID         | Severity | Area            | Issue                                                                                                                                        | Task                                                                                                                        | Owner | Status      |
| ---------- | -------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ----- | ----------- |
| CREATE-001 | P1       | Workflow design | The three-step flow is structurally sound, but it does not strongly guide first-time instructors through what “good course setup” looks like | Add clearer step guidance, completion expectations, and progressive help across the builder flow                            | TBD   | Not started |
| CREATE-002 | P1       | Accessibility   | Shared builder controls rely heavily on raw inputs/buttons without robust label, error, and state semantics                                  | Audit and improve form semantics, step navigation semantics, and keyboard behavior across the builder stack                 | TBD   | Not started |
| CREATE-003 | P2       | Content design  | Builder copy mixes Kyrgyz, Russian, and English terminology such as `Single focus`, `Skill`, `Cover`, and `Настройкалар`                     | Standardize the builder vocabulary and localization so the course-authoring experience feels intentional and consistent     | TBD   | Not started |
| CREATE-004 | P2       | Draft UX        | Draft persistence exists via `localStorage`, but the save/recovery model is not strongly explained to the instructor                         | Add clearer draft-state messaging, save timestamps, and restore/discard affordances                                         | TBD   | Not started |
| CREATE-005 | P2       | Preview trust   | The preview step is useful, but it still reads more like a technical verification screen than a publish-readiness review                     | Rework preview into a stronger pre-submission checklist that highlights missing quality signals and student-facing outcomes | TBD   | Not started |

### Component Audit Breakdown

#### `CreateCourse.jsx`

| ID          | Severity | Area              | Issue                                                                                                                    | Task                                                                                                           | Owner | Status      |
| ----------- | -------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- | ----- | ----------- |
| CREATE-C001 | P2       | Page-shell design | The route page is intentionally thin, but the top-level shell gives little orientation beyond a title and short subtitle | Add stronger page-level framing, success criteria, and maybe lightweight help links without bloating the shell | TBD   | Not started |
| CREATE-C002 | P2       | Validation flow   | Preview-step gating is enforced through toast-only error reporting before step transitions                               | Replace toast-only blocking feedback with visible, navigable validation summaries tied to the curriculum UI    | TBD   | Not started |

#### `CourseInfoStep.jsx`

| ID          | Severity | Area                 | Issue                                                                                                                                               | Task                                                                                      | Owner | Status      |
| ----------- | -------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ----- | ----------- |
| CREATE-C003 | P1       | Accessibility        | Text inputs and selects use visible labels, but they are not consistently bound with `htmlFor`/`id`, and errors are shown without ARIA associations | Normalize semantic form wiring for all builder fields                                     | TBD   | Not started |
| CREATE-C004 | P2       | UX copy              | The settings section mixes localized and untranslated language and contains backend-implementation explanations directly in the UI                  | Rewrite help text so it explains user-facing constraints without exposing backend wording | TBD   | Not started |
| CREATE-C005 | P2       | Sticky action design | The sticky footer action is useful, but it appears late and offers limited context about readiness or unsaved changes                               | Add progress, dirty-state, or readiness context to the sticky action area                 | TBD   | Not started |

#### `CurriculumStep.jsx`

| ID          | Severity | Area           | Issue                                                                                                                             | Task                                                                                                                   | Owner | Status      |
| ----------- | -------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----- | ----------- |
| CREATE-C006 | P1       | Complexity     | The curriculum editor is feature-rich but dense, with many controls competing inside one screen                                   | Break the authoring experience into clearer subflows or stronger section/lesson editing modes                          | TBD   | Not started |
| CREATE-C007 | P1       | Localization   | Control labels still include mixed-language strings such as `Single focus: ON/OFF`, `Section`, `Skill`, and `Сактоо жане улантуу` | Clean up all authoring labels and fix copy/typo quality in the builder controls                                        | TBD   | Not started |
| CREATE-C008 | P2       | Accessibility  | Drag handles, `details/summary` usage, and horizontal chip navigation need stronger keyboard and assistive-tech support           | Add accessible reordering alternatives, clearer focus states, and better structural semantics for collapsible sections | TBD   | Not started |
| CREATE-C009 | P2       | Cognitive load | The control panel is useful, but it packs too many global actions and status indicators into one sticky bar                       | Reorganize toolbar actions by priority and frequency, especially for first-time creators                               | TBD   | Not started |

#### `PreviewStep.jsx`

| ID          | Severity | Area      | Issue                                                                                                                                       | Task                                                                                       | Owner | Status      |
| ----------- | -------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ----- | ----------- |
| CREATE-C010 | P2       | Review UX | The preview delegates almost entirely to `CoursePreviewPanel` and does not strongly frame the final decision or next state after submission | Add clearer submission expectations, checklist language, and post-submit outcome messaging | TBD   | Not started |

#### `CourseBuilderStepNav.jsx`

| ID          | Severity | Area                 | Issue                                                                                                  | Task                                                                                      | Owner | Status      |
| ----------- | -------- | -------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- | ----- | ----------- |
| CREATE-C011 | P2       | Navigation semantics | Step tabs are usable buttons, but they do not expose a richer wizard/stepper model or completion state | Improve stepper semantics and make enabled/disabled/completed states easier to understand | TBD   | Not started |

### Implementation Order

1. Improve shared builder accessibility and localization across the stepper and form controls.
2. Reduce curriculum-editor complexity and replace toast-only validation gating with visible guidance.
3. Strengthen draft, preview, and publish-readiness UX.
4. Add stronger page-level instructional framing for first-time instructors.

### Re-audit Checklist For Instructor Course Create

- The flow teaches course creation instead of only exposing controls.
- Builder forms and step navigation are accessible and localized consistently.
- Curriculum validation is visible and actionable without relying on toasts alone.
- Preview clearly explains readiness and what submission does next.

---

## Instructor Courses Audit

### Page Summary

- Route: `/instructor/courses`
- Source: `src/pages/InstructorCourses.jsx`
- Related components:
    - `src/services/api`

### Audit Summary

This page is currently the weakest of the instructor course-management surfaces. It is basically a raw filtered list rendered as simple cards, without meaningful loading, empty, error, sorting, or status-management UX. The biggest issue is that it does not feel like an operational course-management workspace yet.

### Detailed Tasks

| ID               | Severity | Area              | Issue                                                                                                                       | Task                                                                                                                        | Owner | Status      |
| ---------------- | -------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ----- | ----------- |
| INSTRCOURSES-001 | P1       | Product structure | The page is only a basic fetch-and-filter grid and lacks the structure of a real instructor course-management surface       | Redesign it as a proper management page with statuses, actions, filters, and clearer next steps per course                  | TBD   | Not started |
| INSTRCOURSES-002 | P1       | Async-state UX    | There are no explicit loading, empty, or user-facing error states beyond `console.error`                                    | Add designed loading, empty, and retryable error states                                                                     | TBD   | Not started |
| INSTRCOURSES-003 | P2       | Content clarity   | Status and primary action copy are confusing, including a published course showing `Tастыктоо` as the CTA                   | Rework status language and action labels to match the real lifecycle of draft, pending review, published, and needs changes | TBD   | Not started |
| INSTRCOURSES-004 | P2       | Scalability       | As course counts grow, the page has no filtering, search, sorting, or grouping                                              | Add lightweight management tools before this page becomes unscannable                                                       | TBD   | Not started |
| INSTRCOURSES-005 | P2       | Accessibility     | The cards are visually simple but do not provide a strong semantic structure for management actions or status comprehension | Improve card semantics, status labeling, and action hierarchy                                                               | TBD   | Not started |

### Component Audit Breakdown

#### `InstructorCourses.jsx`

| ID                | Severity | Area               | Issue                                                                                                       | Task                                                                                               | Owner | Status      |
| ----------------- | -------- | ------------------ | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ----- | ----------- |
| INSTRCOURSES-C001 | P1       | Data strategy      | The page fetches all courses globally and filters client-side by instructor ID                              | Move to a scoped instructor-courses API or at least a more intentional data contract for this view | TBD   | Not started |
| INSTRCOURSES-C002 | P2       | Resilience         | The page assumes `course.instructor.id` and `course.coverImageUrl` exist cleanly for every item             | Harden null-safety and design fallbacks for incomplete course data                                 | TBD   | Not started |
| INSTRCOURSES-C003 | P2       | Empty-state design | No-courses scenarios are currently silent and visually blank                                                | Add an empty state with a create-course CTA and guidance about the course lifecycle                | TBD   | Not started |
| INSTRCOURSES-C004 | P3       | Visual hierarchy   | The card layout is serviceable but generic and does not surface the most important operational signal first | Reprioritize title, status, enrollment/quality metrics, and primary actions                        | TBD   | Not started |

### Implementation Order

1. Add proper loading, empty, and error states.
2. Redesign the page into a real course-management surface with clearer status/action hierarchy.
3. Replace client-side global filtering with a better-scoped data source.
4. Add search/filter/grouping once the basic operational model is coherent.

### Re-audit Checklist For Instructor Courses

- The page behaves like a management workspace, not a raw card dump.
- Statuses and actions match the actual instructor course lifecycle.
- Loading, empty, and error states are explicit and useful.
- The page scales beyond a small number of courses.

---

## Instructor Course Edit Audit

### Page Summary

- Route: `/instructor/courses/edit/:id`
- Source: `src/pages/EditInstructorCourse.jsx`
- Related components:
    - `src/features/courses/builder/hooks/useCourseBuilder.js`
    - `src/features/courses/builder/components/CourseInfoStep.jsx`
    - `src/features/courses/builder/components/CurriculumStep.jsx`
    - `src/features/courses/builder/components/PreviewStep.jsx`
    - `src/features/courses/components/CourseBuilderStepNav.jsx`

### Audit Summary

The edit flow inherits most of the builder strengths and weaknesses from create, but adds a second layer of complexity around existing content, change safety, and publish-review lifecycle management. The main issues are unclear save-vs-submit behavior, weak unsaved-changes UX, and shared builder complexity that becomes even heavier when editing existing published material.

### Detailed Tasks

| ID             | Severity | Area               | Issue                                                                                                                                         | Task                                                                                                           | Owner | Status      |
| -------------- | -------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ----- | ----------- |
| EDITCOURSE-001 | P1       | Workflow clarity   | The distinction between saving edits, previewing, and sending for approval is not sufficiently explicit                                       | Redesign the edit flow so “save draft changes”, “review”, and “submit for approval” are clearly differentiated | TBD   | Not started |
| EDITCOURSE-002 | P1       | Unsaved-changes UX | The page has a custom cancel-confirm modal, but overall unsaved-change handling feels fragile and inconsistently surfaced                     | Implement more robust dirty-state messaging, route-leave protection, and visible save state                    | TBD   | Not started |
| EDITCOURSE-003 | P2       | Accessibility      | The custom cancel-confirm overlay is hand-built rather than using the shared modal system, which risks inconsistent focus and escape handling | Move the confirmation flow to the shared modal infrastructure with proper accessibility behavior               | TBD   | Not started |
| EDITCOURSE-004 | P2       | Change safety      | Editing an existing course can carry review/publish implications, but the UI does not clearly explain those consequences                      | Explain what changes are immediate, what changes require re-approval, and what students will experience        | TBD   | Not started |
| EDITCOURSE-005 | P2       | Shared complexity  | The shared builder is already dense in create mode and becomes even more cognitively expensive in edit mode                                   | Add stronger edit-specific framing and contextual help so instructors can safely modify existing content       | TBD   | Not started |

### Component Audit Breakdown

#### `EditInstructorCourse.jsx`

| ID              | Severity | Area              | Issue                                                                                                                                                        | Task                                                                                           | Owner | Status      |
| --------------- | -------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- | ----- | ----------- |
| EDITCOURSE-C001 | P1       | Dead-path risk    | The component defines handlers like `handleSaveAll`, `handleCancel`, and `handleBack`, but they are not meaningfully integrated into the rendered experience | Remove dead logic or wire the actions into a coherent edit-flow UI                             | TBD   | Not started |
| EDITCOURSE-C002 | P2       | Modal consistency | The unsaved-changes dialog is an inline overlay rather than a shared modal component                                                                         | Replace it with `BasicModal` or shared dialog infrastructure for consistency and accessibility | TBD   | Not started |
| EDITCOURSE-C003 | P2       | Copy quality      | The confirmation text and labels have wording issues and minor typos that reduce trust in a high-stakes editing flow                                         | Clean up edit-flow microcopy and make the consequence language clearer                         | TBD   | Not started |

#### Shared builder components

| ID              | Severity | Area                  | Issue                                                                                                                                                                                  | Task                                                                                             | Owner | Status      |
| --------------- | -------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ----- | ----------- |
| EDITCOURSE-C004 | P1       | Shared UX debt        | `CourseInfoStep.jsx`, `CurriculumStep.jsx`, `PreviewStep.jsx`, and `CourseBuilderStepNav.jsx` carry the same accessibility, localization, and density issues identified in create mode | Resolve the shared builder issues in one place and validate both create and edit flows afterward | TBD   | Not started |
| EDITCOURSE-C005 | P2       | Edit-specific context | The shared components do not visibly adapt enough to the risks of editing an existing course                                                                                           | Add clearer edit-mode context around locked fields, saved changes, and approval impact           | TBD   | Not started |

#### `useCourseBuilder.js`

| ID              | Severity | Area               | Issue                                                                                                             | Task                                                                                                                    | Owner | Status      |
| --------------- | -------- | ------------------ | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----- | ----------- |
| EDITCOURSE-C006 | P2       | Data orchestration | The hook is doing a large amount of API orchestration, hydration, content mapping, and state control in one place | Continue decomposing the hook into smaller data/domain modules so edit-mode behavior is easier to reason about and test | TBD   | Not started |
| EDITCOURSE-C007 | P2       | Feedback UX        | Per-lesson quiz/challenge loading failures surface as toasts during bulk hydration, which can become noisy        | Consolidate load failures into calmer section-level or page-level feedback patterns                                     | TBD   | Not started |

### Implementation Order

1. Clarify save, review, and submit-for-approval behavior in the edit journey.
2. Replace the custom cancel dialog and strengthen dirty-state protection.
3. Fix shared builder accessibility/localization issues once for both create and edit.
4. Add clearer edit-specific context around approval impact and existing student-facing content.

### Re-audit Checklist For Instructor Course Edit

- Save vs submit behavior is unambiguous.
- Unsaved changes are protected consistently and accessibly.
- Shared builder controls are improved across both create and edit.
- Instructors understand the publishing/review consequences of their edits.

---

## Unauthorized Page Audit

### Page Summary

- Route: `/unauthorized`
- Source: `src/pages/Unauthorized.jsx`

### Audit Summary

The unauthorized page has been redesigned as a proper access-control state. It now explains common failure cases, reflects the signed-in role when available, and gives users clear recovery paths back to the dashboard, courses, previous page, login, or support.

### Detailed Tasks

| ID         | Severity | Area                     | Issue                                                                                                                         | Task                                                                                                       | Owner | Status |
| ---------- | -------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----- | ------ |
| UNAUTH-001 | P1       | Recovery UX              | The page does not explain whether the problem is wrong role, missing enrollment, expired auth, or another permission boundary | Add clearer reason framing and direct next-step paths for likely failure cases                             | Codex | Done   |
| UNAUTH-002 | P2       | Information architecture | The only recovery action is “go home,” which is too generic for a blocked workflow                                            | Add contextual actions such as back, login, switch account, or return to dashboard depending on auth state | Codex | Done   |
| UNAUTH-003 | P2       | Trust UX                 | The page feels like a fallback error rather than a designed system state                                                      | Redesign it as a proper access state with better hierarchy, iconography, and system guidance               | Codex | Done   |
| UNAUTH-004 | P3       | Accessibility            | The message is readable, but the page does not provide stronger page-state semantics or focus guidance after redirect         | Ensure focus lands on the main message and the page is announced clearly after navigation                  | Codex | Done   |

### Component Audit Breakdown

#### `Unauthorized.jsx`

| ID          | Severity | Area                  | Issue                                                                 | Task                                                                                                   | Owner | Status |
| ----------- | -------- | --------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ----- | ------ |
| UNAUTH-C001 | P1       | Product communication | The page compresses all permission failures into one generic sentence | Expand copy and action logic to distinguish common access-control scenarios                            | Codex | Done   |
| UNAUTH-C002 | P2       | Visual design         | The layout is functionally centered but visually bare                 | Introduce a more intentional system-state composition with stronger hierarchy and supportive messaging | Codex | Done   |

### Implementation Order

1. Add better failure explanations and recovery actions.
2. Redesign the page as a deliberate system-state surface.
3. Improve focus management and accessibility semantics.

### Re-audit Checklist For Unauthorized

- Users can understand why access failed.
- The page offers meaningful recovery paths beyond going home.
- Focus and semantics make the state clear after redirect.

---

## Assistant Dashboard Audit

### Page Summary

- Route: `/assistant`
- Source: `src/pages/Assistant.jsx`
- Related components:
    - `src/features/assistant-dashboard/pages/AssistantDashboard.jsx`
    - `src/features/assistant-dashboard/hooks/useAssistantDashboardData.jsx`
    - `src/features/assistant-dashboard/components/AssistantStudentTable.jsx`
    - `src/features/assistant-dashboard/components/AssistantCompanyState.jsx`
    - `src/features/assistant-dashboard/components/AssistantCourseStats.jsx`
    - `src/components/ui/dashboard/DashboardLayout.jsx`

### Audit Summary

The assistant dashboard has a stronger shell than many other role-based surfaces, but it still behaves like a compact operational toolset more than a fully thought-through assistant workspace. The biggest issues are page-controller complexity, noisy data-refresh patterns, heavy dependence on toast-based confirmations, and limited distinction between overview, enrollment operations, and attendance work.

### Detailed Tasks

| ID            | Severity | Area            | Issue                                                                                                                                                                                          | Task                                                                                                                       | Owner | Status      |
| ------------- | -------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ----- | ----------- |
| ASSISTANT-001 | P1       | Architecture    | `AssistantDashboard.jsx` and `useAssistantDashboardData.jsx` jointly own navigation, keyboard shortcuts, company state, student search, enrollments, and course stats in a tightly coupled way | Split assistant concerns into clearer domain controllers for workspace state, company selection, and enrollment operations | TBD   | Not started |
| ASSISTANT-002 | P1       | Workflow design | Overview, attendance, course load, and student enrollment live in one shallow tab model without a strong task hierarchy                                                                        | Re-evaluate the assistant IA so daily actions and reference views are more clearly separated                               | TBD   | Not started |
| ASSISTANT-003 | P2       | Feedback UX     | High-impact enroll/unenroll actions rely on toast-based confirmations and success messages rather than strong inline state feedback                                                            | Add more visible per-row or section-level feedback for enrollment operations                                               | TBD   | Not started |
| ASSISTANT-004 | P2       | Data loading    | Search, pagination, company context, students, courses, and enrollments reload together, which can make the surface feel noisy and over-coupled                                                | Reduce broad reload coupling and give each domain clearer loading boundaries                                               | TBD   | Not started |
| ASSISTANT-005 | P2       | Accessibility   | Page-level keyboard shortcut handling is implemented directly in the page instead of being shared cleanly through the dashboard shell                                                          | Consolidate shared dashboard keyboard/accessibility behavior instead of duplicating it per role surface                    | TBD   | Not started |

### Component Audit Breakdown

#### `Assistant.jsx`

| ID             | Severity | Area      | Issue                                                                                                               | Task                                                                      | Owner | Status      |
| -------------- | -------- | --------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----- | ----------- |
| ASSISTANT-C001 | P3       | Structure | `src/pages/Assistant.jsx` is a thin forwarding wrapper, which is acceptable but should remain intentionally minimal | Keep the route file minimal and avoid reintroducing assistant logic there | Codex | Done        |

#### `AssistantDashboard.jsx`

| ID             | Severity | Area                       | Issue                                                                                                                                                           | Task                                                                                                                            | Owner | Status      |
| -------------- | -------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ----- | ----------- |
| ASSISTANT-C002 | P1       | Page-controller complexity | The page combines global keyboard behavior, layout orchestration, tab rendering, and role/company logic in one component                                        | Move keyboard behavior and tab/domain rendering into smaller abstractions                                                       | TBD   | Not started |
| ASSISTANT-C003 | P2       | Overview design            | The overview communicates useful metrics, but it repeats stats already shown in the header and does not strongly differentiate itself from the operational tabs | Refine the overview so it offers distinct decision support rather than duplicating surrounding metrics                          | TBD   | Not started |
| ASSISTANT-C004 | P2       | Tab model                  | Attendance is rendered by embedding `AttendancePage`, which risks inconsistent interaction patterns inside the assistant shell                                  | Review embedded attendance behavior and decide whether it belongs as a true assistant workspace tab or separate route/workspace | TBD   | Not started |

#### `useAssistantDashboardData.jsx`

| ID             | Severity | Area               | Issue                                                                                                                                          | Task                                                                           | Owner | Status      |
| -------------- | -------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ----- | ----------- |
| ASSISTANT-C005 | P1       | Data orchestration | The hook fetches users, companies, courses, and enrollments, and also owns confirm-toast behaviors and action side effects                     | Split data loading from action orchestration and UI feedback responsibilities  | TBD   | Not started |
| ASSISTANT-C006 | P2       | Performance        | Enrollment counts and enrollment maps are recalculated after broad refetches following each mutation                                           | Move toward more localized mutation updates or narrower refresh strategies     | TBD   | Not started |
| ASSISTANT-C007 | P2       | Search UX          | Search triggers broad reloading and only activates after 3 characters or empty input, which may be pragmatic but not very transparent to users | Surface search behavior more clearly and refine loading behavior during search | TBD   | Not started |

#### `AssistantStudentTable.jsx`

| ID             | Severity | Area                 | Issue                                                                                                                           | Task                                                                                         | Owner | Status      |
| -------------- | -------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ----- | ----------- |
| ASSISTANT-C008 | P1       | Action design        | Enrollment and unenrollment actions are embedded directly in each student card with minimal inline confirmation context         | Improve per-student action framing, selected-course clarity, and confirmation/state feedback | TBD   | Not started |
| ASSISTANT-C009 | P2       | Density              | The student list combines identity, current enrollments, course selection, and actions in one compact card pattern              | Simplify the card or move some actions into progressive disclosure for easier scanning       | TBD   | Not started |
| ASSISTANT-C010 | P2       | Empty-state language | The empty-state copy assumes “approved students” but the real empty reason could be search, company state, or data availability | Make empty-state messaging context-aware                                                     | TBD   | Not started |

#### `AssistantCompanyState.jsx`

| ID             | Severity | Area           | Issue                                                                                                                             | Task                                                                       | Owner | Status      |
| -------------- | -------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ----- | ----------- |
| ASSISTANT-C011 | P2       | Access framing | Company-selection gating is useful, but it could do more to explain why company context is required and what each company changes | Improve onboarding-style guidance for no-company and choose-company states | Codex | Done        |

#### `AssistantCourseStats.jsx`

| ID             | Severity | Area           | Issue                                                                                                                         | Task                                                                                                    | Owner | Status      |
| -------------- | -------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ----- | ----------- |
| ASSISTANT-C012 | P3       | Signal quality | The course-load cards are clean, but they mostly show title plus student count and may not provide enough operational insight | Consider whether assistants need stronger signals such as session state, capacity, or next-action hints | TBD   | Not started |

### Implementation Order

1. Decompose assistant data/action orchestration and reduce toast-driven workflows.
2. Clarify the information architecture between overview, enrollment work, and attendance.
3. Improve the student enrollment table’s action feedback and density.
4. Consolidate shared dashboard keyboard/accessibility behavior.

### Re-audit Checklist For Assistant Dashboard

- Assistant workflows are separated cleanly by task type.
- Enrollment actions provide visible inline feedback and confirmation.
- Data loading is less globally coupled.
- Shared dashboard accessibility behavior is not duplicated at page level.

---

## Catalog Page Audit

### Page Summary

- Route: `/catalog`
- Source: `src/pages/catalog/Catalog.jsx`

### Audit Summary

The `/catalog` page is currently a very thin public listing surface. It works, but it is much more primitive than `/courses` and reads like a temporary or experimental implementation. The biggest issues are missing loading/error/empty states, a bare-bones search-and-pagination model, and a generic card layout that does not yet justify having a separate catalog route.

### Detailed Tasks

| ID          | Severity | Area               | Issue                                                                                                                                       | Task                                                                                                                       | Owner | Status      |
| ----------- | -------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ----- | ----------- |
| CATALOG-001 | P1       | Product definition | The purpose of `/catalog` versus `/courses` is unclear from the current UX and implementation                                               | Define the distinct role of this route or consolidate it if it is not meaningfully different from the main courses catalog | TBD   | Not started |
| CATALOG-002 | P1       | Async-state UX     | The page has no explicit loading, error, or empty states                                                                                    | Add designed async states with retry behavior and intentional empty-state guidance                                         | TBD   | Not started |
| CATALOG-003 | P2       | Search UX          | Search is minimally debounced and updates query params, but the behavior is not explained and the input is too bare for a discovery surface | Improve search affordances, input semantics, and result-state communication                                                | TBD   | Not started |
| CATALOG-004 | P2       | Pagination UX      | Rendering one button per page does not scale and provides weak navigation context                                                           | Replace the naive pagination control with a more scalable pattern                                                          | TBD   | Not started |
| CATALOG-005 | P2       | Discovery design   | Catalog cards expose only image, title, and instructor, which is not enough for strong browsing decisions                                   | Add richer discovery metadata such as price, level, duration, and status signals if this route remains public-facing       | TBD   | Not started |

### Component Audit Breakdown

#### `Catalog.jsx`

| ID           | Severity | Area                        | Issue                                                                                                                                                    | Task                                                                                              | Owner | Status      |
| ------------ | -------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ----- | ----------- |
| CATALOG-C001 | P1       | Resilience                  | The `publicCatalog()` effect has no error handling and no request-state management                                                                       | Add explicit request lifecycle handling and protect against failed fetches or rapid query changes | TBD   | Not started |
| CATALOG-C002 | P2       | Route-state synchronization | Search input state and URL query state are partially synchronized, but the effect model is fragile and can be hard to reason about                       | Refine query-state synchronization and reset behavior more intentionally                          | TBD   | Not started |
| CATALOG-C003 | P2       | Visual hierarchy            | The page uses a simple heading/input row and generic cards, which feels too sparse for a primary discovery route                                         | Build a more intentional catalog layout with better hierarchy and browsing affordances            | TBD   | Not started |
| CATALOG-C004 | P3       | Accessibility               | Search, grid, and pagination are functional, but the page lacks richer semantics such as search landmarks, result counts, and current-page announcements | Add stronger accessible structure for search and result navigation                                | TBD   | Not started |

### Implementation Order

1. Decide whether `/catalog` is distinct enough to exist separately from `/courses`.
2. Add proper loading, error, and empty states plus stronger request handling.
3. Improve search and pagination UX.
4. If the route remains, redesign the listing cards and overall hierarchy to support browsing.

### Re-audit Checklist For Catalog

- The route has a clear purpose relative to `/courses`.
- Loading, error, and empty states are explicit.
- Search and pagination remain understandable as result counts grow.
- Cards expose enough metadata to support discovery.

---

## Companies Page Audit

### Page Summary

- Route: `/companies`
- Source: `src/pages/company/CompanyList.jsx`

### Audit Summary

The companies list is currently a basic CRUD utility page. It provides search, create, and open actions, but it does not yet feel like a deliberate directory or administrative workspace. The main issues are weak async-state handling, mixed public/admin positioning, and a flat list design that does not help users understand company status or what actions are available.

### Detailed Tasks

| ID            | Severity | Area               | Issue                                                                                                                          | Task                                                                                              | Owner | Status      |
| ------------- | -------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- | ----- | ----------- |
| COMPANIES-001 | P1       | Product definition | It is unclear whether `/companies` is meant to be a public company directory, an internal management page, or a hybrid surface | Define the route’s audience and redesign copy, actions, and access assumptions accordingly        | Codex | Done        |
| COMPANIES-002 | P1       | Async-state UX     | The page only uses toasts for failures and has no designed loading state                                                       | Add visible loading, empty, and retryable error states                                            | Codex | Done        |
| COMPANIES-003 | P2       | Workflow clarity   | Company creation is embedded as a single inline form with minimal context, validation, or governance cues                      | Rework create-company flow so it feels intentional and safe rather than like a utility shortcut   | Codex | Done        |
| COMPANIES-004 | P2       | Discovery design   | The list exposes only name and a short blurb, so it is weak both as a directory and as a management overview                   | Add stronger summary metadata or status signals if users need to compare or manage companies here | Codex | Done        |
| COMPANIES-005 | P2       | Pagination UX      | Rendering one button per page is naive and will not scale gracefully                                                           | Replace the current pagination control with a more robust pattern                                 | Codex | Done        |

### Component Audit Breakdown

#### `CompanyList.jsx`

| ID             | Severity | Area             | Issue                                                                                                   | Task                                                                                                    | Owner | Status      |
| -------------- | -------- | ---------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ----- | ----------- |
| COMPANIES-C001 | P1       | State management | Search, paging, and creation all live in one small component without explicit request-state separation  | Introduce clearer request lifecycle handling for list and create actions                                | Codex | Done        |
| COMPANIES-C002 | P2       | Search UX        | Search is immediate and visually bare, without result counts, empty-search guidance, or URL persistence | Improve search affordances and decide whether query state should be shareable in the URL                | Codex | Done        |
| COMPANIES-C003 | P2       | Visual hierarchy | The page layout is functional but sparse and generic                                                    | Build a more intentional company directory/management layout with clearer primary and secondary actions | Codex | Done        |

### Implementation Order

1. Clarify whether this route is internal, public, or hybrid.
2. Add proper loading, empty, and error states.
3. Redesign the create-company and list experience with stronger status and hierarchy.
4. Improve search and pagination scalability.

### Re-audit Checklist For Companies

- The route has a clear audience and purpose.
- Async states are explicit and usable.
- Creating a company feels intentional and safe.
- The listing supports comparison or management beyond a raw name list.

---

## Company Detail Audit

### Page Summary

- Route: `/companies/:id`
- Source: `src/pages/company/CompanyDetail.jsx`
- Related components:
    - `src/pages/company/CompanySettings.jsx`
    - `src/pages/company/CompanyMembers.jsx`
    - `src/pages/company/CompanyCourses.jsx`

### Audit Summary

The company detail route is the real company workspace, but it currently acts more like a simple tabbed container around three utility panels. The biggest issues are weak information architecture, limited company-level overview context, and inconsistent interaction patterns across settings, members, and course assignment.

### Detailed Tasks

| ID                | Severity | Area                     | Issue                                                                                                                          | Task                                                                                        | Owner | Status      |
| ----------------- | -------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- | ----- | ----------- |
| COMPANYDETAIL-001 | P1       | Information architecture | The page opens directly into tabs for settings, members, and courses without a stronger company overview or contextual framing | Add a company summary layer so users understand the entity before entering management tasks | Codex | Done        |
| COMPANYDETAIL-002 | P1       | Workflow cohesion        | Settings, membership, and course assignment feel like separate admin utilities rather than one coherent company workspace      | Define a clearer company-management model and align the tabs around that model              | Codex | Done        |
| COMPANYDETAIL-003 | P2       | Async-state UX           | Initial company loading uses a full-screen loader, but failure states rely on toasts and there is no inline recovery path      | Add visible not-found and retry states for company loading                                  | Codex | Done        |
| COMPANYDETAIL-004 | P2       | Navigation design        | The tab controls are basic buttons with no richer state, deep-linking, or shareable workspace context                          | Improve tab semantics and consider syncing active tab to the URL                            | Codex | Done        |
| COMPANYDETAIL-005 | P2       | Authorization clarity    | Management capabilities depend on company role and user role, but those permissions are not made explicit in the UI            | Make role-based capabilities clearer so users understand what they can edit and why         | Codex | Done        |

### Component Audit Breakdown

#### `CompanyDetail.jsx`

| ID                 | Severity | Area             | Issue                                                                                             | Task                                                                                                           | Owner | Status      |
| ------------------ | -------- | ---------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ----- | ----------- |
| COMPANYDETAIL-C001 | P1       | Workspace design | The route is a thin tab shell that lacks a company header, status summary, and management context | Add stronger page framing, high-level metadata, and workspace orientation                                      | Codex | Done        |
| COMPANYDETAIL-C002 | P2       | Deep-linking     | Active tab is local component state only                                                          | Add URL-driven tab state or other persistence so company workspaces are easier to revisit and share internally | Codex | Done        |

#### `CompanySettings.jsx`

| ID                 | Severity | Area             | Issue                                                                                                                                            | Task                                                                                                         | Owner | Status      |
| ------------------ | -------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ | ----- | ----------- |
| COMPANYDETAIL-C003 | P1       | Form complexity  | The settings surface is powerful, but it is presented as a long generic field registry rather than a deliberately grouped company profile editor | Reorganize settings into meaningful sections such as brand, contact, address, and legal information          | Codex | Done        |
| COMPANYDETAIL-C004 | P2       | Copy consistency | Labels and validation messages mix Kyrgyz and Russian heavily inside the same fields                                                             | Standardize localization and terminology across the settings form                                            | Codex | Done        |
| COMPANYDETAIL-C005 | P2       | Safety UX        | Delete-company action is available inline beside edit actions and relies on `window.confirm`                                                     | Move destructive actions into a safer, more explicit destructive-actions area with consistent modal behavior | Codex | Done        |
| COMPANYDETAIL-C006 | P2       | Accessibility    | Form fields use visual labels, but semantic wiring, error associations, and file-upload behavior need a more systematic accessibility pass       | Improve form semantics, validation associations, and file-upload affordances                                 | Codex | Done        |

#### `CompanyMembers.jsx`

| ID                 | Severity | Area                | Issue                                                                                                                 | Task                                                                                                 | Owner | Status      |
| ------------------ | -------- | ------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ----- | ----------- |
| COMPANYDETAIL-C007 | P1       | Membership workflow | Member search, role assignment, and removal are functional but still feel like a low-level admin tool                 | Redesign membership management for clearer user selection, role explanation, and action confirmation | Codex | Done        |
| COMPANYDETAIL-C008 | P2       | Accessibility       | The custom search dropdown and keyboard navigation are useful, but they do not expose a full combobox/listbox pattern | Implement proper accessible combobox semantics and focus behavior                                    | Codex | Done        |
| COMPANYDETAIL-C009 | P2       | Table UX            | Inline role changes and removal actions are efficient but can be risky without stronger contextual feedback           | Add better action-state feedback and safer role/removal confirmation patterns                        | Codex | Done        |

### Implementation Order

1. Add a real company workspace header and overview.
2. Reorganize settings, members, and courses into a more coherent management model.
3. Improve async-state handling and tab/deep-link behavior.
4. Refine settings and membership actions for safety, accessibility, and localization.

### Re-audit Checklist For Company Detail

- The route feels like one company workspace, not three disconnected utilities.
- Users can understand company status and context before editing details.
- Settings and membership flows are safer and more accessible.
- Tab state is easier to navigate and revisit.

---

## Company Courses Audit

### Page Summary

- Route: `/companies/:id/courses`
- Source: `src/pages/company/CompanyCourses.jsx`

### Audit Summary

This page is effectively a course-assignment utility for companies. It supports listing, attach, detach, and search, but it currently behaves like a pragmatic CRUD tool rather than a polished course-allocation surface. The main issues are mixed-language copy, limited distinction between browse and assign modes, and weak action safety/feedback patterns.

### Detailed Tasks

| ID                 | Severity | Area             | Issue                                                                                                                                                 | Task                                                                                           | Owner | Status      |
| ------------------ | -------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ----- | ----------- |
| COMPANYCOURSES-001 | P1       | Workflow design  | Listing assigned courses and adding new courses are both present, but the relationship between “browse” and “attach” modes is not strongly structured | Rework the page into clearer assigned-courses and add-course flows                             | Codex | Done        |
| COMPANYCOURSES-002 | P1       | Copy consistency | The page mixes Kyrgyz and Russian heavily in headings, placeholders, and action descriptions                                                          | Standardize course-assignment language across the surface                                      | Codex | Done        |
| COMPANYCOURSES-003 | P2       | Async-state UX   | Loading exists, but error and empty states rely on toasts or weak inline text                                                                         | Add clearer state design for empty company-course lists, no search results, and load failures  | Codex | Done        |
| COMPANYCOURSES-004 | P2       | Action safety    | Attach and detach operations are meaningful business actions but still use lightweight buttons and `window.confirm`                                   | Improve confirmation, progress indication, and post-action feedback for course-linking changes | Codex | Done        |
| COMPANYCOURSES-005 | P2       | Scalability      | Search and pagination are functional but simplistic for a potentially growing assignment catalog                                                      | Strengthen search, result grouping, and pagination patterns as course counts increase          | Codex | Done        |

### Component Audit Breakdown

#### `CompanyCourses.jsx`

| ID                  | Severity | Area               | Issue                                                                                                                                             | Task                                                                                      | Owner | Status      |
| ------------------- | -------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ----- | ----------- |
| COMPANYCOURSES-C001 | P1       | Mode clarity       | The add-course drawer is a simple toggle inside the same page context, which blurs whether the user is browsing assignments or actively assigning | Make add-course mode more intentional and separate it more clearly from the assigned list | Codex | Done        |
| COMPANYCOURSES-C002 | P2       | Search interaction | The page has two separate searches (`qInput` for assigned courses and `searchQ` for attach results), which increases cognitive load               | Clarify the two search scopes in the UI or redesign to reduce dual-search confusion       | Codex | Done        |
| COMPANYCOURSES-C003 | P2       | Result richness    | Attach search results and assigned-course items expose very little metadata beyond title and instructor                                           | Add richer course context if users need to choose between similarly named courses         | Codex | Done        |
| COMPANYCOURSES-C004 | P2       | Accessibility      | Drawer-like behavior, confirm flows, and action states are implemented without stronger dialog semantics or focus management                      | Improve accessible structure for the add-course panel and confirmation flows              | Codex | Done        |

### Implementation Order

1. Clarify the assigned-vs-add-course workflow model.
2. Clean up localization and dual-search behavior.
3. Improve empty/error/action-feedback states and safer detach/attach confirmations.
4. Add richer metadata and scalability improvements if this surface grows.

### Re-audit Checklist For Company Courses

- Assigned-course management and add-course flow are clearly separated.
- Language is consistent across all actions and states.
- Attach/detach operations provide stronger safety and feedback.
- Search remains understandable even with larger course sets.

---

## Chat Redirect Audit

### Page Summary

- Route: `/chat`
- Source: `src/pages/ChatRedirect.jsx`

### Audit Summary

This route is now a centralized communication entry point. Student and instructor users go to their chat tab, platform admins go to notifications, assistants return to their dashboard, and unsupported roles receive a visible fallback with dashboard and support actions.

### Detailed Tasks

| ID       | Severity | Area               | Issue                                                                                                                                                                                | Task                                                                                               | Owner | Status |
| -------- | -------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- | ----- | ------ |
| CHAT-001 | P1       | Product definition | `/chat` implies a shared destination, but the redirect behavior differs significantly by role and in some cases does not lead to an actual chat workspace                            | Define the product meaning of the `/chat` route and align role destinations around that definition | Codex | Done   |
| CHAT-002 | P2       | Route clarity      | Admins are redirected to `/admin?tab=notifications`, assistants to `/assistant`, and students/instructors to `?tab=chat`, which suggests uneven IA rather than a coherent chat model | Reconcile the underlying route map so chat/navigation semantics are consistent across roles        | Codex | Done   |
| CHAT-003 | P3       | UX fallback        | The route does not provide a visible fallback state if redirect assumptions become invalid                                                                                           | Add a minimal redirect/loading/fallback state if this route remains user-facing                    | Codex | Done   |

### Component Audit Breakdown

#### `ChatRedirect.jsx`

| ID        | Severity | Area           | Issue                                                                           | Task                                                                                                                        | Owner | Status |
| --------- | -------- | -------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ----- | ------ |
| CHAT-C001 | P1       | Redirect logic | Role-based redirects encode product decisions directly in a small wrapper route | Centralize role-destination rules and validate that every target actually supports the intended chat/communication behavior | Codex | Done   |

### Implementation Order

1. Define what `/chat` is supposed to mean product-wise.
2. Align role destinations with that meaning.
3. Add a safer redirect fallback if needed.

### Re-audit Checklist For Chat Redirect

- `/chat` has a clear cross-role meaning.
- Redirect targets match real chat or communication surfaces.
- Users are not silently sent to unrelated tabs.

---

## Leaderboard Page Audit

### Page Summary

- Route: `/leaderboard`
- Source: `src/pages/Leaderboard.jsx`
- Related components:
    - `src/features/leaderboard/components/LeaderboardHub.jsx`
    - `src/features/leaderboard/components/LeaderboardExperience.jsx`

### Audit Summary

The public leaderboard surface is one of the more distinctive product experiences in the app. It has stronger visual intent than many other pages, but it is also trying to balance public inspiration, gamified engagement, and private personalized ranking logic through one shared hub. The biggest issues are product-boundary ambiguity between public and personal modes, growing complexity in `LeaderboardHub.jsx`, and the need for clearer information hierarchy around what public visitors can actually do here.

### Detailed Tasks

| ID              | Severity | Area                          | Issue                                                                                                                                                                | Task                                                                                                      | Owner | Status |
| --------------- | -------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ----- | ------ |
| LEADERBOARD-001 | P1       | Product framing               | The public leaderboard blends motivation, proof, and gamification, but it is not always clear what a logged-out visitor should understand or do next                 | Clarify the public narrative and conversion path of the leaderboard surface                               | Codex | Done   |
| LEADERBOARD-002 | P1       | Architecture                  | `LeaderboardHub.jsx` is serving public mode, embedded mode, track logic, personalized summaries, skills, achievements, and share preparation in one large controller | Decompose the leaderboard hub into clearer public, personal, and embedded domain layers                   | Codex | Done   |
| LEADERBOARD-003 | P2       | Information hierarchy         | The page has many content modules competing for attention, which can dilute the primary story of the leaderboard                                                     | Reprioritize which modules appear first for public mode and simplify lower-priority rails                 | Codex | Done   |
| LEADERBOARD-004 | P2       | Accessibility                 | Rich visual modules and tab/track switchers need a stronger semantic pass to ensure state changes and sections are easy to navigate                                  | Improve landmarking, headings, switcher semantics, and focus management across the leaderboard experience | Codex | Done   |
| LEADERBOARD-005 | P2       | Performance / maintainability | Skill boards and multiple leaderboard datasets are loaded through a growing orchestration layer                                                                      | Reduce the data orchestration burden and make fetch ownership more modular                                | Codex | Done   |

### Component Audit Breakdown

#### `Leaderboard.jsx`

| ID               | Severity | Area        | Issue                                                                                                           | Task                                                                                       | Owner | Status |
| ---------------- | -------- | ----------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ----- | ------ |
| LEADERBOARD-C001 | P3       | Route shell | The route wrapper is intentionally thin, which is fine, but all product complexity is now concentrated below it | Keep the route minimal and push meaningful structure into clearer feature-level boundaries | Codex | Done   |

#### `LeaderboardHub.jsx`

| ID               | Severity | Area                    | Issue                                                                                                                         | Task                                                                                      | Owner | Status |
| ---------------- | -------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ----- | ------ |
| LEADERBOARD-C002 | P1       | Controller sprawl       | Public mode, embedded mode, tracks, skills, summaries, achievements, and share metadata are all orchestrated in one component | Split the hub into smaller controllers and mode-specific compositions                     | Codex | Done   |
| LEADERBOARD-C003 | P2       | Mode clarity            | Public and authenticated behaviors are intertwined, making it harder to reason about what content belongs to which audience   | Separate public and personalized concerns more deliberately in the UI and component model | Codex | Done   |
| LEADERBOARD-C004 | P2       | Track UX                | The track switcher is visually strong, but the implications of each track are not always obvious to new users                 | Make track meaning and data scope more explicit                                           | Codex | Done   |
| LEADERBOARD-C005 | P2       | Empty / degraded states | Service fallback and empty leaderboard conditions are handled, but they need stronger user-facing framing                     | Improve degraded-state communication and calls to action                                  | Codex | Done   |

### Implementation Order

1. Separate public vs personalized leaderboard concerns in product framing and architecture.
2. Break down `LeaderboardHub.jsx` into smaller mode-specific controllers.
3. Simplify public information hierarchy and improve degraded/empty states.
4. Strengthen accessibility and track-state semantics.

### Re-audit Checklist For Leaderboard

- Public visitors understand the point of the page and the next step.
- Public and personalized concerns are not overly entangled.
- The page remains understandable despite multiple content modules.
- State changes and switchers are accessible.

---

## Leaderboard Share Page Audit

### Page Summary

- Status: Removed from frontend scope
- Former page route: `/share/achievement/:token` now redirects to `/leaderboard`
- Former source: `src/pages/LeaderboardShare.jsx`

### Audit Summary

This surface was audited and then removed from the frontend scope. The current leaderboard experience should not expose achievement sharing buttons, public achievement share pages, or frontend share API calls unless the product explicitly reintroduces sharing later. Legacy share URLs may redirect to `/leaderboard` to avoid a dead 404.

### Detailed Tasks

| ID          | Severity | Area          | Issue                       | Task                           | Owner | Status  |
| ----------- | -------- | ------------- | --------------------------- | ------------------------------ | ----- | ------- |
| LBSHARE-001 | P1       | Trust UX      | Removed from frontend scope | No current implementation task | Codex | Removed |
| LBSHARE-002 | P2       | Localization  | Removed from frontend scope | No current implementation task | Codex | Removed |
| LBSHARE-003 | P2       | Resilience    | Removed from frontend scope | No current implementation task | Codex | Removed |
| LBSHARE-004 | P2       | Accessibility | Removed from frontend scope | No current implementation task | Codex | Removed |

### Component Audit Breakdown

#### `LeaderboardShare.jsx`

| ID           | Severity | Area              | Issue                       | Task                           | Owner | Status  |
| ------------ | -------- | ----------------- | --------------------------- | ------------------------------ | ----- | ------- |
| LBSHARE-C001 | P1       | Metadata strategy | Removed from frontend scope | No current implementation task | Codex | Removed |
| LBSHARE-C002 | P2       | Context setting   | Removed from frontend scope | No current implementation task | Codex | Removed |
| LBSHARE-C003 | P2       | Fallback content  | Removed from frontend scope | No current implementation task | Codex | Removed |

### Implementation Order

1. Keep the removed page/API out of the frontend while preserving the legacy redirect.
2. Revisit this audit only if achievement sharing is reintroduced.

### Re-audit Checklist For Leaderboard Share

- `/share/achievement/:token` redirects to `/leaderboard` and does not render a share page.
- No leaderboard share button/modal is visible.
- No frontend share API functions are exported.
- No active share surface is rendered.

---

## Internal Leaderboard Audit

### Page Summary

- Route: `/leaderboard/internal`
- Source: `src/pages/InternalLeaderboard.jsx`

### Audit Summary

The internal leaderboard is a useful operational/engagement surface for authenticated roles, but it is still a fairly dense analytics-style workspace. The main issues are controller complexity, overlapping data modules, and the need to make role-specific value clearer for instructors, students, and admins who may use this same page differently.

### Detailed Tasks

| ID        | Severity | Area                    | Issue                                                                                                                                               | Task                                                                                     | Owner | Status |
| --------- | -------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ----- | ------ |
| INTLB-001 | P1       | Product fit             | One internal leaderboard workspace is serving different roles with different goals, but the page does not adapt its framing strongly enough by role | Clarify role-specific value and decide whether one shared workspace remains the right IA | Codex | Done   |
| INTLB-002 | P1       | Architecture            | The page orchestrates course options, weekly data, homepage data, student-of-week, and course leaderboards in one component                         | Decompose the internal leaderboard into focused data and UI modules                      | Codex | Done   |
| INTLB-003 | P2       | Density                 | Multiple leaderboard panels and metrics are shown together, making the page more analytical than action-oriented                                    | Reprioritize the most important insights and reduce visual competition between modules   | Codex | Done   |
| INTLB-004 | P2       | Error / degraded states | Several async loads silently fail back to empty collections, which can make absence of data ambiguous                                               | Improve explicit degraded-state messaging and retry options                              | Codex | Done   |
| INTLB-005 | P2       | Accessibility           | Track filters, course selectors, and repeated leaderboard cards need a semantic review for keyboard/screen-reader clarity                           | Improve filter semantics, section headings, and repeated-card labeling                   | Codex | Done   |
| INTLB-006 | P2       | Test coverage           | Role framing, track switching, course selection, and degraded states were previously untested                                                       | Add page-level tests for core internal leaderboard behavior and failure states           | Codex | Done   |

### Component Audit Breakdown

#### `InternalLeaderboard.jsx`

| ID         | Severity | Area                  | Issue                                                                                                               | Task                                                                                | Owner | Status |
| ---------- | -------- | --------------------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ----- | ------ |
| INTLB-C001 | P1       | Controller complexity | The page handles multiple fetch lifecycles and role-based course-loading behavior in one component                  | Split data orchestration into smaller hooks or modules                              | Codex | Done   |
| INTLB-C002 | P2       | Role framing          | Course loading changes by user role, but the page title and explanatory copy stay mostly generic                    | Add stronger role-aware framing if this page remains shared across roles            | Codex | Done   |
| INTLB-C003 | P2       | Loading behavior      | Primary and course-board loading states are represented, but the overall transition model can still feel fragmented | Improve transitions between global and section-local loading states                 | Codex | Done   |
| INTLB-C004 | P3       | Code quality          | `EmptyState` is defined but effectively overshadowed by `DashboardEmptyState`, suggesting minor drift in the file   | Remove unused or redundant local helpers and keep the page implementation tighter   | Codex | Done   |
| INTLB-C005 | P2       | Fallback resilience   | Empty student-of-week payloads could still look like a placeholder student row                                      | Normalize empty student-of-week payloads to the empty state and cover it with tests | Codex | Done   |

### Implementation Order

1. Clarify role-specific goals and whether one shared page is still appropriate.
2. Decompose data orchestration and improve degraded-state handling.
3. Reduce density and sharpen the information hierarchy.
4. Tighten semantics and loading transitions.

### Re-audit Checklist For Internal Leaderboard

- Different roles can quickly understand why this page matters to them.
- Data absence vs load failure is clearly communicated.
- The page is easier to scan despite multiple leaderboard modules.
- Filter and selector interactions are accessible.
- Tests cover role-aware copy, track switching, course selection, failure states, and empty student-of-week payloads.

---

## Certificate Download Audit

### Page Summary

- Route: `/certificates/:publicId/download`
- Source: `src/pages/CertificateDownload.jsx`

### Audit Summary

The certificate download route is a side-effect utility page rather than a normal content page. It now attempts the PDF download once, keeps the user on a durable status surface, and provides retry plus explicit verification/home recovery actions.

### Detailed Tasks

| ID         | Severity | Area                | Issue                                                                                                                             | Task                                                                                                                  | Owner | Status |
| ---------- | -------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----- | ------ |
| CERTDL-001 | P1       | Failure UX          | Download failure only shows a toast and then the page navigates away, so the user can lose context and cannot retry from the page | Replace the pure loader flow with a small status surface that can show downloading, failed, retry, and return actions | Codex | Done   |
| CERTDL-002 | P2       | Flow clarity        | The page performs a file-download side effect without visible copy explaining what is happening                                   | Add concise visible status text such as "PDF даярдалып жатат" and fallback guidance if browser download is blocked    | Codex | Done   |
| CERTDL-003 | P2       | Navigation behavior | `navigate(-1)` after download can return users to an arbitrary previous page outside the certificate context                      | Prefer an explicit return target when available, or fall back to certificate verification/home with clear copy        | Codex | Done   |
| CERTDL-004 | P2       | Accessibility       | The full-screen loader does not provide a certificate-download-specific live/status message                                       | Add accessible status text and ensure assistive tech receives state changes                                           | Codex | Done   |
| CERTDL-005 | P2       | Test coverage       | Download success/failure/missing-id states were previously untested                                                               | Add page-level tests for auto-download, retry, StrictMode duplicate prevention, and missing-id fallback               | Codex | Done   |

### Implementation Order

1. Add a durable status/error/retry UI around the download side effect.
2. Make fallback navigation explicit and predictable.
3. Improve loader/status accessibility.

### Re-audit Checklist For Certificate Download

- Users can tell a PDF download is being attempted.
- Failed downloads leave a visible retry path.
- Browser-blocked downloads have a fallback action.
- Navigation after success/failure is predictable.
- Tests cover success, retry, StrictMode duplicate prevention, and missing-id fallback.

---

## Certificate Verification Audit

### Page Summary

- Route: `/certificates/:publicId/verify`
- Source: `src/pages/CertificateVerification.jsx`

### Audit Summary

This is a strong trust surface visually and strategically important for external credibility. The main gaps are localization consistency, trust-language clarity for different certificate states, and resilience in how failure and fallback behavior are communicated to external users.

### Detailed Tasks

| ID       | Severity | Area                    | Issue                                                                                                                                               | Task                                                                                                                | Owner | Status |
| -------- | -------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ----- | ------ |
| CERT-001 | P2       | Localization / brand UX | The page is mostly Kyrgyz-first now, but still mixes English date formatting and brand/system phrases such as `EduBot Learning` with localized copy | Decide the intended audience and normalize date formatting, brand phrasing, and any remaining mixed-language labels | Codex | Done   |
| CERT-002 | P1       | Trust communication     | Different statuses are represented visually, but external users may still need clearer explanations of what each status means operationally         | Strengthen plain-language explanations for issued, pending, revoked, and rejected states                            | Codex | Done   |
| CERT-003 | P2       | Error-state UX          | Not-found or failed-verification states are clear but fairly generic                                                                                | Improve external-user guidance for invalid links, expired references, or support escalation                         | Codex | Done   |
| CERT-004 | P2       | Accessibility           | The page is visually polished, but important status and verification details should be easier to scan semantically                                  | Improve landmarking, heading structure, and status announcement semantics                                           | Codex | Done   |
| CERT-005 | P2       | Interaction feedback    | Copy-to-clipboard feedback is minimal and only visible in button text                                                                               | Add stronger feedback and fallback handling for copy/open-verification actions                                      | Codex | Done   |

### Component Audit Breakdown

#### `CertificateVerification.jsx`

| ID        | Severity | Area                | Issue                                                                                                                                              | Task                                                                                         | Owner | Status |
| --------- | -------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ----- | ------ |
| CERT-C001 | P1       | Audience clarity    | The page reads like an external public trust surface, but its language and navigation assumptions should be explicitly designed for external users | Design the page from the perspective of a third-party verifier first                         | Codex | Done   |
| CERT-C002 | P2       | State framing       | Status cards are visually strong, but revoked/rejected/pending states may need more differentiated guidance and warning treatment                  | Tailor secondary messaging and next-step guidance by certificate status                      | Codex | Done   |
| CERT-C003 | P2       | Fallback resilience | The verification link and registry details are rendered plainly, but missing fields could degrade the page awkwardly                               | Harden optional-field fallbacks and ensure all states remain trustworthy                     | Codex | Done   |
| CERT-C004 | P2       | Test coverage       | Verification status, error, copy, and partial-payload states were previously untested                                                              | Add page-level tests for issued, revoked, missing-link, missing-id, and fetch-failure states | Codex | Done   |

### Implementation Order

1. Decide the intended audience/language strategy for verification.
2. Improve trust-language and guidance for all certificate statuses.
3. Tighten accessibility and action feedback details.
4. Harden fallback behavior for partial or failed verification payloads.

### Re-audit Checklist For Certificate Verification

- The language matches the intended audience.
- Every certificate status is clearly explained to an external verifier.
- Actions like copy/open verification feel reliable and clear.
- The page remains trustworthy under partial or failed data conditions.
- Tests cover issued, revoked, fetch-failure, missing-link, and missing-id paths.

---

## Embedded Surfaces Audit

### Scope

These files are not currently primary standalone routes in `src/app/routes.jsx`, but they still represent meaningful UX/UI surfaces because they are embedded inside dashboards, linked from internal workflows, or appear to be legacy standalone operational pages:

- `src/pages/Attendance.jsx`
- `src/pages/SessionWorkspace.jsx`
- `src/pages/InstructorAnalytics.jsx`
- `src/pages/StudentAnalytics.jsx`
- `src/pages/AdminAnalytics.jsx`
- `src/pages/InstructorHomework.jsx`

Related note:

- `src/features/assistant-dashboard/pages/AssistantDashboard.jsx` and `src/features/admin/pages/AdminPanel.jsx` were already covered through their routed wrappers.
- `src/pages/company/CompanyMembers.jsx` and `src/pages/company/CompanySettings.jsx` were already covered under the company detail audit.

### Embedded Surface Summary

These operational surfaces are generally powerful, but they share a clear pattern: each one has grown into a dense all-in-one workspace with heavy local orchestration, many async dependencies, and a lot of UI logic living at page level. The biggest cross-cutting issues are controller sprawl, duplicated dashboard/workspace patterns, toast-heavy feedback, and unclear boundaries between embedded usage and standalone page identity.

### Canonical Ownership Decisions

Current route evidence from `src/app/routes.jsx`:

- `/instructor/sessions` redirects to `/instructor?tab=sessions`
- `/instructor/analytics` redirects to `/instructor?tab=analytics`
- `/instructor/homework` redirects to `/instructor?tab=homework`
- `/student/analytics` redirects to `/student?tab=progress`
- `/admin/analytics` redirects to `/admin?tab=analytics`
- `/assistant` routes through `src/pages/Assistant.jsx`, which forwards to `src/features/assistant-dashboard/pages/AssistantDashboard.jsx`

These redirects mean the role dashboards are already the canonical routed homes for analytics, sessions, and homework. The page-like files should be treated as embedded workspace modules unless a future product decision intentionally exposes them as direct routes again.

| Surface | Canonical home | Current implementation role | Decision | Follow-up rule |
| ------- | -------------- | --------------------------- | -------- | -------------- |
| Attendance | Dashboard tab/workspace, embedded by admin, instructor, and assistant shells | `src/pages/Attendance.jsx` supports `embedded` mode and is imported by role dashboards | Keep as a reusable embedded attendance workspace, not a standalone public route | Do not add a direct `/attendance` route without a separate product decision and route-level wrapper |
| Session workspace | Instructor dashboard sessions tab | `src/pages/SessionWorkspace.jsx` is rendered from `InstructorDashboard.jsx` for `tab=sessions` | Treat as the canonical instructor session workbench | Keep session, attendance, homework, resources, and live-meeting tools under this workbench unless split into feature modules behind the same tab |
| Instructor analytics | Instructor dashboard analytics tab | `/instructor/analytics` redirects to `/instructor?tab=analytics`; `InstructorAnalytics.jsx` is embedded by `InstructorDashboard.jsx` | Keep as embedded analytics content, not a standalone route | Any deep link should target `/instructor?tab=analytics` plus query params, not mount the page directly |
| Student analytics | Student dashboard progress tab | `/student/analytics` redirects to `/student?tab=progress`; `ProgressTab.jsx` embeds `StudentAnalytics.jsx` | Keep as the progress-tab analytics module | Keep `embedded`, `courseId`, `showHeader`, and `showFilters` only for progress-tab variants; remove unused contexts during refactor |
| Admin analytics | Admin dashboard analytics tab | `/admin/analytics` redirects to `/admin?tab=analytics`; `AdminPanel.jsx` renders `AdminAnalytics.jsx` | Keep as embedded admin analytics content | New admin analytics work should flow through the admin dashboard tab model |
| Instructor homework | Instructor dashboard homework tab, with session-specific work inside session workspace | `/instructor/homework` redirects to `/instructor?tab=homework`; `InstructorHomework.jsx` links detailed items into `tab=sessions&workspaceTab=homework` | Keep queue triage in dashboard homework tab; keep per-session review in session workspace | Queue rows may deep-link into session workspace, but should not create a second standalone homework route |
| Assistant route wrapper | Assistant dashboard feature module | `src/pages/Assistant.jsx` only forwards to `@features/assistant-dashboard` | Keep the route file intentionally minimal | Assistant logic belongs under `src/features/assistant-dashboard`, not in the route wrapper |

### Operational Workspace Accessibility Checklist

Apply this checklist to embedded operational workspaces before marking any future workspace refactor as re-audited:

- Each workspace exposes one clear heading and keeps nested section headings in order.
- Filters and search controls have visible labels or stable accessible labels.
- Tables, card lists, and dense grids announce result count, empty state, loading state, and error state.
- Tab or nav controls use one semantic model per surface; avoid mixing tablist, menu, and link behavior for the same control.
- Keyboard focus remains visible after filter changes, tab changes, modal close, save, retry, and delete/confirm flows.
- Bulk actions explain selection count, disabled reasons, and destructive consequences near the action.
- Toasts are not the only place where save, error, validation, or retry state is communicated.
- Loading states use `aria-live` or equivalent status text when the current task is blocked.
- Modal dialogs have unique title/description wiring and restore focus to the initiating control.
- Swipe, shortcut, or gesture behavior has a keyboard-accessible equivalent and does not conflict with browser navigation.

### Cross-Surface Tasks

| ID        | Severity | Area                  | Issue                                                                                                                                         | Task                                                                                                              | Owner | Status      |
| --------- | -------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----- | ----------- |
| EMBED-001 | P1       | Architecture          | Several embedded operational pages are acting as large controllers with data fetching, business rules, filters, and UI state all in one file  | Break embedded workspaces into smaller domain hooks/controllers and keep page shells thin                         | TBD   | Not started |
| EMBED-002 | P1       | Product structure     | Some surfaces exist both as embedded dashboard tabs and as standalone page-like files, creating a risk of duplicated UX models and code drift | Decide which operational surfaces are canonical as standalone routes vs embedded tabs and consolidate accordingly | Codex | Done        |
| EMBED-003 | P2       | Feedback UX           | Operational actions still depend heavily on toast messaging instead of durable inline status and recovery context                             | Improve section-level feedback, mutation states, and retry/error affordances across embedded workspaces           | TBD   | Not started |
| EMBED-004 | P2       | Accessibility         | Filters, tables, dense cards, and multi-panel workspaces need a systematic accessibility pass rather than ad hoc improvements                 | Create a shared accessibility checklist for operational workspace surfaces and apply it consistently              | Codex | Done        |
| EMBED-005 | P2       | Shared shell behavior | Keyboard navigation, swipe behavior, and layout conventions are being reimplemented at the page level across multiple operational surfaces    | Consolidate shell/workspace behavior into shared dashboard infrastructure                                         | TBD   | Not started |

### Surface Breakdown

#### `Attendance.jsx`

| ID         | Severity | Area                            | Issue                                                                                                                               | Task                                                                                            | Owner | Status      |
| ---------- | -------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ----- | ----------- |
| EMBED-C001 | P1       | Workspace complexity            | Attendance is a real operational workspace with course, group, session, roster, report, and edit-mode concerns all in one page      | Split the surface into clearer subdomains and reduce controller size                            | TBD   | Not started |
| EMBED-C002 | P2       | Embedded-vs-standalone identity | The page supports `embedded` mode, but it still carries the weight of a standalone tool and may diverge from dashboard expectations | Define whether attendance is fundamentally a tabbed workspace or a standalone operational route | Codex | Done        |
| EMBED-C003 | P2       | Data-loading UX                 | Course, group, session, and roster loading are sequentially dependent and can leave the workspace feeling fragmented                | Improve progressive loading and skeleton/state transitions between selection layers             | TBD   | Not started |
| EMBED-C004 | P2       | Action safety                   | Bulk attendance editing is meaningful operational data entry, but the save/review flow could use stronger draft/change visibility   | Add clearer unsaved-change, save-success, and conflict/error feedback                           | TBD   | Not started |

#### `SessionWorkspace.jsx`

| ID         | Severity | Area              | Issue                                                                                                                                                                        | Task                                                                                                                                | Owner | Status      |
| ---------- | -------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----- | ----------- |
| EMBED-C005 | P1       | Controller sprawl | Session workspace combines session setup, meetings, attendance, materials, activities, homework, notes, and engagement into one very large controller                        | Decompose this into focused session-domain controllers and stronger tab/module boundaries                                           | TBD   | Not started |
| EMBED-C006 | P1       | Product density   | The surface is powerful but extremely dense, making it hard to scan and difficult for instructors to build a mental model quickly                                            | Rework the workspace hierarchy so high-frequency session actions appear first and lower-frequency tools are progressively disclosed | TBD   | Not started |
| EMBED-C007 | P2       | Tab architecture  | Attendance, materials, homework, activities, notes, and engagement share one flat tab model even though they differ substantially in purpose and complexity                  | Revisit session IA and determine whether all tools belong at the same navigation level                                              | TBD   | Not started |
| EMBED-C008 | P2       | Embedded drift    | Because this page appears page-like but is also embedded within broader instructor flows, it risks diverging from the surrounding instructor-dashboard language and controls | Align session workspace behavior and visual language with the canonical instructor workbench model                                  | TBD   | Not started |

#### `InstructorAnalytics.jsx`

| ID         | Severity | Area                | Issue                                                                                                                                             | Task                                                                                                 | Owner | Status      |
| ---------- | -------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ----- | ----------- |
| EMBED-C009 | P1       | Route strategy      | This file behaves like a standalone analytics page while the main instructor experience already centralizes analytics in the instructor dashboard | Decide whether this remains a standalone analytics route or is fully subsumed by dashboard analytics | Codex | Done        |
| EMBED-C010 | P2       | Interaction quality | Swipe-navigation behavior between admin/instructor/student analytics is clever but product-fragile and not obviously discoverable                 | Reassess cross-role swipe navigation as a primary interaction model                                  | TBD   | Not started |
| EMBED-C011 | P2       | Content polish      | Insights and recommendations are useful, but copy quality and chart framing need refinement to feel product-grade                                 | Tighten language, recommendation logic, and chart-context explanations                               | TBD   | Not started |

#### `StudentAnalytics.jsx`

| ID         | Severity | Area               | Issue                                                                                                                                           | Task                                                                                           | Owner | Status      |
| ---------- | -------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ----- | ----------- |
| EMBED-C012 | P1       | Code correctness   | The page references `navigate()` in multiple action handlers but does not define `navigate`, which is a direct implementation bug               | Fix navigation wiring and verify all action buttons work                                       | Codex | Done        |
| EMBED-C013 | P1       | Embedding strategy | This surface supports `embedded`, `courseId`, `showHeader`, and `showFilters`, indicating it is serving many contexts at once                   | Clarify which contexts are truly needed and simplify the component’s responsibility boundaries | Codex | Done        |
| EMBED-C014 | P2       | UX consistency     | Student analytics is visually richer than many student surfaces, but it may drift from the main student dashboard’s mental model and priorities | Align deep-progress analytics with the broader student workspace narrative                     | TBD   | Not started |

#### `AdminAnalytics.jsx`

| ID         | Severity | Area                    | Issue                                                                                                                                       | Task                                                                                                        | Owner | Status      |
| ---------- | -------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ----- | ----------- |
| EMBED-C015 | P1       | IA duplication          | Admin analytics exists as a page-like surface while admin operational oversight already lives inside the admin dashboard                    | Decide whether this page remains distinct or should be folded into a single admin analytics/workspace model | Codex | Done        |
| EMBED-C016 | P2       | Incomplete feature cues | Mobile quick actions trigger “coming later” toast messages, which makes the surface feel partially stubbed in production                    | Replace placeholder actions with real behavior, hide them, or mark them clearly as unavailable              | TBD   | Not started |
| EMBED-C017 | P2       | Density                 | The page communicates metrics and trends well, but repeated workspace heroes and analytics blocks create a somewhat heavy scroll experience | Simplify section hierarchy and reduce repeated framing patterns                                             | TBD   | Not started |

#### `InstructorHomework.jsx`

| ID         | Severity | Area                      | Issue                                                                                                                                     | Task                                                                                                     | Owner | Status      |
| ---------- | -------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ----- | ----------- |
| EMBED-C018 | P1       | Route strategy            | Instructor homework is acting like a standalone queue-management page while homework also lives inside broader instructor session flows   | Decide whether homework review should be a dedicated route, a dashboard tab, or a session-workspace mode | Codex | Done        |
| EMBED-C019 | P2       | Queue UX                  | The surface has useful queue concepts, but the relationship between summary cards, filters, and actionable homework rows could be clearer | Strengthen queue-management hierarchy and next-action emphasis                                           | TBD   | Not started |
| EMBED-C020 | P2       | Search and filter clarity | Search, course/group filters, and queue-state filters are valuable but need more deliberate explanation and scaling strategy              | Refine filter design and make the queue model easier to understand at a glance                           | TBD   | Not started |

### File Triage Recommendations

| File                                | Current Role                                 | Recommendation                                                                                       |
| ----------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `src/pages/Attendance.jsx`          | Embedded operational workspace               | Keep, but treat as canonical attendance module only if it is not duplicated elsewhere                |
| `src/pages/SessionWorkspace.jsx`    | Embedded operational workspace               | Keep, but refactor heavily and clarify whether it should be directly routed                          |
| `src/pages/InstructorAnalytics.jsx` | Standalone page-like analytics surface       | Consolidate with routed instructor analytics experience or retire duplicate entry point              |
| `src/pages/StudentAnalytics.jsx`    | Embedded/standalone hybrid analytics surface | Keep only if multiple embedding contexts are truly needed; otherwise consolidate                     |
| `src/pages/AdminAnalytics.jsx`      | Standalone page-like analytics surface       | Consolidate with canonical admin analytics/dashboard model                                           |
| `src/pages/InstructorHomework.jsx`  | Standalone page-like queue surface           | Decide whether homework review remains standalone or becomes part of session/instructor workspace IA |

### Suggested Next Implementation Order

1. Fix direct correctness issues in embedded surfaces, especially `StudentAnalytics.jsx`.
2. Decide canonical ownership for analytics, attendance, session workspace, and homework flows.
3. Refactor the largest controller files: `SessionWorkspace.jsx`, `Attendance.jsx`, and the analytics pages.
4. Standardize embedded-workspace shell behavior, feedback patterns, and accessibility rules.

### Re-audit Checklist For Embedded Surfaces

- Each operational surface has a clear canonical home in the product IA.
- Large controller files are decomposed into domain-focused modules.
- Embedded and standalone variants do not drift from one another.
- Feedback, accessibility, and loading patterns are consistent across operational workspaces.

---

## Shared Components Audit

### Scope

This section covers reusable UI and navigation primitives that were not fully audited as a standalone system during the page-by-page pass, including:

- `src/shared/Header.jsx`
- `src/shared/Footer.jsx`
- `src/app/layouts/MainLayout.jsx`
- `src/components/ui/dashboard/DashboardLayout.jsx`
- `src/features/dashboard/components/DashboardSidebar.jsx`
- `src/components/ui/dashboard/DashboardTabs.jsx`
- `src/shared/ui/UserMenuDropdown.jsx`
- `src/shared/ui/BasicModal.jsx`
- `src/shared/ui/ConfirmationModal.jsx`
- `src/shared/ui/Button.jsx`
- `src/shared/ui/Loader.jsx`
- `src/components/ui/dashboard/DashboardFilterBar.jsx`
- `src/components/ui/dashboard/EmptyState.jsx`

Several of these were already referenced inside page audits. This section consolidates the system-level issues that cut across many surfaces, especially menus, navigation, dialogs, and reusable states.

### Shared System Summary

The reusable layer has a good amount of visual ambition, but it is not yet a disciplined design system. The strongest recurring issues are: inconsistent semantics between similar primitives, over-styled navigation patterns that sometimes sacrifice clarity, duplicated interaction logic across shells, and uneven accessibility rigor in menus, dialogs, and state components.

### Shared Component Usage Boundaries

These rules define when shared primitives should be used before additional variants or local one-off components are introduced:

| Primitive | Canonical purpose | Allowed extension points | Avoid |
| --------- | ----------------- | ------------------------ | ----- |
| `Button` | Standard clickable action with consistent disabled, loading, type, size, and ARIA passthrough behavior | `variant`, `size`, `isLoading`, `leftIcon`, `rightIcon`, `className` for narrow layout adjustment | New page-local button components for normal submit, cancel, retry, link-like, or icon actions |
| `BasicModal` | General dialog foundation for custom modal content | Unique title/description ids, focus restoration, constrained body/action slots | Hand-built dialogs with independent focus traps or static ids |
| `ConfirmationModal` | Canonical destructive or high-consequence confirmation path | Tone, title, message, confirm label, pending state | `window.confirm`, toast-only confirmations, or custom delete dialogs |
| `Loader` | Blocking route, panel, or inline loading status | Contextual label, `fullScreen`, inline/panel variants | Spinners without accessible text or raw "loading..." strings in production UI |
| `EmptyState` | Empty, access-blocked, error-adjacent, and queue-empty communication | Domain variant, title, description, action, icon | Silent disappearance of sections or generic copy that hides the actual empty reason |
| `DashboardFilterBar` | Shared filter/search layout wrapper for dashboard workspaces | Labeled filter controls, result metadata, reset action, status text | Treating the wrapper as a full filter-state manager unless that API is explicitly added |
| Dashboard shell components | Role workspace navigation, skip/focus behavior, mobile parity, and shared keyboard rules | Role-specific nav items and tab content | Page-level keyboard/nav behavior that duplicates shell responsibilities |

### Async, Empty, Error, And Confirmation Standards

- Use route-level `Loader` only when the whole page cannot render useful context yet.
- Use section-level loading state when existing page context can remain visible while one panel refreshes.
- Use skeletons only for repeated cards/tables where preserving layout reduces perceived jump.
- Every fetchable list needs four explicit states: loading, success with items, success empty, and error/retry.
- Empty states must name the real reason when known: no permission, no company selected, no matching search results, no enrolled students, no configured sessions, or no data yet.
- Errors should provide a retry action when retrying the same request is safe.
- Toasts may confirm global success, but important task state must also appear near the changed row, form, or section.
- Destructive actions should use `ConfirmationModal` unless the action is reversible and locally scoped.
- Long-running mutations should expose disabled/pending state on the initiating control and keep nearby status visible after completion or failure.
- Bulk actions must show selected count, affected scope, and irreversible consequences before submit.

### System Tasks

| ID         | Severity | Area                      | Issue                                                                                                                                                    | Task                                                                                        | Owner | Status      |
| ---------- | -------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ----- | ----------- |
| SHARED-001 | P1       | Design system consistency | Shared primitives are visually varied, but behavior, semantics, and API design are inconsistent across menus, buttons, dialogs, and dashboard navigation | Define system-level standards for reusable primitives and refactor components to match them | TBD   | Not started |
| SHARED-002 | P1       | Accessibility             | Navigation, menus, tabs, and modals use mixed semantic patterns that are not consistently aligned with expected ARIA behavior                            | Run a dedicated accessibility pass on all shared interactive primitives                     | TBD   | Not started |
| SHARED-003 | P2       | Interaction architecture  | Shared shell behavior such as nav state, focus movement, overlays, and mobile tab behavior is split across multiple components                           | Consolidate shell and navigation behavior into clearer shared infrastructure                | TBD   | Not started |
| SHARED-004 | P2       | API quality               | Some shared components expose narrow or inconsistent prop APIs, which makes reuse brittle and encourages local workarounds                               | Normalize component APIs and document intended usage boundaries                             | Codex | Done        |
| SHARED-005 | P2       | State components          | Loaders, empty states, and confirmation flows exist, but they are not yet unified enough to produce one coherent product feel                            | Standardize async, empty, and destructive-action patterns across the app                    | Codex | Done        |

### Component Breakdown

#### Navigation and Menus

| ID          | Severity | Area                 | Issue                                                                                                                                                                       | Task                                                                                                                             | Owner | Status |
| ----------- | -------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ----- | ------ |
| SHARED-C001 | P1       | Navigation semantics | `DashboardSidebar.jsx` uses `menubar`/`menuitem` semantics for what is essentially application navigation, which is not the right pattern for most sidebar navigation       | Replace menu semantics with simpler, more appropriate navigation/list semantics unless a true application menu model is intended | Codex | Done   |
| SHARED-C002 | P1       | Navigation clarity   | `DashboardSidebar.jsx` prioritizes animation, hover scaling, and many category color rules, which increases visual noise in a high-frequency workspace control              | Simplify the sidebar styling so clarity and scan speed win over novelty                                                          | Codex | Done   |
| SHARED-C003 | P1       | Mobile nav semantics | `DashboardTabs.jsx` mixes tab semantics, bottom navigation behavior, and a “more options” menu in one component without a fully coherent ARIA model                         | Redesign the mobile dashboard nav as either a proper tablist or a proper mobile nav, not a hybrid semantic model                 | Codex | Done   |
| SHARED-C004 | P2       | Menu UX              | `UserMenuDropdown.jsx` is functionally useful, but it relies on rigid widths, mixed-language labels, and a visually dense layout that does not feel systematized            | Redesign the user menu around clearer grouping, localization consistency, and more robust responsive sizing                      | Codex | Done   |
| SHARED-C005 | P2       | Route consistency    | `UserMenuDropdown.jsx` hardcodes role-based destinations like `/dashboard?tab=...`, `/student?tab=...`, and `/chat`, which repeats route-logic drift already seen elsewhere | Centralize role-aware navigation targets instead of encoding them in individual menu components                                  | Codex | Done   |

#### Dialogs and Confirmation

| ID          | Severity | Area                      | Issue                                                                                                                                                                         | Task                                                                                                        | Owner | Status |
| ----------- | -------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ----- | ------ |
| SHARED-C006 | P1       | Modal structure           | `BasicModal.jsx` is the de facto dialog primitive, but it manually handles focus trap and keyboard behavior in a way that will be hard to maintain across all dialog variants | Strengthen or replace the modal foundation with a more robust shared dialog pattern                         | Codex | Done   |
| SHARED-C007 | P2       | Accessibility details     | `BasicModal.jsx` uses static `id` values like `modal-title` and `modal-description`, which can collide when multiple dialogs exist                                            | Generate unique ids per modal instance and tighten ARIA wiring                                              | Codex | Done   |
| SHARED-C008 | P2       | Visual structure          | `BasicModal.jsx` nests padding in a way that can produce awkward spacing and oversized headers/content blocks depending on consumers                                          | Simplify the dialog layout contract and standardize header/body/action spacing                              | Codex | Done   |
| SHARED-C009 | P2       | Destructive-action system | `ConfirmationModal.jsx` improves on `window.confirm`, but destructive-action patterns are still split between this component, custom dialogs, and native confirms             | Make `ConfirmationModal` the canonical destructive-confirmation path and migrate custom confirmations to it | Codex | Done   |

#### Buttons, Async States, Filters, Empty States

| ID          | Severity | Area                   | Issue                                                                                                                                                         | Task                                                                                                                       | Owner | Status |
| ----------- | -------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ----- | ------ |
| SHARED-C010 | P2       | Button API             | `Button.jsx` is too narrow for a primary shared action primitive: no `type`, `className`, `aria-*` passthrough, loading state, or size options                | Expand and normalize the shared button API so it can be reused systematically                                              | Codex | Done   |
| SHARED-C011 | P2       | Button consistency     | There appear to be multiple button implementations across `src/shared/ui/Button.jsx` and `src/components/ui/Button.jsx`, which risks style and behavior drift | Consolidate button ownership and reduce parallel button primitives                                                         | Codex | Done   |
| SHARED-C012 | P2       | Loader UX              | `Loader.jsx` is visually minimal and generic, but does not provide accessible loading text or richer contextual variants                                      | Improve loader semantics and define when to use spinners vs skeletons vs section loaders                                   | Codex | Done   |
| SHARED-C013 | P3       | Filter primitive scope | `DashboardFilterBar.jsx` is visually consistent, but it is mostly a styled wrapper rather than a real filter-system primitive                                 | Decide whether this should remain layout-only or evolve into a fuller filter pattern with labels/actions/state affordances | Codex | Done   |
| SHARED-C014 | P2       | Empty-state system     | `EmptyState.jsx` is solid, but it is still one generic pattern being stretched across many contexts with limited contextual adaptation                        | Create a small empty-state system with variants for discovery, access, operational queue, and error-adjacent states        | Codex | Done   |

#### Shared Shells

| ID          | Severity | Area            | Issue                                                                                                                                                                                             | Task                                                                                                    | Owner | Status |
| ----------- | -------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ----- | ------ |
| SHARED-C015 | P1       | Public shell    | `Header.jsx`, `Footer.jsx`, and `MainLayout.jsx` were already flagged in page audits, but together they still need a coordinated public-shell pass for semantics, navigation, and search behavior | Treat the public marketing shell as a coherent system rather than fixing those components independently | Codex | Done   |
| SHARED-C016 | P1       | Dashboard shell | `DashboardLayout.jsx`, `DashboardSidebar.jsx`, and `DashboardTabs.jsx` form a powerful shell, but they need clearer shared rules for keyboard behavior, nav semantics, and mobile parity          | Define one canonical dashboard shell model and align all role dashboards to it                          | Codex | Done   |

### Suggested Implementation Order

1. Fix shared accessibility and semantic issues in sidebar navigation, mobile tabs, and modal foundations.
2. Consolidate canonical primitives for confirmation, button, loader, and empty states.
3. Refactor route-target and shell-behavior logic out of individual menu components.
4. Run a coordinated pass on the public shell and dashboard shell as systems.

### Re-audit Checklist For Shared Components

- Shared interactive primitives follow consistent semantics.
- Menus, nav, and tabs are accessible and role-consistent.
- Dialogs use one reliable modal foundation.
- Buttons, loaders, empty states, and confirmations feel like one system.
- Public and dashboard shells each behave as coherent reusable frameworks.

---

## Reusable Template For Next Pages

Copy this section for each future page audit.

### [Page Name] Audit

- Route: ``
- Source: ``
- Related components:
    - ``

### Audit Summary

Short summary of the page’s current UX/UI state and major risk areas.

### Detailed Tasks

| ID       | Severity | Area | Issue | Task | Owner | Status      |
| -------- | -------- | ---- | ----- | ---- | ----- | ----------- |
| PAGE-001 | P1       |      |       |      | TBD   | Not started |

### Implementation Order

1.
2.
3.

### Re-audit Checklist

-
-
-
