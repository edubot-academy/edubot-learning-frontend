# AI Resume Career Assistant — Frontend Feature Plan

## Branch

- Base branch: `dev`
- Feature planning branch: `plan/ai-resume-career-assistant`

## Goal

Build a public AI resume builder and authenticated career workspace inside EduBot Learning.

The feature should let any visitor generate a resume preview, see matching jobs, and then encourage sign-up when they want to save, download, tailor the resume, generate a cover letter, apply to jobs, or track applications.

Long-term, this becomes `EduBot Career Assistant`:

```txt
Learning progress -> Career profile -> Resume -> Job matches -> Cover letter -> Application tracker -> Interview prep -> Recommended lessons
```

## Product Positioning

This should not be only a resume generator. It should be a career conversion funnel for EduBot Learning.

### Primary users

1. Public visitors who want to create a resume quickly.
2. Registered users with no course enrollment.
3. Existing course students who want to turn course progress, projects, certificates, and skills into job applications.
4. Future school/company tenants that want employability reporting.

### Main conversion loop

```txt
Visitor opens /resume-builder
-> fills simple resume form
-> AI generates resume preview
-> page shows matching jobs
-> locked actions create signup motivation
-> user signs up
-> resume draft is claimed
-> user lands in Career Dashboard
```

## Scope

### In scope for frontend planning

- Public resume builder page.
- Resume input flow.
- AI-generated resume preview UI.
- Resume quality/readiness score UI.
- Matching jobs panel shown on the same public page.
- Locked actions for unauthenticated users.
- Auth redirect intent handling.
- Career dashboard for registered users with or without course enrollment.
- AI usage limits and upgrade prompts.
- Localization keys for Kyrgyz and Russian.
- Frontend API client contracts.
- Frontend route and component architecture.
- UX states: loading, empty, limit reached, signup required, error, saved, download ready.

### Out of scope for this frontend plan

- Backend implementation details beyond API assumptions.
- AI provider selection.
- Payment provider implementation.
- Job board integrations and scraping.
- PDF rendering backend.
- Admin job-post management UI, unless later added as a separate phase.

## Recommended Routes

### Public routes

```txt
/resume-builder
```

Purpose: public landing + resume generation + job match preview.

### Auth routes with redirect intent

```txt
/signup?intent=download_resume&draftId=:draftId
/signup?intent=save_resume&draftId=:draftId
/signup?intent=apply_job&draftId=:draftId&jobId=:jobId
/signup?intent=cover_letter&draftId=:draftId&jobId=:jobId
/signup?intent=interview_plan&draftId=:draftId&jobId=:jobId
```

### Protected career routes

```txt
/career
/career/resumes
/career/resumes/:resumeId
/career/jobs
/career/jobs/:jobId
/career/applications
/career/cover-letters
/career/interview-prep
/career/usage
```

### Dashboard behavior

The existing student dashboard appears to be course-enrollment focused. Do not force resume-builder users into the learning dashboard after signup.

Recommended route logic:

```txt
If auth redirect intent exists -> complete requested career action
Else if user has active enrollment -> /dashboard
Else if user has career profile or claimed resume draft -> /career
Else -> onboarding/default dashboard
```

## Feature-First Frontend Structure

Follow the existing repo guidance: use feature-first layout under `src/features/*` and shared utilities under `src/shared/*`.

Recommended structure:

```txt
src/features/career/
  api/
    careerApi.js
    resumeApi.js
    jobMatchApi.js
    coverLetterApi.js
    applicationApi.js
    usageApi.js
  components/
    AiCreditsBadge.jsx
    CareerActionLock.jsx
    CareerDashboardCards.jsx
    CareerEmptyState.jsx
    CareerLimitReachedModal.jsx
    CareerSignupPrompt.jsx
    JobMatchCard.jsx
    JobMatchExplanation.jsx
    ResumePreview.jsx
    ResumeReadinessScore.jsx
    ResumeTemplatePreview.jsx
  pages/
    PublicResumeBuilderPage.jsx
    CareerDashboardPage.jsx
    ResumeManagerPage.jsx
    ResumeDetailPage.jsx
    JobMatchesPage.jsx
    JobDetailPage.jsx
    ApplicationsPage.jsx
    CoverLettersPage.jsx
    InterviewPrepPage.jsx
    CareerUsagePage.jsx
  hooks/
    useCareerIntent.js
    useCareerUsage.js
    useResumeDraft.js
    useJobMatches.js
  utils/
    careerLimits.js
    resumeValidation.js
    careerIntent.js
  constants/
    careerCopy.js
    careerRoutes.js
```

