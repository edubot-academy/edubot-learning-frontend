# AI Resume Career Assistant — Backend Implementation Plan

## Frontend Integration Log

- 2026-06-11: Frontend started consuming protected career endpoints beyond draft flow.
- 2026-06-11: First connected protected pages: resumes, jobs, job detail, usage.
- 2026-06-11: Frontend now uses `POST /career/resumes` for authenticated preview save and consumes claim response to resolve resume-aware redirect paths.
- 2026-06-11: Hardened career AI JSON parsing for resume generation, parser, and tailor flows to tolerate fenced or truncated model output.
- 2026-06-11: Rebuilt backend after tightening truncated JSON repair for incomplete string/object endings.
- 2026-06-11: Frontend now consumes live save/apply state in job flows; remaining backend gaps are a dedicated interview-plan generation endpoint and an application upsert/job-scoped lookup endpoint to avoid client-side dedupe by `jobId`.

## Overview

The career service lives **inside the existing NestJS monolith** as a new feature module `src/career/`. All endpoints are prefixed `/career/`. The frontend treats it as a separate base URL but it runs on the same Express server. The module boundary makes future extraction easy.

Only the JWT is shared with the learning platform. Career has no knowledge of course enrollment or company roles.

---

## Module Structure

```
src/career/
  career.module.ts
  controllers/
    career-resume-drafts.controller.ts
    career-resumes.controller.ts
    career-jobs.controller.ts
    career-job-matches.controller.ts
    career-cover-letters.controller.ts
    career-applications.controller.ts
    career-usage.controller.ts
  services/
    career-resume-drafts.service.ts
    career-resume-generator.service.ts   ← AI generation
    career-resume-parser.service.ts      ← paste-to-fill
    career-resumes.service.ts
    career-jobs.service.ts
    career-job-matcher.service.ts        ← match scoring + explanation
    career-cover-letters.service.ts
    career-applications.service.ts
    career-usage.service.ts
    career-pdf.service.ts                ← PDF download (Phase 2)
    career-saved-jobs.service.ts         ← saved jobs
  entities/
    career-resume-draft.entity.ts
    career-resume.entity.ts
    career-job.entity.ts
    career-job-match.entity.ts
    career-application.entity.ts
    career-cover-letter.entity.ts
    career-usage.entity.ts
    career-saved-job.entity.ts
  dto/
    create-resume-draft.dto.ts
    generate-resume-draft.dto.ts
    parse-resume-draft.dto.ts
    update-resume.dto.ts
    create-cover-letter.dto.ts
    update-application.dto.ts
```

---

## Database — Tables and Migrations

Career migration sequence starts at **1771000000047**.

Note: this backend's TypeORM `User` entity maps to table `"user"` (singular). Career migrations therefore reference `"user"("id")`, not `"users"("id")`.

### Migration 047 — career_resume_drafts

```sql
CREATE TABLE "career_resume_drafts" (
    "id"              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    "sessionId"       varchar(255)  NOT NULL,
    "userId"          integer       REFERENCES "user"("id") ON DELETE SET NULL,
    "input"           jsonb         NOT NULL DEFAULT '{}',
    "generatedResume" jsonb,
    "readinessScore"  integer,
    "templateId"      varchar(50)   NOT NULL DEFAULT 'classic',
    "status"          varchar(50)   NOT NULL DEFAULT 'pending',
    "expiresAt"       TIMESTAMPTZ   NOT NULL DEFAULT (now() + interval '24 hours'),
    "createdAt"       TIMESTAMPTZ   NOT NULL DEFAULT now(),
    "updatedAt"       TIMESTAMPTZ   NOT NULL DEFAULT now()
);
-- status: pending | generating | ready | claimed | expired | failed
CREATE INDEX "IDX_career_resume_drafts_sessionId" ON "career_resume_drafts" ("sessionId");
CREATE INDEX "IDX_career_resume_drafts_userId"    ON "career_resume_drafts" ("userId");
```

### Migration 048 — career_resumes

