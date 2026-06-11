# AI Resume Career Assistant — Backend Implementation Plan

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
  entities/
    career-resume-draft.entity.ts
    career-resume.entity.ts
    career-job.entity.ts
    career-job-match.entity.ts
    career-application.entity.ts
    career-cover-letter.entity.ts
    career-usage.entity.ts
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

Next migration number after existing ones: **1771000000047**

### Migration 047 — career_resume_drafts

```sql
CREATE TABLE "career_resume_drafts" (
    "id"              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    "sessionId"       varchar(255)  NOT NULL,
    "userId"          integer       REFERENCES "users"("id") ON DELETE SET NULL,
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
    "userId"          integer       NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
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
-- source: manual | scraped
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
    "userId"    integer      NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "resumeId"  UUID         REFERENCES "career_resumes"("id") ON DELETE SET NULL,
    "jobId"     UUID         REFERENCES "career_jobs"("id") ON DELETE SET NULL,
    "content"   text         NOT NULL,
    "tone"      varchar(50)  NOT NULL DEFAULT 'professional',
    "createdAt" TIMESTAMPTZ  NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE "career_applications" (
    "id"            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId"        integer      NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
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
    "userId"            integer     NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
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

---

## API Endpoints

### Public (no JWT required — accept optional JWT)

```
POST   /career/resume-drafts                       create draft
GET    /career/resume-drafts/:id                   get draft
POST   /career/resume-drafts/:id/generate          trigger AI generation
POST   /career/resume-drafts/:id/parse             parse pasted text into fields
GET    /career/job-matches?draftId=:id             job matches for a draft (public, returns max 3)
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

---

## Session Limit Enforcement (public draft)

On `POST /career/resume-drafts/`:
1. Count existing drafts with the same `sessionId` where `status IN ('ready', 'generating')`.
2. If count ≥ 1 and the request has no valid JWT, return `403 { code: 'DRAFT_LIMIT_REACHED' }`.
3. Authenticated users bypass the session limit.

---

## AI Integration

Import `AiModule` into `CareerModule`. Inject `AiAssistantService` into the generator and parser services.

### Resume generation

`CareerResumeGeneratorService.generate(draft)`:

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

`CareerJobMatcherService.scoreMatch(userSkills, context, job)` — pure function, no AI call:

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

**Phase 2**: Use `@nestjs/serve-static` + Puppeteer headless to render an HTML template server-side and stream `application/pdf`. Template chosen by `resume.templateId`.

---

## Seed Data

Create a seed script or migration (`1771000000053-seedCareerJobs.ts`) with 10–15 curated remote job listings from real sources (We Work Remotely, RemoteOK) covering:
- 3 frontend roles (React, Vue)
- 3 backend roles (Node.js, Python, Go)
- 2 fullstack roles
- 2 mobile roles (Flutter, React Native)
- 2 data/ML roles
- 1 DevOps/cloud role

All marked `isPublished: true`, `isRemote: true`, `hiresInternationally: true`, with realistic USD salary ranges.

---

## Implementation Order

### Step 1 — Migrations and entities
Write all 6 migration files and matching TypeORM entity classes. Run `npm run migration:run` to verify schema.

### Step 2 — Resume drafts (core flow, public)
- `CareerResumeDraftsService`: create, get, claim, session-limit check.
- `CareerResumeGeneratorService`: call AI, save result to draft, set `status = 'ready'`.
- `CareerResumeParserService`: call AI, return parsed fields (does not auto-update draft — frontend merges into form).
- `CareerResumeDraftsController`: wire up all endpoints.

### Step 3 — Jobs and matching
- `CareerJobsService`: list published jobs, get by id.
- Seed job data.
- `CareerJobMatcherService`: compute scores for all published jobs, persist match rows.
- `CareerJobMatchesController`: GET by draftId or resumeId.

### Step 4 — Usage service
- Wire into generator, job-match list, and cover-letter endpoints.

### Step 5 — Resumes and claim
- `CareerResumesService`: save from draft (POST claim converts draft to resume), update, list.
- Wire `POST /career/resume-drafts/:id/claim` → creates `career_resume` from draft data.

### Step 6 — Cover letters and applications
- `CareerCoverLettersService`: generate via AI, CRUD.
- `CareerApplicationsService`: CRUD.

### Step 7 — Career module wiring
- Register all entities in `CareerModule`, import `AuthModule` and `AiModule`.
- Register `CareerModule` in `AppModule`.

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

## Open Decisions

- **AI model for resume generation**: GPT-4o-mini (cost-efficient for high volume) or GPT-4o (higher quality). Start with GPT-4o-mini; upgrade model per `AiModelConfigService`.
- **Job match AI explanation**: Generate at match time (costs a call per match per draft) or generate lazily on first view. Start with lazy — only generate when the frontend requests a job's detail view.
- **Draft expiry cleanup**: Add a cron job (`@nestjs/schedule`) that sets `status = 'expired'` on drafts past `expiresAt`. Run hourly.
- **PDF generation library**: Puppeteer (accurate CSS → PDF, heavy) vs. pdfkit (lightweight, manual layout). Decide in Phase 2.
- **Job scraping**: Out of scope for MVP. Admin adds jobs manually via admin API or direct DB seed.