If the repo uses TypeScript later, mirror the same structure with `.ts/.tsx` and shared types.

## Public Resume Builder UX

### Page sections

1. Hero section.
2. Trust/value section.
3. Resume builder form.
4. Resume preview.
5. Resume score and improvement suggestions.
6. Matching jobs panel.
7. Locked premium actions.
8. Course upsell based on missing skills.

### Hero copy — Kyrgyz

```txt
AI менен профессионалдуу резюме түзүңүз

Көндүмдөрүңүздү киргизиңиз. EduBot сизге резюме түзүп,
ылайыктуу жумуштарды көрсөтүп, тапшырууга даярданууга жардам берет.
```

CTA:

```txt
Резюме түзүп баштоо
```

### Hero copy — Russian

```txt
Создайте профессиональное резюме с AI

Введите свои навыки. EduBot подготовит резюме,
подберет подходящие вакансии и поможет подготовиться к отклику.
```

CTA:

```txt
Начать создание резюме
```

### Public user allowed actions

```txt
- Generate 1 resume preview.
- See resume readiness score.
- See 3 matching jobs preview.
- See locked buttons for save/download/apply/cover letter/interview plan.
```

### Public user locked actions

```txt
- Save resume.
- Download PDF.
- Generate cover letter.
- Tailor resume for selected job.
- Apply or track applications.
- See full job list.
- Generate interview prep plan.
```

## Resume Builder Form

### Simple beginner-friendly fields

```txt
Full name
Target role
Location
Email
Phone
Skills
Projects
Experience
Education
Languages
GitHub
LinkedIn
Portfolio website
```

### Beginner quick choices

Add chips to reduce form anxiety:

```txt
- I am a beginner
- I completed a Frontend course
- I have no work experience
- I have projects
- I want remote job
- I want internship
```

### Suggested validation

- Require name or placeholder name before preview.
- Require target role.
- Require at least 3 skills or one project.
- Warn, but do not block, if GitHub/LinkedIn is missing.
- Warn if email/phone missing before download/apply.

## Resume Preview UX

After generation, show:

```txt
Your resume is ready
Resume readiness: 72/100
```

Suggested feedback categories:

```txt
Strong points
Missing information
ATS improvements
Job-readiness recommendations
```

Example:

```txt
Strong points:
- React, JavaScript, Git skills are clear.
- Project section is relevant for Junior Frontend roles.

Improve:
- Add GitHub link.
- Add English level.
- Add measurable project results.
- Add TypeScript if targeting React jobs.
```

## Matching Jobs On Same Page

After resume preview, show 3 to 5 matching jobs.

Job card fields:

```txt
Job title
Company
Location / remote
Salary if available
Match score
Matched skills
Missing skills
Short explanation
Actions
```

Actions:

```txt
View details
Tailor resume
Generate cover letter
Apply
Save job
Get interview plan
```

For public users, actions should open signup prompt with intent.

Example public state:

```txt
[Sign up to download]
[Sign up to apply]
[Sign up to generate cover letter]
```

## Cover Letter Button Logic

Show the `Generate cover letter` button when:

1. Backend returns `asksCoverLetter: true`, or
2. Job text includes cover-letter intent terms.

Suggested terms:

```txt
cover letter
motivation letter
send CV and cover letter
сопроводительное письмо
мотивационное письмо
коштомо кат
мотивациялык кат
```

If not required, show a secondary action:

```txt
Generate optional cover letter
```

## Interview Prep Plan Suggestion

After the jobs are listed, show:

```txt
Want to prepare for this job?
EduBot can generate a 7-day interview preparation plan based on this vacancy and your resume.
```

Locked public CTA:

```txt
Sign up to generate interview plan
```

Authenticated CTA:

```txt
Generate interview plan
```

## Signup Prompt UX

### Trigger points

- Save resume.
- Download PDF.
- Apply.
- Generate cover letter.
- Generate tailored resume.
- Generate interview plan.
- View more job matches.

### Kyrgyz signup prompt

```txt
Резюмеңиз даяр!

Аны сактоо, PDF жүктөө жана жумуштарга тапшыруу үчүн аккаунт түзүңүз.

- Резюмени сактоо
- PDF жүктөө
- Жумушка ылайыкташтыруу
- Коштомо кат түзүү
- Тапшырууларды көзөмөлдөө
```

CTA:

```txt
Аккаунт түзүү
```

### Russian signup prompt

```txt
Ваше резюме готово!

Создайте аккаунт, чтобы сохранить резюме, скачать PDF и откликаться на вакансии.

- Сохранить резюме
- Скачать PDF
- Адаптировать под вакансию
- Создать сопроводительное письмо
- Отслеживать отклики
```

CTA:

```txt
Создать аккаунт
```

## Career Dashboard

Create a protected career workspace that works even if the user has no course enrollment.

### Main cards

```txt
Resume readiness
Saved resumes
Best job match
Applications
AI credits remaining
Recommended next step
```

### Suggested dashboard sections

```txt
My Resume
Job Matches
Cover Letters
Applications
Interview Prep
Recommended Courses
AI Usage
```

### Non-enrolled user empty state

Kyrgyz:

```txt
EduBot Career'ге кош келиңиз!

Курска жазыла элек болсоңуз да, бул жерден резюмеңизди сактап,
жумуштарды көрүп, коштомо кат түзүп жана тапшырууларыңызды көзөмөлдөй аласыз.
```

Russian:

```txt
Добро пожаловать в EduBot Career!

Даже если вы еще не записаны на курс, здесь вы можете сохранить резюме,
найти подходящие вакансии, создать сопроводительные письма и отслеживать отклики.
```

## Usage Limits and Monetization UX

Add limits from the beginning to control AI cost and create upgrade paths.

### Recommended MVP limits

```txt
Public visitor:
- 1 resume preview
- 3 job matches preview
- no save/download
- no cover letter
- no interview plan

Free registered user:
- 3 resume generations/month
- 1 saved resume
- 1 PDF download/month
- 5 job matches/month
- 1 cover letter/month
- 1 interview prep plan/month

Course student:
- 10 resume generations/month
- 3 saved resumes
- 10 PDF downloads/month
- 30 job matches/month
- 5 cover letters/month
- 5 tailored resumes/month
- interview prep included

Career Plus:
- 20 resume generations/month
- 5 saved resumes
- 20 PDF downloads/month
- 50 job matches/month
- 10 cover letters/month
- 10 tailored resumes/month
- 5 interview prep plans/month
```

### Optional credit model for later

```txt
Resume generation = 2 credits
Resume improvement = 1 credit
Job matching = 1 credit
Cover letter = 2 credits
Tailored resume = 3 credits
Interview prep plan = 2 credits
```

### Limit reached message — Kyrgyz

```txt
Бул айдагы акысыз AI резюме лимитиңиз бүттү.

Карьера Плюска өтсөңүз:
- Көбүрөөк резюме түзөсүз
- Коштомо кат түзөсүз
- Жумушка ылайык резюме даярдайсыз
- Тапшырууларды көзөмөлдөйсүз
```

### Limit reached message — Russian

```txt
Вы использовали бесплатный лимит AI-резюме на этот месяц.

Перейдите на Карьера Плюс, чтобы:
- Создавать больше резюме
- Генерировать сопроводительные письма
- Адаптировать резюме под вакансии
- Отслеживать отклики
```

## Frontend API Assumptions

Final endpoint names can change after backend implementation, but frontend should be prepared for these contracts.

### Resume drafts

```txt
POST /career/resume-drafts
GET /career/resume-drafts/:draftId
POST /career/resume-drafts/:draftId/generate
POST /career/resume-drafts/:draftId/claim
```

### Resumes

```txt
GET /career/resumes
GET /career/resumes/:resumeId
POST /career/resumes
PATCH /career/resumes/:resumeId
POST /career/resumes/:resumeId/download
POST /career/resumes/:resumeId/tailor/:jobId
```

### Job matches

```txt
GET /career/job-matches?resumeId=:resumeId
GET /career/job-matches?draftId=:draftId
GET /career/jobs/:jobId
POST /career/jobs/:jobId/save
```

### Cover letters

```txt
POST /career/jobs/:jobId/cover-letter
GET /career/cover-letters
GET /career/cover-letters/:coverLetterId
```

### Applications

```txt
GET /career/applications
POST /career/applications
PATCH /career/applications/:applicationId
```

### Usage

```txt
GET /career/usage
GET /career/plans
```

## Core Frontend Types

Use JSDoc typedefs if the repo remains JavaScript. Convert to TypeScript later if the project migrates.