```sql
CREATE TABLE "career_resumes" (
    "id"              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId"          integer       NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "name"            varchar(255)  NOT NULL DEFAULT 'My Resume',
    "templateId"      varchar(50)   NOT NULL DEFAULT 'classic',
    "input"           jsonb         NOT NULL DEFAULT '{}',
    "generatedResume" jsonb         NOT NULL DEFAULT '{}',
    "readinessScore"  integer,
    "sourceDraftId"   UUID          REFERENCES "career_resume_drafts"("id") ON DELETE SET NULL,
    "createdAt"       TIMESTAMPTZ   NOT NULL DEFAULT now(),
    "updatedAt"       TIMESTAMPTZ   NOT NULL DEFAULT now()
);
CREATE INDEX "IDX_career_resumes_userId" ON "career_resumes" ("userId");
```

### Migration 053 — unique sourceDraftId

```sql
ALTER TABLE "career_resumes"
ADD CONSTRAINT "UQ_career_resumes_sourceDraftId" UNIQUE ("sourceDraftId");
```

Prevents two `CareerResume` rows from being created from the same draft (double-claim race condition).

### Migration 049 — career_jobs

```sql
CREATE TABLE "career_jobs" (
    "id"                   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    "title"                varchar(255) NOT NULL,
    "company"              varchar(255) NOT NULL,
    "location"             varchar(255),
    "isRemote"             boolean      NOT NULL DEFAULT true,
    "salaryMin"            integer,
    "salaryMax"            integer,
    "salaryCurrency"       varchar(10)  NOT NULL DEFAULT 'USD',
    "salaryPeriod"         varchar(20)  NOT NULL DEFAULT 'month',
    "requiredSkills"       text[]       NOT NULL DEFAULT '{}',
    "preferredSkills"      text[]       NOT NULL DEFAULT '{}',
    "description"          text,
    "applyUrl"             varchar(2048),
    "hiresInternationally" boolean      NOT NULL DEFAULT false,
    "asksCoverLetter"      boolean      NOT NULL DEFAULT false,
    "experienceLevel"      varchar(50),
    "isPublished"          boolean      NOT NULL DEFAULT false,
    "sortOrder"            integer      NOT NULL DEFAULT 0,
    "source"               varchar(50)  NOT NULL DEFAULT 'manual',
    "externalId"           varchar(255),
    "createdAt"            TIMESTAMPTZ  NOT NULL DEFAULT now(),
    "updatedAt"            TIMESTAMPTZ  NOT NULL DEFAULT now()
);
-- experienceLevel: junior | mid | senior
-- source: manual | hh | enbek | jsearch | remotive | devkg | telegram | partner
CREATE INDEX "IDX_career_jobs_isPublished" ON "career_jobs" ("isPublished");
```

### Migration 050 — career_job_matches

```sql
CREATE TABLE "career_job_matches" (
    "id"            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    "draftId"       UUID        REFERENCES "career_resume_drafts"("id") ON DELETE CASCADE,
    "resumeId"      UUID        REFERENCES "career_resumes"("id") ON DELETE CASCADE,
    "jobId"         UUID        NOT NULL REFERENCES "career_jobs"("id") ON DELETE CASCADE,
    "score"         integer     NOT NULL,
    "matchedSkills" text[]      NOT NULL DEFAULT '{}',
    "missingSkills" text[]      NOT NULL DEFAULT '{}',
    "explanation"   text,
    "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "CHK_career_job_matches_source" CHECK (
        ("draftId" IS NOT NULL AND "resumeId" IS NULL) OR
        ("draftId" IS NULL AND "resumeId" IS NOT NULL)
    )
);
CREATE INDEX "IDX_career_job_matches_draftId"  ON "career_job_matches" ("draftId");
CREATE INDEX "IDX_career_job_matches_resumeId" ON "career_job_matches" ("resumeId");
```

### Migration 051 — career_cover_letters and career_applications

