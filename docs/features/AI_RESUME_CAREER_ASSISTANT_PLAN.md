# AI Resume Career Assistant — Frontend Feature Plan

## Status

| Phase | Status |
|---|---|
| 1 — Skeleton & routing | ✅ Done |
| 2 — Resume builder form | ✅ Done |
| 3 — Resume preview | 🔄 In progress |
| 4 — Job matches | 🔄 In progress |
| 5–10 | Not started |

## Branch

- Base branch: `dev`
- Feature planning branch: `plan/ai-resume-career-assistant`

## Goal

Build a standalone AI career service that helps people in Kyrgyzstan get remote jobs at US and international companies.

The service is completely independent of EduBot Learning courses. Any registered user gets the same free tier. Upgrade to Career Plus for higher limits. No enrollment checks, no course perks, no cross-referencing with the learning platform.

The only shared piece with EduBot Learning is authentication — same user account.

Long-term funnel:

```txt
Resume builder -> English resume -> Matching remote jobs (US/EU/global) -> Cover letter -> Application tracker -> Interview prep
```

## Core Value Proposition

> You learned the skills. We show you the jobs. We help you apply like someone who already knows how.

Target user: a developer, designer, or tech professional in Kyrgyzstan who has the skills but does not know how to present themselves to US or international companies, how to write an English resume, or where to find remote jobs that hire internationally.

## Product Positioning

This is not a course feature. It is a standalone career conversion tool.

### Primary users

1. Public visitors who want to see what jobs they qualify for.
2. Registered users who want to build an English resume and apply to remote jobs.
3. Job seekers with no prior connection to EduBot Learning.

### Main conversion loop

```txt
Visitor opens /resume-builder
-> enters name, target role, top skills (3 fields)
-> AI generates English resume preview immediately
-> page shows matching remote jobs with USD salaries
-> locked actions create signup motivation
-> user signs up
-> resume draft is claimed
-> user lands in Career Dashboard
```

## Scope

### In scope for frontend planning

- Public resume builder page.
- Progressive resume input flow (3 fields first, expand as user improves score).
- Paste-to-fill shortcut: user pastes existing resume text, AI parses it into the form.
- AI-generated English resume preview.
- Live resume readiness score that updates as user fills in more fields.
- Matching remote jobs panel (US/EU/global, remote-first) shown on the same public page.
- USD salary display on job cards.
- Locked actions for unauthenticated users.
- Auth redirect intent handling.
- Career dashboard for registered users.
- AI usage limits and upgrade prompts.
- Localization keys for Kyrgyz and Russian (UI only — resume output is always English).
- Frontend API client contracts.
- Frontend route and component architecture.
- UX states: loading, empty, limit reached, signup required, error, saved, download ready.

### Out of scope for this frontend plan

- Backend implementation details beyond API assumptions.
- AI provider selection.
- Payment provider implementation.
- Job board integrations and scraping.
- PDF rendering backend.
- Admin job-post management UI, unless added as a separate phase.
- Any integration with EduBot Learning course data or enrollment status.

## Service Architecture

The career API is treated as a separate service from day one.

```txt
Frontend /career/* routes -> Career API (separate base URL)
Frontend /learn/* routes  -> Learning API (existing)
```

The only shared dependency is the auth token. Career API validates the same JWT but has no knowledge of course enrollment.

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

If the user is already authenticated when visiting a `/signup?intent=...` URL, skip signup and process the intent directly.

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

### Dashboard routing

```txt
If auth redirect intent exists -> complete requested career action
Else -> /career
```

No enrollment check. No redirect to `/dashboard`. Everyone who registers via the career flow goes to `/career`.

## Feature-First Frontend Structure

Follow the existing repo guidance: feature-first layout under `src/features/*` and shared utilities under `src/shared/*`.

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
    ResumeTemplateSelector.jsx
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

## Public Resume Builder UX

### Page sections

1. Hero section.
2. Trust/value section.
3. Resume builder form (progressive — 3 fields first).
4. Paste-to-fill shortcut.
5. Resume preview (English, ATS-friendly format).
6. Live resume readiness score and one-click improvement suggestions.
7. Matching remote jobs panel (USD salaries, international roles).
8. Locked premium actions.

### Hero copy — Kyrgyz