```js
/**
 * @typedef {'download_resume' | 'save_resume' | 'apply_job' | 'cover_letter' | 'tailor_resume' | 'interview_plan' | 'view_more_jobs'} CareerIntent
 */

/**
 * @typedef {Object} ResumeDraft
 * @property {string} id
 * @property {string=} sessionId
 * @property {string=} userId
 * @property {Object} input
 * @property {Object=} generatedResume
 * @property {string} status
 * @property {string} expiresAt
 */

/**
 * @typedef {Object} JobMatch
 * @property {string} id
 * @property {string} jobId
 * @property {string} title
 * @property {string} company
 * @property {number} score
 * @property {string[]} matchedSkills
 * @property {string[]} missingSkills
 * @property {boolean} asksCoverLetter
 * @property {string} explanation
 */
```

## Key Components

### `PublicResumeBuilderPage`

Responsibilities:

- Render public hero and builder.
- Manage steps: form -> preview -> matches.
- Persist temporary draft id in local storage.
- Handle signup prompts.
- Show public usage limit.

### `ResumeBuilderForm`

Responsibilities:

- Beginner-friendly form.
- Validation warnings.
- Quick chips.
- Submit to create draft and generate preview.

### `ResumePreview`

Responsibilities:

- Show generated resume in clean ATS-like layout.
- Show save/download actions.
- Use locked actions if unauthenticated.

### `ResumeReadinessScore`

Responsibilities:

- Score ring/bar.
- Strengths.
- Warnings.
- Next steps.

### `JobMatchCard`

Responsibilities:

- Match score.
- Matched/missing skills.
- Explainable reason.
- Public/authenticated CTA variants.

### `CareerActionLock`

Responsibilities:

- Generate signup URL with intent, draftId, jobId.
- Open modal or route to signup.
- Avoid duplicating lock logic in every card.

### `AiCreditsBadge`

Responsibilities:

- Show used/remaining usage.
- Link to upgrade or plan details.

### `CareerLimitReachedModal`

Responsibilities:

- Show localized limit message.
- Explain what is saved.
- Offer upgrade or course enrollment.

## Implementation Tasks

### Phase 1 — Planning and skeleton

- [ ] Add `src/features/career` directory.
- [ ] Add career route constants.
- [ ] Add placeholder pages for public resume builder and career dashboard.
- [ ] Add route entries for `/resume-builder` and `/career`.
- [ ] Add navigation entry for Career for authenticated users.
- [ ] Add hidden/public CTA entry from marketing pages if appropriate.
- [ ] Add i18n keys for `career.*` in Kyrgyz and Russian.

### Phase 2 — Public resume builder form

- [ ] Build `PublicResumeBuilderPage` layout.
- [ ] Build `ResumeBuilderForm`.
- [ ] Add beginner quick chips.
- [ ] Add client-side validation and warnings.
- [ ] Add draft creation API client.
- [ ] Add loading state for AI generation.
- [ ] Add failure state with retry.
- [ ] Store `careerResumeDraftId` in localStorage.

### Phase 3 — Resume preview

- [ ] Build `ResumePreview`.
- [ ] Build `ResumeTemplatePreview` with ATS-friendly one-column style.
- [ ] Build `ResumeReadinessScore`.
- [ ] Show strengths, missing fields, and recommendations.
- [ ] Add locked Save and Download buttons for public users.
- [ ] Add authenticated save/download button states.
- [ ] Add responsive mobile layout.

### Phase 4 — Job matches on same page

- [ ] Add job match API client.
- [ ] Fetch matches by draft id after resume generation.
- [ ] Build `JobMatchCard`.
- [ ] Show 3 public job previews.
- [ ] Show match explanation, matched skills, and missing skills.
- [ ] Add locked actions for apply, cover letter, tailor resume, and interview plan.
- [ ] Add course recommendations based on missing skills when available.

### Phase 5 — Signup intent and draft claiming

- [ ] Build `useCareerIntent` hook.
- [ ] Parse intent, draftId, jobId from query params.
- [ ] After signup/login, call draft claim endpoint.
- [ ] Redirect user to correct protected page based on intent.
- [ ] Show success screen: resume saved + next actions.
- [ ] Handle expired draft state with clear recovery message.

### Phase 6 — Career dashboard

- [ ] Build `CareerDashboardPage`.
- [ ] Add cards: Resume readiness, Best match, Applications, AI credits, Recommended next step.
- [ ] Add empty state for non-enrolled users.
- [ ] Add route links to resumes, jobs, applications, cover letters, interview prep.
- [ ] Ensure users without active course enrollment can access `/career`.
- [ ] Do not break existing course dashboard access for enrolled students.