```sql
CREATE TABLE "career_cover_letters" (
    "id"        UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId"    integer      NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "resumeId"  UUID         REFERENCES "career_resumes"("id") ON DELETE SET NULL,
    "jobId"     UUID         REFERENCES "career_jobs"("id") ON DELETE SET NULL,
    "content"   text         NOT NULL,
    "tone"      varchar(50)  NOT NULL DEFAULT 'professional',
    "createdAt" TIMESTAMPTZ  NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE "career_applications" (
    "id"            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId"        integer      NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "jobId"         UUID         NOT NULL REFERENCES "career_jobs"("id") ON DELETE CASCADE,
    "resumeId"      UUID         REFERENCES "career_resumes"("id") ON DELETE SET NULL,
    "coverLetterId" UUID         REFERENCES "career_cover_letters"("id") ON DELETE SET NULL,
    "status"        varchar(50)  NOT NULL DEFAULT 'saved',
    "notes"         text,
    "appliedAt"     TIMESTAMPTZ,
    "createdAt"     TIMESTAMPTZ  NOT NULL DEFAULT now(),
    "updatedAt"     TIMESTAMPTZ  NOT NULL DEFAULT now()
);
-- status: saved | applied | interview | offer | rejected
CREATE INDEX "IDX_career_applications_userId" ON "career_applications" ("userId");
```

### Migration 052 — career_usage

```sql
CREATE TABLE "career_usage" (
    "id"                SERIAL      PRIMARY KEY,
    "userId"            integer     NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "periodStart"       date        NOT NULL,
    "resumeGenerations" integer     NOT NULL DEFAULT 0,
    "pdfDownloads"      integer     NOT NULL DEFAULT 0,
    "jobMatchRequests"  integer     NOT NULL DEFAULT 0,
    "coverLetters"      integer     NOT NULL DEFAULT 0,
    "interviewPlans"    integer     NOT NULL DEFAULT 0,
    "plan"              varchar(50) NOT NULL DEFAULT 'free',
    "createdAt"         TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt"         TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE ("userId", "periodStart")
);
-- plan: free | career_plus
```

### Migration 054 — no demo job seed

The original demo seed migration has been neutralized. `career_jobs` must be populated by real job ingestion, admin-created listings, or partner imports. Demo rows with `externalId LIKE 'career-seed-%'` are removed by a follow-up cleanup migration.

### Migration 057 — remove demo career jobs

Deletes already-inserted demo rows:

```sql
DELETE FROM "career_jobs"
WHERE "externalId" LIKE 'career-seed-%';
```

### Migration 055 — career_saved_jobs

```sql
CREATE TABLE "career_saved_jobs" (
    "id"        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId"    integer     NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "jobId"     UUID        NOT NULL REFERENCES "career_jobs"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "UQ_career_saved_jobs_user_job" UNIQUE ("userId", "jobId")
);
CREATE INDEX "IDX_career_saved_jobs_userId" ON "career_saved_jobs" ("userId");
```

---

## API Endpoints

### Public (no JWT required — accept optional JWT)

```
POST   /career/resume-drafts                       create draft
GET    /career/resume-drafts/:id                   get draft
POST   /career/resume-drafts/:id/generate          trigger AI generation  [IP throttle: 10/hr]
POST   /career/resume-drafts/:id/parse             parse pasted text into fields  [IP throttle: 20/hr]
GET    /career/job-matches?draftId=:id             job matches for a draft (public, returns max 3)
GET    /career/jobs                                list published jobs
GET    /career/jobs/:id                            job detail
```

### Protected (JWT required)

```
POST   /career/resume-drafts/:id/claim             associate draft with user after signup

GET    /career/resumes                             list user resumes
GET    /career/resumes/:id                         get resume
POST   /career/resumes                             save resume
PATCH  /career/resumes/:id                         update resume
GET    /career/resumes/:id/download                download PDF
POST   /career/resumes/:id/tailor/:jobId           tailor for job (returns new resume)

GET    /career/job-matches?resumeId=:id            matches for saved resume (full list)

GET    /career/jobs/saved                          list saved jobs
POST   /career/jobs/:id/save                       save job
DELETE /career/jobs/:id/save                       remove saved job

POST   /career/cover-letters                       generate cover letter
GET    /career/cover-letters                       list cover letters
GET    /career/cover-letters/:id                   get cover letter
PATCH  /career/cover-letters/:id                   update content

POST   /career/applications                        create application
GET    /career/applications                        list applications
PATCH  /career/applications/:id                    update status / notes

GET    /career/usage                               usage vs limits
GET    /career/plans                               plan definitions
```