```txt
Чет өлкөлүк компанияларга иш таап бериңиз

Көндүмдөрүңүздү киргизиңиз. EduBot сизге англисче резюме түзүп,
АКШ жана Европадагы remote жумуштарды көрсөтүп,
тапшырууга даярданууга жардам берет.
```

CTA:

```txt
Резюмени баштоо — 2 мүнөт
```

### Hero copy — Russian

```txt
Найдите работу в зарубежных компаниях

Введите свои навыки. EduBot создаст резюме на английском,
покажет remote-вакансии в США и Европе
и поможет подготовиться к отклику.
```

CTA:

```txt
Начать — 2 минуты
```

### Public user allowed actions

```txt
- Generate 1 resume preview.
- See live readiness score update while filling fields.
- See 3 matching remote jobs with USD salaries.
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

### Progressive form — start with 3 fields

Do not show all fields at once. Start with:

```txt
Full name
Target role
Top skills (chips or free text)
```

Generate the first preview immediately from these 3 fields. Show the score (e.g. 38/100) and display what would improve it. Let the user choose to fill in more.

### Full field list (shown progressively or on expand)

```txt
Target role
Full name
Location (city, country)
Email
Phone
Skills
Projects (name, description, link)
Experience
Education
Languages (including English level)
GitHub
LinkedIn
Portfolio website
```

### Paste-to-fill shortcut

Show a secondary action above the form:

```txt
Already have a resume? Paste it here and we'll fill the form for you.
```

User pastes plain text or uploads PDF. AI extracts fields into the form. User reviews and edits. This skips the form entirely for users with existing resumes.

### Beginner quick chips

```txt
- I am a beginner
- I have no work experience
- I have personal projects
- I want a remote job
- I want an internship
- I am open to contract/freelance
```

When "I am a beginner" is selected, adjust AI prompt to frame the resume around projects, courses, and transferable skills rather than work experience.

### Smart skill suggestions

When the user types a target role, suggest common skills for that role as chips. Example: "Frontend Developer" → suggest React, JavaScript, TypeScript, CSS, Git, REST API.

When adding skills, surface: "Adding TypeScript would match you to 4 more React jobs in our listings."

### Validation

- Require target role before generating preview.
- Require at least 3 skills or one project.
- Warn (do not block) if GitHub or LinkedIn is missing.
- Warn if email or phone is missing before download or apply.
- Warn if English level is not set (important for international applications).

## Resume Output

The generated resume is always in English, regardless of the UI language. This is intentional — international employers expect English resumes.

Format:
- ATS-friendly single-column layout.
- No photo, no date of birth, no nationality (US resume standard).
- Clean typography, no decorative elements.
- PDF export matches the on-screen preview exactly.

## Resume Readiness Score

Show a live score (0–100) that updates as the user fills in fields. Do not wait for regeneration — calculate an estimated score client-side as fields are added.

Feedback categories:

```txt
Strong points
Missing information
ATS improvements
International job-readiness recommendations
```

Example output:

```txt
Strong points:
- React, JavaScript, Git skills are clear.
- Project section is relevant for Junior Frontend roles.

Improve to increase your score:
- Add GitHub link.              [Add now]
- Add English level.            [Add now]
- Add measurable project results.
- Add TypeScript — required by 60% of React job listings.
```

"Add now" opens an inline input. The fix takes one click, not a page scroll.

## Resume Formats

Let the user pick a format before or after the first preview. Show real visual previews, not just names. The selected format affects both the on-screen preview and the PDF download.

All formats are:
- English only.
- ATS-safe (no tables, no text boxes, no images in the PDF layer).
- Single or two-column max — nothing that breaks a recruiter's parser.

### Available formats

#### 1. Classic — Single Column

Best for: any role, any level. The safest choice for ATS-heavy application portals (Greenhouse, Lever, Workday).

Layout:
```txt
[Name]               [Contact / Location / LinkedIn / GitHub]
─────────────────────────────────────────────────────────────
SUMMARY
Two-sentence professional summary.

SKILLS
React · TypeScript · Node.js · PostgreSQL · Git · Docker

EXPERIENCE
Job title — Company (Remote)                       2023 – Present
- Achievement one.
- Achievement two.

PROJECTS
Project name — github.com/user/project
Short description and tech stack.