### Phase 7 — Usage limits

- [ ] Add usage API client.
- [ ] Build `AiCreditsBadge`.
- [ ] Build `CareerLimitReachedModal`.
- [ ] Disable or lock AI actions when limit is reached.
- [ ] Show public visitor limit after one preview.
- [ ] Show free registered user monthly limits.
- [ ] Add upgrade/course upsell CTA.
- [ ] Add localized messages for limit states.

### Phase 8 — Cover letters and interview prep

- [ ] Add cover letter API client.
- [ ] Show `Generate cover letter` button only when job asks for it or optional state is enabled.
- [ ] Build cover letter preview/edit UI.
- [ ] Add locked public state.
- [ ] Add interview prep plan CTA.
- [ ] Build placeholder `InterviewPrepPage`.

### Phase 9 — Resume manager and application tracker

- [ ] Build `ResumeManagerPage`.
- [ ] Build `ResumeDetailPage`.
- [ ] Build `ApplicationsPage`.
- [ ] Add application statuses: saved, applied, interview, offer, rejected.
- [ ] Add notes field UI.
- [ ] Add job saved/applied state on cards.

### Phase 10 — Tests and quality

- [ ] Add tests for public builder form validation.
- [ ] Add tests for locked action URL generation.
- [ ] Add tests for dashboard routing behavior.
- [ ] Add tests for limit reached states.
- [ ] Add tests for job card cover-letter button condition.
- [ ] Run `npm run build`.
- [ ] Run `npm test`.
- [ ] Run localization audit if relevant: `npm run audit:localization`.

## UX Edge Cases

- Public user refreshes after generating resume: restore draft from localStorage.
- Public user hits generation limit: show signup prompt, not hard error.
- Draft expired: ask user to regenerate; keep form input if possible.
- Job match fails but resume succeeds: show resume and a retry for matches.
- Resume generation fails: preserve form and show retry.
- User signs up from cover-letter intent: claim draft, navigate to selected job cover letter flow.
- User already logged in opens `/resume-builder`: allow generation and save directly.
- User is enrolled in course and uses resume builder: connect certificates/projects when backend supports it.
- User has no enrollment: redirect to `/career`, not `/dashboard`.

## Localization Checklist

All visible text must be available in Kyrgyz and Russian.

Recommended key namespace:

```txt
career.public.hero.title
career.public.hero.subtitle
career.public.hero.cta
career.resume.form.*
career.resume.preview.*
career.resume.score.*
career.jobs.match.*
career.actions.locked.*
career.usage.*
career.dashboard.*
career.coverLetter.*
career.interviewPrep.*
career.errors.*
```

Avoid hardcoded English in UI except technical skill names like `React`, `TypeScript`, `Git`, `REST API`.

## Design Notes

- Use clean, premium, trustworthy style.
- Resume preview should be serious and ATS-friendly, not playful.
- Job match cards can be more modern and motivating.
- Use clear Tailwind spacing, rounded cards, soft shadows, and responsive two-column layout on desktop.
- On mobile, keep the flow linear: form -> preview -> score -> jobs -> signup CTA.
- Keep important CTAs sticky or repeated after long sections.

## Suggested MVP Acceptance Criteria

MVP is ready when:

- Public visitor can open `/resume-builder`.
- Public visitor can generate one resume preview.
- Public visitor can see 3 job matches.
- Save/download/apply/cover-letter actions require signup.
- Signup intent preserves the draft and redirects to Career Dashboard.
- Registered non-enrolled user can access `/career`.
- Usage limits are visible and enforced in UI.
- Kyrgyz and Russian localization keys exist for all new UI text.
- Existing enrolled student dashboard is not broken.

## Open Product Decisions

- Should Career Plus be a standalone paid product or bundled with courses?
- Should course students get Career Plus automatically or limited student credits?
- Should public resume preview allow copy text, or only visual preview?
- Should PDF generation be backend-only from the beginning?
- Should job matches come from admin-curated jobs first or pasted job descriptions first?
- Should job seeker be a new role, or should all registered users remain `student` with `hasCareerProfile`?

## Recommended Decisions For First Release

- Use existing `student` role for career users.
- Add user source/state instead of a new role.
- Start with public resume preview + curated/pasted job matches.
- Backend should own AI generation, matching, usage, and PDF generation.
- Frontend should own funnel, preview, route intent, locked states, and career workspace.
- Send non-enrolled career users to `/career`, not the existing course dashboard.