---

## Authentication Strategy

Public endpoints use a custom `@OptionalJwt()` decorator that runs the JWT guard but does not reject unauthenticated requests. If a valid token is present, `req.user` is populated; if not, `req.user` is `null`. The service stores `userId` on the draft when available.

Protected endpoints use the existing `JwtAuthGuard`.

### Rate limiting on AI endpoints

`POST :id/generate` and `POST :id/parse` run `AuthThrottleGuard` ahead of the optional-JWT guard with IP-keyed limits (10 generation / 20 parse calls per hour). This applies to both anonymous and authenticated callers.

### Draft ownership

If a draft's `userId` is set, `POST :id/generate` requires the JWT user to match it (403 `DRAFT_ACCESS_DENIED` otherwise). Anonymous drafts (`userId = null`) rely solely on the IP throttle.

`POST :id/claim` additionally enforces ownership inside the transaction: if `draft.userId` is already set and differs from the claiming user, the claim is rejected.

### Draft expiry

`findById` compares `expiresAt` to now for all statuses except `claimed`. Expired drafts are updated to `status = 'expired'` and return 410 Gone (`DRAFT_EXPIRED`). `claim()` repeats the expiry check inside the locked transaction so an expired-but-unread ready draft cannot be claimed. The 24-hour TTL is set at creation time.

### Claim concurrency

`claim()` wraps the read–insert–update in a TypeORM transaction with a `SELECT … FOR UPDATE` lock on the draft row. The `UNIQUE ("sourceDraftId")` constraint on `career_resumes` (migration 053) provides a second line of defence at the DB level.

### CareerUsage tracking

`CareerResumeGeneratorService.generate()` uses `CareerUsageService.assertAndIncrement(userId, 'resumeGenerations')` for authenticated users after the request wins the atomic `pending` → `generating` transition and before the AI call. If the user is over limit, the draft is restored to `pending` and generation is not started. The shared usage service stores usage against the current month start in `career_usage`.

---

## Session Limit Enforcement (public draft)

On `POST /career/resume-drafts/`:
1. Count existing drafts with the same `sessionId` where `status IN ('ready', 'generating')`.
2. If count ≥ 1 and the request has no valid JWT, return `403 { code: 'DRAFT_LIMIT_REACHED' }`.
3. Authenticated users bypass the session limit.

---

## AI Integration

Import `AiModule` into `CareerModule`. Inject `AiAssistantService` into generator, parser, matcher, and cover-letter services.

### Resume generation

`CareerResumeGeneratorService.generate(draft, userId?)`:

```typescript
const response = await this.aiAssistant.generateResponse(
    [{ role: 'user', content: JSON.stringify(draft.input) }],
    {
        systemPrompt: RESUME_GENERATION_SYSTEM_PROMPT,
        forceJson: true,
        modelPurpose: 'chat',
        temperature: 0.4,
        maxTokens: 2000,
    },
);
const generated = JSON.parse(response.content);
// generated = { header, summary, skills, experience, projects, education, languages, readinessScore, readinessFeedback }
```

**System prompt** (`RESUME_GENERATION_SYSTEM_PROMPT`):

```
You are a professional English resume writer.
Speciality: resumes for tech professionals in Central Asia applying to remote US/EU companies.

Rules:
- Output ONLY valid JSON, no prose.
- Resume language: English always.
- No photo, date of birth, nationality.
- ATS-safe: no tables, no text boxes.
- If the user selected context chips like "beginner" or "no_experience",
  lead with Projects and Skills — not Experience.
- Use concrete language. No filler phrases ("dynamic", "passionate about").
- If a field is empty, omit it from the output — never invent facts.

Output schema:
{
  "header": { "name": "", "role": "", "email": "", "phone": "", "location": "",
              "linkedin": "", "github": "", "portfolio": "" },
  "summary": "Two-sentence professional summary.",
  "skills": ["React", "TypeScript"],
  "experience": [{ "title": "", "company": "", "period": "", "bullets": [""] }],
  "projects": [{ "name": "", "link": "", "description": "", "stack": "" }],
  "education": [{ "degree": "", "institution": "", "year": "" }],
  "languages": [{ "name": "English", "level": "B2" }],
  "readinessScore": 65,
  "readinessFeedback": {
    "strengths": [""],
    "improvements": [{ "key": "github", "label": "Add GitHub link", "impact": "high" }]
  }
}
```