EDUCATION
Degree — Institution                                      2022
```

When to recommend: always safe. Suggest this as the default.

---

#### 2. Modern — Two Column

Best for: mid-level developers and designers who want a polished look. Works well for direct applications and portfolio-style companies.

Layout:
```txt
┌──────────────────┬────────────────────────────────────────┐
│ [Name]           │ EXPERIENCE                             │
│ [Target Role]    │ Job title — Company (Remote) 2023–now  │
│                  │ - Achievement.                         │
│ CONTACT          │                                        │
│ Email            │ PROJECTS                               │
│ LinkedIn         │ Project name — link                    │
│ GitHub           │ Description.                           │
│                  │                                        │
│ SKILLS           │ EDUCATION                              │
│ React            │ Degree — Institution  2022             │
│ TypeScript       │                                        │
│ Node.js          │                                        │
└──────────────────┴────────────────────────────────────────┘
```

When to recommend: suggest when the user has 1+ years of experience or a strong portfolio.

---

#### 3. Projects First

Best for: beginners, bootcamp graduates, career changers, and anyone whose projects are stronger than their work history.

Layout:
```txt
[Name]               [Contact / LinkedIn / GitHub]
─────────────────────────────────────────────────
SKILLS
React · JavaScript · CSS · Git · REST API

PROJECTS
Project name — live link | github.com/user/project
Built a [what] using [tech]. [Result or metric].

Project name — github.com/user/project
Description. Tech: React, Node.js, PostgreSQL.

EDUCATION
Degree — Institution                                  2023

EXPERIENCE (if any)
Role — Company                                 2022–2023
- One line.

LANGUAGES
Kyrgyz (Native) · Russian (Native) · English (B2)
```

When to recommend: suggest automatically when the user selects the "I am a beginner" or "I have no work experience" chip.

---

#### 4. Minimal

Best for: senior engineers who want the content to speak without styling. Common preference in engineering-heavy companies (Stripe, Linear, Vercel aesthetic).

Layout:
```txt
Name
email@example.com · github.com/user · linkedin.com/in/user · Bishkek, KG (Remote OK)

─────────────────────────────────────────────────────────────
Experience

Job title                           Company (Remote)    2023–now
Description of impact and scope.

─────────────────────────────────────────────────────────────
Projects

Project name                        github.com/user/repo
What it does. Stack: React, Go, PostgreSQL.

─────────────────────────────────────────────────────────────
Skills
Languages: JavaScript, TypeScript, Go
Frameworks: React, Node.js, Next.js
Tools: Docker, PostgreSQL, Git, CI/CD

Education
Degree                              Institution         2022
```

When to recommend: suggest when the user has 3+ years of experience or lists senior/lead roles.

---

#### 5. Tech / Developer

Best for: developers who want to highlight GitHub activity, tech stack, and open-source work prominently. Good for companies that look at GitHub profiles before interviews.

Layout:
```txt
[Name] — [Target Role]
────────────────────────────────────────────────────────────
github.com/user | linkedin.com/in/user | portfolio.dev | Bishkek (Remote)

TECH STACK
Frontend:  React, Next.js, TypeScript, Tailwind CSS
Backend:   Node.js, Express, PostgreSQL, Redis
Tools:     Docker, GitHub Actions, Vercel, Figma

PROJECTS
────────────────────────────────────────────────────────────
Project name                              github.com/user/repo | live.link
Stack: React, Node.js, PostgreSQL
What it does and why it is interesting. Stars: 120 ★

EXPERIENCE
────────────────────────────────────────────────────────────
Job title — Company (Remote)                         2023–now
What you built. Tech used.

EDUCATION
Degree — Institution                                      2022

LANGUAGES
English B2 · Russian Native · Kyrgyz Native
```

When to recommend: suggest when the user lists GitHub and has at least 2 projects with links.

---

### Template selection UX

Show template thumbnails as visual cards before or after the first preview. Each card shows:
- Template name
- Small ASCII or rendered preview
- One-line description
- "Best for: ..." tag

Default selection: **Classic** for most users, **Projects First** auto-selected if beginner chips are checked.

Allow switching templates at any point — the content does not change, only the layout. Re-renders the preview instantly without a new AI generation.

### Component

`ResumeTemplateSelector` — rendered as a horizontal scrollable row of cards on mobile, a grid on desktop. Selected template is highlighted. Switching applies immediately to `ResumePreview`.

### API consideration

Include `templateId` in the draft and resume objects:

```txt
templateId: 'classic' | 'modern' | 'projects_first' | 'minimal' | 'tech'
```

PDF generation on the backend uses `templateId` to apply the correct layout. Frontend sends the selected `templateId` when creating or updating a draft.

## Matching Jobs Panel

Show remote-first jobs from US and international companies that hire globally.

Job sources to consider: We Work Remotely, RemoteOK, LinkedIn Remote, Greenhouse/Lever job boards, curated admin-added jobs.

Show 3 job previews publicly. Full list requires signup.

### Match scoring factors

- Skill overlap with job requirements.
- Role seniority match (junior/mid/senior).
- Whether the company accepts international/remote applicants.
- Timezone compatibility (UTC+6 is compatible with async US teams — surface this positively).

### Job card fields

```txt
Job title
Company
Location / Remote (always show "Remote" if applicable)
Salary range (USD)
Match score
Matched skills
Missing skills
Short explanation (plain language, not generic)
International hire — Yes / Unknown
Actions
```

### Job card explanation example

```txt
85% match — Why?
You have React, JavaScript, and Git which are the core requirements.
Missing: TypeScript (preferred, not required).
This company has hired remote engineers from Central Asia before.
Timezone: async-friendly, US Eastern overlap not required.
```

### Missing skills as motivation

```txt
You're missing TypeScript for this role.
EduBot can help you add it in 2 weeks.
[Learn TypeScript]   [Apply anyway]
```

### Actions

```txt
View details
Tailor resume for this job
Generate cover letter
Apply
Save job
Get interview prep plan
```

For public users, all actions open signup prompt with intent.

## Cover Letter UX

### When to show the Generate cover letter button

Show when:
1. Backend returns `asksCoverLetter: true`, or
2. Job text includes cover-letter intent terms.

Terms to detect:

```txt
cover letter
motivation letter
send CV and cover letter
сопроводительное письмо
мотивационное письмо
коштомо кат
мотивациялык кат
```

If not required, show secondary action:

```txt
Generate optional cover letter
```

### Cover letter handles the international context

The generated cover letter should naturally address:
- Remote work preference and timezone (UTC+6 is async-compatible with US teams).
- English proficiency (stated confidently, not apologetically).
- Availability and overlap hours if relevant.

The user should not have to figure out how to write this themselves.

### Cover letter editor

Show the generated letter inline on the page, not in a modal. Support:
- Inline text editing.
- Tone selector: Professional / Friendly / Concise.
- Length selector: Short (3 paragraphs) / Full.
- One-click copy or download.

## Interview Prep Plan

After jobs are listed, show:

```txt
Want to prepare for this job?
EduBot can generate a 7-day interview preparation plan
based on this vacancy and your resume.
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
- Tailor resume.
- Generate interview prep plan.
- View more job matches.

### Signup prompt design

Show the user's draft resume thumbnail so they can see what they have. Make it clear the draft is preserved.

### Kyrgyz signup prompt

```txt
Резюмеңиз даяр!

Аны сактоо, PDF жүктөө жана жумуштарга тапшыруу үчүн аккаунт түзүңүз.
30 секундада катталыңыз — резюмеңиз сизди күтөт.

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
30 секунд — и ваше резюме вас ждёт.

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

After signup, the user always lands at `/career`. The dashboard should never feel empty — always show a clear next step.

### Main cards

```txt
Resume readiness
Saved resumes
Best job match (with USD salary)
Applications
AI credits remaining
Recommended next step
```

### Dashboard sections

```txt
My Resume
Job Matches
Cover Letters
Applications
Interview Prep
AI Usage
```

### Recommended next step card logic

```txt
No resume yet             -> "Build your resume — takes 2 minutes"
Resume exists, no matches -> "Find matching remote jobs"
Matches exist, no apps    -> "Ready to apply? Your top match is paying $X,000/month"
Applications exist        -> "You have X applications in progress"
```

### Empty state

Kyrgyz:

```txt
EduBot Career'ге кош келиңиз!