### Paste-to-fill parser

```typescript
const response = await this.aiAssistant.generateResponse(
    [{ role: 'user', content: rawText }],
    {
        systemPrompt: RESUME_PARSE_SYSTEM_PROMPT,
        forceJson: true,
        temperature: 0.1,
        maxTokens: 1000,
    },
);
```

**System prompt**:

```
Parse the following resume text into structured JSON.
Extract: name, targetRole, skills (array of strings), experience, education, projects, github, linkedin, portfolio, languages.
Return ONLY valid JSON matching the schema. If a field is not present, omit it.
```

### Cover letter generation

```typescript
const response = await this.aiAssistant.generateResponse(
    [{ role: 'user', content: buildCoverLetterUserMessage(resume, job, tone) }],
    {
        systemPrompt: COVER_LETTER_SYSTEM_PROMPT,
        temperature: 0.6,
        maxTokens: 800,
    },
);
```

**System prompt**:

```
You write professional English cover letters for tech professionals in Kyrgyzstan applying to remote US/EU companies.

Always address naturally (do not explain or apologize for):
- Timezone (UTC+6 is async-compatible with US East teams)
- English proficiency (state it confidently with level if known)
- Remote work readiness

Tone options: professional | friendly | concise
Length options: short (3 paragraphs) | full (5 paragraphs)

Return plain text — no JSON, no markdown headers.
```

---

## Job Matching Algorithm

`CareerJobMatcherService.scoreMatch(userSkills, context, job)` — deterministic score calculation, no AI call:

```typescript
function scoreMatch(userSkills: string[], context: string[], job: CareerJob): MatchResult {
    const normalizedUser = userSkills.map(s => s.toLowerCase());
    const required = job.requiredSkills.map(s => s.toLowerCase());
    const preferred = job.preferredSkills.map(s => s.toLowerCase());

    const matchedRequired  = required.filter(s => normalizedUser.includes(s));
    const matchedPreferred = preferred.filter(s => normalizedUser.includes(s));
    const missingRequired  = required.filter(s => !normalizedUser.includes(s));

    // Skill score: 50pts max
    const skillScore = required.length > 0
        ? (matchedRequired.length / required.length) * 40
          + Math.min(10, (matchedPreferred.length / Math.max(preferred.length, 1)) * 10)
        : 30;  // no listed requirements → generous baseline

    // Level fit: 20pts max
    const isBeginner = context.includes('beginner') || context.includes('no_experience');
    const levelScore =
        job.experienceLevel === 'junior' && isBeginner    ? 20 :
        job.experienceLevel === 'junior' && !isBeginner   ? 15 :
        job.experienceLevel === 'senior' && isBeginner    ?  0 :
        job.experienceLevel === null                      ? 15 : 10;

    // International hire: 20pts max
    const intlScore = job.hiresInternationally ? 20 : 8;

    // Remote: 10pts max
    const remoteScore = job.isRemote ? 10 : 0;

    const score = Math.min(100, Math.round(skillScore + levelScore + intlScore + remoteScore));

    return {
        score,
        matchedSkills: [...matchedRequired, ...matchedPreferred].map(s => originalCase(s, userSkills)),
        missingSkills: missingRequired.map(s => originalCase(s, required)),
    };
}
```

**AI explanation** is generated once when a match row is created, then cached. It is not regenerated on re-query.

Explanation prompt (user message):