Бул жерден англисче резюме түзүп, АКШ жана Европадагы
remote жумуштарды таап, коштомо кат жазып жана
тапшырууларыңызды көзөмөлдөй аласыз.
```

Russian:

```txt
Добро пожаловать в EduBot Career!

Здесь вы можете создать резюме на английском,
найти remote-вакансии в США и Европе,
написать сопроводительное письмо и отслеживать свои отклики.
```

## Application Tracker

Use a Kanban board layout, not a table.

Columns:

```txt
Saved -> Applied -> Interview -> Offer / Rejected
```

Users drag cards between columns. Each card shows: job title, company, USD salary, date applied, and a notes field. This gives users a clear view of their pipeline without needing a spreadsheet.

## Usage Limits

All registered users get the same free tier. No special tier for course students. Upgrade to Career Plus for higher limits.

### Tiers

```txt
Public visitor:
- 1 resume preview
- 3 job matches preview
- No save / download / cover letter / interview plan

Free registered user:
- 3 resume generations/month
- 1 saved resume
- 1 PDF download/month
- 5 job matches/month
- 1 cover letter/month
- 1 interview prep plan/month

Career Plus (paid):
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
Resume generation   = 2 credits
Resume improvement  = 1 credit
Job matching        = 1 credit
Cover letter        = 2 credits
Tailored resume     = 3 credits
Interview prep plan = 2 credits
```

### Limit reached — Kyrgyz

```txt
Бул айдагы акысыз AI резюме лимитиңиз бүттү.

Карьера Плюска өтсөңүз:
- Көбүрөөк резюме түзөсүз
- Коштомо кат жазасыз
- Жумушка ылайык резюме даярдайсыз
- Тапшырууларды көзөмөлдөйсүз
```

### Limit reached — Russian

```txt
Вы использовали бесплатный лимит AI-резюме на этот месяц.

Перейдите на Карьера Плюс, чтобы:
- Создавать больше резюме
- Генерировать сопроводительные письма
- Адаптировать резюме под вакансии
- Отслеживать отклики
```

When the public visitor hits the 1-preview limit, show the signup prompt — not a hard error. Their draft is preserved.

## Frontend API Assumptions

Final endpoint names can change after backend implementation.

### Resume drafts

```txt
POST   /career/resume-drafts                              — create draft (public, uses sessionId)
GET    /career/resume-drafts/:draftId                     — get draft
POST   /career/resume-drafts/:draftId/generate            — trigger AI generation
POST   /career/resume-drafts/:draftId/parse               — parse pasted resume text into draft fields
POST   /career/resume-drafts/:draftId/claim               — claim draft after signup (associates with userId)
```

Draft includes both `sessionId` (for public tracking) and `userId` (after claim). Frontend creates a UUID session id on first load and stores it in localStorage alongside the draft id. Both are sent on draft creation so the backend can enforce the public 1-preview limit per session.

### Resumes

```txt
GET    /career/resumes                                    — list saved resumes
GET    /career/resumes/:resumeId                          — get resume
POST   /career/resumes                                    — save resume
PATCH  /career/resumes/:resumeId                          — update resume
GET    /career/resumes/:resumeId/download                 — download PDF (returns application/pdf or signed URL)
POST   /career/resumes/:resumeId/tailor/:jobId            — tailor resume for job (returns new resume object, does not overwrite)
```

Note: download is `GET`, not `POST`. Tailor creates a new resume and returns it — the original is preserved.

### Job matches

```txt
GET    /career/job-matches?resumeId=:resumeId             — matches for saved resume
GET    /career/job-matches?draftId=:draftId               — matches for draft (public)
GET    /career/jobs/:jobId                                 — job detail
POST   /career/jobs/:jobId/save                           — save job
```

### Cover letters

```txt
POST   /career/cover-letters                              — generate cover letter (body: { resumeId, jobId })
GET    /career/cover-letters                              — list cover letters
GET    /career/cover-letters/:coverLetterId               — get cover letter
PATCH  /career/cover-letters/:coverLetterId               — update (user edits)
```

Note: cover letter generation uses a dedicated endpoint with `resumeId` in the body so the backend knows which resume to base it on.

### Applications

```txt
GET    /career/applications                               — list applications
POST   /career/applications                               — create (body: { jobId, resumeId, coverLetterId? })
PATCH  /career/applications/:applicationId                — update status or notes
```

### Usage

```txt
GET    /career/usage                                      — current usage vs limits
GET    /career/plans                                      — available plans and pricing
```

## Core Frontend Types

```js
/**
 * @typedef {'download_resume' | 'save_resume' | 'apply_job' | 'cover_letter' | 'tailor_resume' | 'interview_plan' | 'view_more_jobs'} CareerIntent
 */