```
Resume: ${targetRole}, skills: ${matchedSkills.join(', ')}.
Job: ${job.title} at ${job.company}, requires: ${job.requiredSkills.join(', ')}.
Missing: ${missingSkills.join(', ')}.
International hiring: ${job.hiresInternationally ? 'Yes' : 'Unknown'}.
Timezone: UTC+6.

Write a plain-language 2–3 sentence match explanation. Focus on skill overlap, missing skills, and timezone compatibility. No filler.
```

---

## Usage Limits

`CareerUsageService.assertAndIncrement(userId, action)` — called at the start of each metered operation:

```typescript
const LIMITS = {
    free: {
        resumeGenerations: 3,
        pdfDownloads: 1,
        jobMatchRequests: 5,
        coverLetters: 1,
        interviewPlans: 1,
    },
    career_plus: {
        resumeGenerations: 20,
        pdfDownloads: 20,
        jobMatchRequests: 50,
        coverLetters: 10,
        interviewPlans: 5,
    },
};

async assertAndIncrement(userId: number, action: UsageAction): Promise<void> {
    const periodStart = startOfMonth(new Date());
    const row = await this.upsertUsageRow(userId, periodStart);
    const limit = LIMITS[row.plan][action];
    if (row[action] >= limit) {
        throw new ForbiddenException({ code: 'LIMIT_REACHED', action, limit });
    }
    await this.repo.increment({ id: row.id }, action, 1);
}
```

---

## PDF Generation

**Phase 1 (MVP)**: `GET /career/resumes/:id/download` returns the `generatedResume` JSON and a `406 Not Acceptable` with `{ code: 'PDF_NOT_IMPLEMENTED' }`. Frontend shows "Download coming soon."

**Phase 2**: Use `@nestjs/serve-static` + Puppeteer/Playwright headless to render an HTML template server-side and stream `application/pdf`. Template chosen by `resume.templateId`. Phase 2 renderer code may exist behind the service boundary, but the active route stays on the Phase 1 placeholder until product enables PDF downloads.

---

## Job Ingestion

`career_jobs` is a cache of real external/admin job listings. It must not rely on demo seed data.

### Required sources

| Market | Primary source | Notes |
|--------|----------------|-------|
| Local / Kyrgyzstan | hh.ru API + local curated jobs | Kyrgyzstan-first roles. |
| Central Asia | hh.ru API + enbek.kz API | Kazakhstan plus the wider region. |
| Russian-speaking | hh.ru API | CIS-oriented roles where Russian is common. |
| EU | JSearch / RapidAPI | EU-targeted international roles. |
| US | JSearch / RapidAPI | US-targeted international roles. |
| Middle East | Partner feeds / curated import | UAE, KSA, Qatar and similar markets. |
| Remote fallback | Remotive.io | Useful when `workModePreference = remote_only`. |
| Local IT community | dev.kg scraper | No public API; HTML-scrapable. |
| Telegram channels | Telegram direct submission bot first; parser later | Prefer structured submissions before scraping channels. |

### Sync strategy

- Fetch external jobs into `career_jobs`; user-facing requests read from the DB, not live third-party APIs.
- Use `source` and `externalId` for idempotent upserts.
- Set `isPublished = false` for scraped/parser jobs that need admin review.
- Set `isPublished = true` only for trusted APIs, partner feeds, or reviewed jobs.
- Run scheduled sync jobs with `@nestjs/schedule`: hourly for hh.ru/remotive where safe, daily for slower paid APIs or partner feeds.
- Normalize external data into existing columns: title, company, location, remote flag, salary, required/preferred skills, description, apply URL, source, externalId.
- Preserve source-specific raw data only if a future `metadata jsonb` column is added.

### API behavior

`GET /career/jobs` must support:

```txt
limit?: number
market?: local | central_asia | russian_speaking | eu | us | middle_east | all
workMode?: remote_only | any
```

The API filters cached jobs by market/source/location and work mode. It must return an empty list when no real jobs are available rather than falling back to demo listings.

---

## Implementation Order

### ✅ Step 1 — Migrations and entities
Migrations 047–053 written. All TypeORM entity classes created. Schema live.

### ✅ Step 2 — Resume drafts (core flow, public)
- `CareerResumeDraftsService`: create, get (with expiry enforcement), claim (transactional + ownership check), session-limit check.
- `CareerResumeGeneratorService`: test-and-set status, enforce `CareerUsage` for authenticated users, call AI, save result, eagerly persist job matches.
- `CareerResumeParserService`: validate draft id, call AI, return parsed fields with JSON.parse error handling.
- `CareerResumeDraftsController`: all endpoints wired; IP throttle on generate/parse; draft ownership guard on generate.

### ✅ Step 3 — Jobs and matching
- `CareerJobsService`: list published jobs, get by id.
- `CareerJobMatcherService`: compute scores for all published jobs, persist match rows.
- `CareerJobMatchesController`: GET by draftId or resumeId.
- Draft generation now eagerly persists draft job matches.

### ⏳ Step 3b — Real job ingestion
- Add provider clients for the selected first sources.
- Add a scheduled `CareerJobSyncService` that upserts into `career_jobs`.
- Implement market/work-mode-aware backend filtering for `GET /career/jobs`.
- Add tests covering source upsert idempotency, published filtering, and empty-state behavior when no jobs exist.

### ✅ Step 4 — Usage service
All metered actions use `CareerUsageService.assertAndIncrement(...)`. `resumeGenerations` is enforced before the AI call after the request wins the draft generation transition; job matches and cover letters are wired in their respective services. PDF download limits are wired in the Phase 2 PDF service but the active MVP endpoint returns `406 PDF_NOT_IMPLEMENTED`.

### ✅ Step 5 — Resumes and claim
- `CareerResumesService`: list, get, create, update.
- `CareerResumesController`: CRUD endpoints, download placeholder, tailor endpoint.
- (Claim itself is already implemented in Step 2.)

### ✅ Step 6 — Cover letters and applications
- `CareerCoverLettersService`: generate via AI, CRUD.
- `CareerApplicationsService`: CRUD.

### ✅ Step 7 — Career module wiring
All entities registered in `CareerModule`. `AuthModule` and `AiModule` imported. `CareerModule` registered in `AppModule`.

### ✅ Step 8 — Saved jobs
- `CareerSavedJob` entity and migration 055.
- `CareerSavedJobsService`: save, remove, list user saved jobs.
- `CareerJobsController`: `GET /career/jobs/saved`, `POST /career/jobs/:id/save`, `DELETE /career/jobs/:id/save`.

### Remaining gaps
- Real job ingestion/sync is not complete. Without it, `/career/jobs` returns only manually inserted/admin imported rows.
- PDF streaming is still Phase 2 only. MVP returns `406 PDF_NOT_IMPLEMENTED`.
- Career endpoint coverage is currently focused on service-level tests, not a full HTTP/e2e suite.

---

## Error Response Shape

All career errors follow:

```json
{
    "code": "DRAFT_LIMIT_REACHED | LIMIT_REACHED | DRAFT_NOT_FOUND | GENERATION_FAILED | ...",
    "message": "Human-readable message",
    "action": "resume_generation"  // present on LIMIT_REACHED
}
```

Frontend detects `code` to show the correct UI state (signup prompt vs. upgrade modal vs. generic error).

---

## Implementation Notes and Open Decisions

- **AI model for resume generation**: GPT-4o-mini (cost-efficient for high volume) or GPT-4o (higher quality). Start with GPT-4o-mini; upgrade model per `AiModelConfigService`.
- **Job match AI explanation**: Currently generated once when match rows are created, then cached on `career_job_matches.explanation`.
- **Draft expiry cleanup**: Add a cron job (`@nestjs/schedule`) that sets `status = 'expired'` on drafts past `expiresAt`. Run hourly.
- **PDF generation library**: Phase 2 service code currently uses a headless browser renderer with fallback output, but the active route remains the MVP placeholder until PDF downloads are enabled.
- **Job ingestion**: Required for the location/market preference feature. Prefer API/partner/direct-submission sources first; use scraping only where no API exists and ToS risk is acceptable.