/**
 * @typedef {Object} ResumeDraft
 * @property {string} id
 * @property {string} sessionId       — client-generated UUID, stored in localStorage
 * @property {string=} userId         — set after claim
 * @property {Object} input           — raw form fields, also stored in localStorage for recovery
 * @property {Object=} generatedResume
 * @property {number=} readinessScore
 * @property {'classic' | 'modern' | 'projects_first' | 'minimal' | 'tech'} templateId
 * @property {string} status          — 'pending' | 'generating' | 'ready' | 'claimed' | 'expired'
 * @property {string} expiresAt
 */

/**
 * @typedef {Object} JobMatch
 * @property {string} id
 * @property {string} jobId
 * @property {string} title
 * @property {string} company
 * @property {string} location
 * @property {boolean} isRemote
 * @property {string=} salaryMin       — USD
 * @property {string=} salaryMax       — USD
 * @property {number} score
 * @property {string[]} matchedSkills
 * @property {string[]} missingSkills
 * @property {boolean} asksCoverLetter
 * @property {boolean=} hiresInternationally
 * @property {string} explanation
 */

/**
 * @typedef {Object} CareerUsage
 * @property {number} resumeGenerations
 * @property {number} resumeGenerationsLimit
 * @property {number} savedResumes
 * @property {number} savedResumesLimit
 * @property {number} pdfDownloads
 * @property {number} pdfDownloadsLimit
 * @property {number} jobMatches
 * @property {number} jobMatchesLimit
 * @property {number} coverLetters
 * @property {number} coverLettersLimit
 * @property {number} interviewPlans
 * @property {number} interviewPlansLimit
 * @property {'visitor' | 'free' | 'career_plus'} plan
 */
```

## Key Components

### `PublicResumeBuilderPage`

- Render public hero and progressive builder.
- Manage steps: 3-field entry -> preview -> expand form -> matches.
- Persist `careerResumeDraftId`, `careerSessionId`, and raw form input in localStorage.
- Handle signup prompts with intent.
- Show public usage limit after one preview.

### `ResumeBuilderForm`

- Show 3 fields initially (name, target role, skills).
- Expand to full form after first preview.
- Paste-to-fill shortcut above the form.
- Quick chips for beginner context.
- Smart skill suggestions from target role.
- Validation warnings inline.

### `ResumePreview`

- Render generated English resume in ATS-friendly single-column layout.
- No photo, no date of birth fields.
- Locked Save and Download for unauthenticated users.
- Authenticated save/download button states.
- Responsive mobile layout.

### `ResumeReadinessScore`

- Score ring or bar.
- Updates live as form fields change (client-side estimate between generations).
- Strengths list.
- One-click fix suggestions (inline inputs, not page navigation).
- Next steps.

### `JobMatchCard`

- Match score percentage.
- USD salary range (prominent).
- Remote badge.
- International hire indicator.
- Matched/missing skills.
- Plain-language explanation.
- Public/authenticated CTA variants.

### `CareerActionLock`

- Generate signup URL with intent, draftId, jobId.
- If user is already authenticated, process intent directly without going to signup.
- Open modal or route to signup.
- Centralizes lock logic — not duplicated in every card.

### `AiCreditsBadge`

- Show used/remaining for the current month.
- Link to upgrade or plan details.

### `CareerLimitReachedModal`

- Show localized limit message.
- Explain that the draft is preserved.
- Offer Career Plus upgrade.

## Implementation Tasks

### Phase 1 — Skeleton and routing ✅

- [x] Add `src/features/career` directory.
- [x] Add career route constants (`src/features/career/constants/careerRoutes.js`).
- [x] Add placeholder pages for public resume builder and career dashboard.
- [x] Add route entries for `/resume-builder` and `/career/*`.
- [x] Add navigation entry for Career for authenticated users (Header.jsx).
- [x] Add i18n keys for `career.*` in Kyrgyz, Russian, and English (per-feature files aggregated via spread).
- [x] Confirm career API base URL is separate from learning API.

### Phase 2 — Progressive resume builder form ✅

- [x] Build `PublicResumeBuilderPage` layout with hero, trust strip, how-it-works, builder card.
- [x] Build `ResumeBuilderForm` — name, target role, skills fields with validation.
- [x] Add paste-to-fill strip (UI present; parse API wired — `POST /career/resume-drafts/:id/parse`).
- [x] Add beginner quick chips with prompt adjustment (6 chips, toggled into `context` array).
- [x] Add smart skill suggestions from target role (role→skill map in `careerCopy.js`).
- [x] Add client-side validation and inline warnings (`resumeValidation.js`).
- [x] Add draft creation API client (`src/features/career/api/resumeApi.js` — create, generate, parse, get, claim).
- [x] Generate `careerSessionId` UUID on first load, store in localStorage (`useResumeDraft.js`).
- [x] Store draft id and raw form input in localStorage for recovery.
- [x] Add loading state for AI generation (spinner + "AI is writing your resume…" label).
- [x] Add failure state with retry; error distinguishes service-down from other errors.

### Phase 3 — Resume preview 🔄

- [x] CSS-only template mini-previews (5 templates in form selector).
- [x] `templateId` sent in draft create/update API calls.
- [x] Template lifted to page-level state — switch re-renders without new AI generation.
- [ ] Build `ResumePreview` — full ATS-friendly rendered preview (no photo, no DOB).
- [ ] Build `ResumeReadinessScore` with live client-side score updates.
- [ ] Show one-click fix suggestions with inline inputs.
- [ ] Auto-select Projects First when beginner chips active.
- [ ] Add locked Save and Download buttons for public users.
- [ ] Add authenticated save/download states.

### Phase 4 — Job matches 🔄

- [x] `useJobMatches` hook wired into `PublicResumeBuilderPage` — auto-fetches on draft ready.
- [x] Public limit: 3 job cards visible, rest gated behind signup prompt.
- [ ] Add job match API client (`src/features/career/api/jobMatchApi.js`).
- [ ] Build `JobMatchCard` with USD salary, remote badge, international hire indicator.
- [ ] Build `JobMatchCardSkeleton` loading state.
- [ ] Show plain-language explanation per match.
- [ ] Show matched/missing skills and inline missing-skill nudge.
- [ ] Add locked actions for apply, cover letter, tailor resume, and interview plan.

### Phase 5 — Signup intent and draft claiming

- [ ] Build `useCareerIntent` hook.
- [ ] Parse intent, draftId, jobId from query params.
- [ ] If already authenticated, process intent directly without redirecting to signup.
- [ ] After signup/login, call draft claim endpoint.
- [ ] Redirect user to correct protected page based on intent.
- [ ] Show success screen: resume saved + next actions.
- [ ] Handle expired draft with clear recovery message (form input is in localStorage).

### Phase 6 — Career dashboard

- [ ] Build `CareerDashboardPage`.
- [ ] Add cards: Resume readiness, Best match (USD salary), Applications, AI credits, Recommended next step.
- [ ] Recommended next step card follows the logic in the Dashboard section above.
- [ ] Add empty state.
- [ ] Add Kanban application tracker layout.
- [ ] Add route links to resumes, jobs, applications, cover letters, interview prep.

### Phase 7 — Usage limits

- [ ] Add usage API client.
- [ ] Build `AiCreditsBadge`.
- [ ] Build `CareerLimitReachedModal`.
- [ ] Disable or lock AI actions when limit is reached.
- [ ] Show public visitor limit after one preview (signup prompt, not error).
- [ ] Show free registered user monthly limits.
- [ ] Add Career Plus upgrade CTA.
- [ ] Add localized messages for limit states.

### Phase 8 — Cover letters and interview prep

- [ ] Add cover letter API client (POST body includes `resumeId` and `jobId`).
- [ ] Show `Generate cover letter` button when job requires it or as optional.
- [ ] Build inline cover letter editor with tone and length selectors.
- [ ] Build cover letter list page.
- [ ] Add locked public state.
- [ ] Add interview prep plan CTA.
- [ ] Build placeholder `InterviewPrepPage`.

### Phase 9 — Resume manager and application tracker

- [ ] Build `ResumeManagerPage`.
- [ ] Build `ResumeDetailPage` with tailor-for-job action.
- [ ] Build `ApplicationsPage` with Kanban board.
- [ ] Add application statuses: saved, applied, interview, offer, rejected.
- [ ] Add drag-and-drop between columns.
- [ ] Add notes field on application cards.
- [ ] Add job saved/applied state on job cards.

### Phase 10 — Tests and quality

- [ ] Add tests for public builder form validation.
- [ ] Add tests for locked action URL generation.
- [ ] Add tests for intent processing when user is already authenticated.
- [ ] Add tests for dashboard routing behavior (always `/career`).
- [ ] Add tests for limit reached states.
- [ ] Add tests for job card cover-letter button condition.
- [ ] Add E2E test for full funnel: public resume generation -> signup -> draft claim -> career dashboard.
- [ ] Run `npm run build`.
- [ ] Run `npm test`.
- [ ] Run localization audit: `npm run audit:localization`.

## UX Edge Cases

- Public user refreshes after generating resume: restore draft id and form input from localStorage, show resume if draft is still valid.
- Public user hits generation limit: show signup prompt with draft thumbnail — not a hard error.
- Draft expired: show clear message, restore form input from localStorage so user can regenerate without retyping.
- Job match fails but resume succeeds: show resume and a retry button for matches.
- Resume generation fails: preserve form and show retry.
- User signs up from cover-letter intent: claim draft, navigate directly to the cover letter generation flow for the selected job.
- Authenticated user opens `/resume-builder`: allow generation and save directly — no signup prompt.
- Already-authenticated user visits `/signup?intent=...`: skip signup, process intent immediately.
- Tailor resume: creates a new resume object, original is not overwritten. Show diff of what changed.
- User on mobile: form shows one field at a time, CTAs are sticky at the bottom.

## Localization Checklist

All visible UI text must be in Kyrgyz and Russian. The generated resume content is always in English.

Technical skill names (React, TypeScript, Git, REST API, etc.) are not translated.

```txt
career.public.hero.title
career.public.hero.subtitle
career.public.hero.cta
career.resume.form.*
career.resume.preview.*
career.resume.score.*
career.jobs.match.*
career.jobs.salary            — e.g. "$3,000 – $6,000 / month"
career.jobs.remote
career.jobs.hiresInternationally
career.actions.locked.*
career.usage.*
career.dashboard.*
career.coverLetter.*
career.interviewPrep.*
career.errors.*
career.signup.prompt.*
```

## Design Notes

- Use clean, premium, trustworthy style.
- Resume preview must look like a real professional English resume — serious, ATS-friendly, no decorative elements.
- Job match cards should be modern and motivating — USD salary is the hero data point on the card.
- Tailwind spacing, rounded cards, soft shadows, responsive two-column layout on desktop.
- On mobile: linear flow — form -> preview -> score -> jobs -> signup CTA. Important CTAs are sticky.
- Auto-save everything silently. Show quiet "Saved" indicator. Never show "are you sure you want to leave?" for form data.

## MVP Acceptance Criteria

MVP is ready when:

- Public visitor can open `/resume-builder`.
- Public visitor can generate one English resume preview from 3 fields.
- Public visitor can paste existing resume text to fill the form.
- Public visitor can see 3 matching remote jobs with USD salaries.
- Live readiness score updates as form fields are filled.
- Save/download/apply/cover-letter actions require signup.
- Signup intent preserves the draft and redirects to `/career`.
- Registered user always lands at `/career` after signup — no enrollment check.
- Usage limits are visible and enforced in UI.
- Kyrgyz and Russian localization keys exist for all new UI text.
- Resume output is always in English.
- Existing EduBot Learning routes and course dashboard are not affected.

## Open Product Decisions

- Should Career Plus be monthly subscription or one-time purchase?
- Should public resume preview allow copy-paste of text, or visual preview only?
- Should PDF generation be entirely backend-owned, or should frontend offer a client-side print-to-PDF fallback?
- Should job matches start with admin-curated jobs or scraped/aggregated feeds?
- Should the app support Kyrgyz-language resumes for local Kyrgyz employers in a future phase?
