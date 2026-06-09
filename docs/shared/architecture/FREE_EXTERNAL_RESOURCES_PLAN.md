# Free External Learning Resources — EduBot Learning Integration Plan

_Last updated: 2026-06-09_

## 1. Purpose

EduBot Learning should help students discover high-quality free learning opportunities without making the product feel like a simple link directory. The goal is to make EduBot the place where users:

- discover trusted free courses and materials;
- understand which resource fits their goal;
- save resources into their learning plan;
- track progress and notes;
- use EduBot AI/mentorship support while studying;
- return to EduBot even when the original content is hosted by Harvard, Google, Microsoft, freeCodeCamp, MDN, AWS, or another official provider.

The external provider remains the official content owner. EduBot acts as the learning guide, organizer, tracker, and support layer.

## 2. Product Positioning

### Public-facing name

Recommended Kyrgyz name:

- **Акысыз билим мүмкүнчүлүктөрү**

Alternative shorter name:

- **Акысыз ресурстар**

### Internal feature name

- **External Learning Resources**

### Marketing message

> EduBot Learning сизге дүйнөдөгү сапаттуу акысыз курстарды таап гана бербейт — аларды кантип окууну, эмнеден баштоону жана прогрессти кантип көзөмөлдөөнү да жеңилдетет.

### What EduBot should claim

Good wording:

- “EduBot сунуштаган акысыз тышкы ресурстар”
- “Дүйнөлүк платформалардагы акысыз окуу мүмкүнчүлүктөрү”
- “Curated by EduBot Learning”
- “Official course opens on provider website”

Avoid wording:

- “EduBot Harvard courses”
- “Harvard courses inside EduBot”
- “Official Harvard partner”
- “Get Harvard certificate from EduBot”
- “EduBot provides Harvard certificates”

## 3. Repo Review Summary

Current frontend structure supports this as an incremental feature, not a new app.

Observed integration points:

- `src/pages/Home.jsx` composes public marketing sections: `HeroStart`, `StickyButton`, `Benefits`, `TopCourses`, `TopLearnersHome`, `Instructor`, `Apply`, `Feedback`, and `FAQ`.
- `src/pages/Courses.jsx` already handles the public courses catalog, sorting, loading state, error state, empty state, and show-more behavior.
- `src/app/routes.jsx` already exposes public `/courses` and `/courses/:id` routes.
- `src/features/courses/components/CardCourse.jsx` is strongly connected to internal paid/video course behavior: cart, favorites, price, rating, lesson count, and internal route navigation.

Conclusion:

- Add the feature inside EduBot Learning.
- Do not create a separate platform.
- Do not force external resources into the existing `CardCourse` at MVP stage.
- Create separate `externalResources` feature components and pages, then integrate them into Home and Courses.

## 4. Core Strategy

The desired experience is:

```text
User discovers a resource in EduBot
→ opens EduBot resource guide page
→ understands what it is and how to study it
→ saves it to learning plan
→ tracks progress inside EduBot
→ opens official provider only when needed
→ returns to EduBot for notes, AI help, reminders, and related EduBot courses
```

EduBot should become the student’s:

```text
Discovery + Roadmap + Notes + Progress + AI Help + Certificate Tracking platform
```

The official provider remains the source of the course content.

## 5. MVP Scope

### MVP should include

1. Homepage section for featured free resources.
2. Public resources listing page.
3. Resource detail page inside EduBot.
4. Static curated resource data in frontend.
5. Resource cards with provider, level, language, certificate info, and official link.
6. Course page integration as an additional “free resources” section or tab.
7. Clear external-provider disclaimer.
8. Login/signup gating only for EduBot-owned actions such as saving, starting, notes, progress, and learning plan.
9. Redirect-back behavior after login/signup.

### MVP should not include yet

1. Backend admin CRUD.
2. Full user progress tracking, unless backend support already exists.
3. Certificate uploads.
4. Resource-to-lesson mapping in backend.
5. AI assistant integration.
6. Embedding provider videos or copying provider materials.
7. Payment/cart integration for external resources.
8. Attempting to manage Harvard/edX/Google/Microsoft/freeCodeCamp accounts inside EduBot.

## 6. Recommended Frontend Structure

Create:

```text
src/features/externalResources/
  data/externalResources.js
  utils/externalResourceFilters.js
  components/ExternalResourceCard.jsx
  components/ExternalResourcesHomeSection.jsx
  components/ExternalResourceFilters.jsx
  components/ExternalResourcesGrid.jsx
  components/ExternalResourceDisclaimer.jsx
  components/ExternalResourceAuthPrompt.jsx
  pages/ExternalResourcesPage.jsx
  pages/ExternalResourceDetails.jsx
```

Update:

```text
src/pages/Home.jsx
src/pages/Courses.jsx
src/app/routes.jsx
src/i18n/locales/ky/public.js
src/i18n/locales/ru/public.js
src/i18n/locales/en/public.js
```

## 7. Routes

Add these public routes:

```jsx
const ExternalResourcesPage = lazy(() => import('../features/externalResources/pages/ExternalResourcesPage'));
const ExternalResourceDetails = lazy(() => import('../features/externalResources/pages/ExternalResourceDetails'));

<Route path="/resources" element={<ExternalResourcesPage />} />
<Route path="/resources/:slug" element={<ExternalResourceDetails />} />
```

Optional later route alias:

```jsx
<Route path="/free-resources" element={<Navigate to="/resources" replace />} />
```

## 8. Static Data Model for MVP

Use a frontend data file first:

```js
export const externalResources = [
  {
    id: 'harvard-cs50',
    slug: 'harvard-cs50',
    title: 'CS50: Introduction to Computer Science',
    provider: 'Harvard / edX',
    providerKey: 'harvard',
    category: 'programming',
    level: 'beginner',
    language: 'English',
    priceLabel: 'Free to audit',
    certificateLabel: 'Paid optional',
    durationLabel: '11 weeks',
    url: 'https://pll.harvard.edu/course/cs50-introduction-computer-science',
    shortDescription: 'Computer science fundamentals, algorithms, data structures, and problem solving.',
    whatYouWillLearn: [
      'Computer science foundations',
      'Algorithms and data structures',
      'Problem-solving mindset',
      'Programming basics'
    ],
    whoIsItFor: [
      'Beginner programmers',
      'Students preparing for software engineering',
      'Developers who want stronger fundamentals'
    ],
    whyEduBotRecommends: 'A strong foundation for anyone starting programming or strengthening problem-solving.',
    studyPlan: [
      {
        title: 'Week 1',
        description: 'Start the course, understand the structure, and complete the first introductory tasks.'
      }
    ],
    relatedEduBotCourseSlugs: ['frontend']
  }
];
```

## 9. Initial Curated Resource Set

Start with 20–30 resources. Do not add hundreds at first. Quality is more important than quantity.

### Harvard / edX

1. CS50: Introduction to Computer Science
2. CS50 Python
3. CS50 Web Programming with Python and JavaScript
4. CS50 AI with Python
5. CS50 Databases with SQL
6. CS50 Cybersecurity
7. Entrepreneurship in Emerging Economies
8. Exercising Leadership
9. Remote Work Revolution for Everyone

### Frontend / Web

10. MDN HTML Guide
11. MDN CSS Guide
12. MDN JavaScript Guide
13. JavaScript.info
14. React Official Learn
15. freeCodeCamp Responsive Web Design
16. freeCodeCamp JavaScript Algorithms and Data Structures
17. freeCodeCamp Front End Development Libraries

### AI / Data / Cloud

18. Google AI Essentials or Google AI learning resources
19. Microsoft Learn AI Fundamentals
20. Hugging Face NLP Course
21. Kaggle Learn Python
22. Kaggle Learn Intro to Machine Learning
23. AWS Skill Builder Cloud Practitioner Essentials
24. Microsoft Learn Azure Fundamentals

### English / Teachers / Productivity

25. BBC Learning English
26. British Council LearnEnglish
27. Google for Education Teacher Center
28. Canva Design School
29. HubSpot Academy Content Marketing
30. HubSpot Academy Digital Marketing

## 10. Homepage Section Plan

Add `<ExternalResourcesHomeSection />` after `<TopCourses />` and before `<TopLearnersHome />`.

### Section content

Eyebrow:

```text
Акысыз билим мүмкүнчүлүктөрү
```

Title:

```text
Дүйнөлүк акысыз курстарды бир жерден табыңыз
```

Description:

```text
Harvard, Google, Microsoft, freeCodeCamp, MDN жана башка платформалардагы пайдалуу акысыз ресурстарды EduBot сиз үчүн тандап берет.
```

CTA:

```text
Акысыз ресурстарды көрүү
```

Secondary CTA:

```text
Кантип окуу керек?
```

### Featured cards

Show 4–6 resources:

- Harvard CS50
- CS50 Python
- CS50 AI
- freeCodeCamp Responsive Web Design
- MDN JavaScript Guide
- Microsoft Learn AI Fundamentals

### Marketing goal

This section should communicate generosity and trust. Users should feel that EduBot is not only selling courses, but helping them find real learning opportunities.

## 11. Courses Page Integration

Current `/courses` page should remain focused on EduBot internal courses, but add a secondary section.

Recommended MVP placement:

- Keep existing course catalog at top.
- After the course grid, add a section called:

```text
Кошумча акысыз билим ресурстары
```

Description:

```text
Бул ресурстар EduBot тарабынан түзүлгөн эмес. Биз аларды студенттерге кошумча мүмкүнчүлүк катары сунуштайбыз.
```

CTA:

```text
Бардык акысыз ресурстарды көрүү
```

Show 3–6 cards.

### Later improvement

Add a segmented control near the top:

```text
[ EduBot курстары ] [ Акысыз ресурстар ]
```

This can be implemented after the standalone `/resources` page is stable.

## 12. Resource Detail Page UX

Every external resource should have an EduBot-owned guide page.

### Page sections

1. Hero
   - title
   - provider
   - level
   - language
   - price/certificate labels
   - official link CTA

2. EduBot explanation
   - “Бул курс эмне жөнүндө?”
   - “Кимдер үчүн ылайыктуу?”
   - “Эмнеден баштоо керек?”

3. Study plan
   - weekly or step-by-step checklist
   - recommended time commitment

4. Why EduBot recommends it
   - short practical explanation

5. Related EduBot courses
   - upsell softly and ethically

6. Disclaimer
   - external provider notice

### Main CTAs

Primary:

```text
EduBot ичинде окуу планын баштоо
```

Secondary:

```text
Расмий курсту ачуу
```

Optional if user is logged in later:

```text
Менин окуу планыма кошуу
```

## 13. Signup, Login, and Access Strategy

External free resources should be public for discovery, but EduBot-owned learning actions should require an EduBot account.

The principle is:

```text
Free resource discovery = public
EduBot learning companion = account required
Official provider account = handled outside EduBot
```

### 13.1 Public access — no EduBot login required

Anyone should be able to open:

```text
/resources
/resources/:slug
```

Without login, users can see:

- course/resource title;
- provider;
- short description in Kyrgyz/Russian/English;
- level;
- language;
- estimated duration;
- certificate info;
- “why EduBot recommends this”;
- study guidance preview;
- official provider link.

This supports SEO, Instagram traffic, trust building, and platform marketing.

Do not force signup before the user understands the value.

### 13.2 EduBot login required — for learning companion actions

Require EduBot login for actions that store user-specific data or create long-term retention:

| Feature | Login needed? |
|---|---:|
| Browse resources | No |
| View resource detail page | No |
| Open official provider link | No |
| Save resource | Yes |
| Start resource | Yes |
| Add to My Learning Plan | Yes |
| Track progress | Yes |
| Notes | Yes |
| AI helper | Yes |
| Reminders | Yes |
| Certificate/screenshot upload | Yes |
| My Learning Plan dashboard | Yes |

### 13.3 Recommended logged-out button behavior

On an external resource detail page, logged-out users should see:

Primary CTA:

```text
EduBot ичинде окуу планын баштоо
```

Secondary CTA:

```text
Расмий курсту ачуу
```

When they click the primary CTA, show a login/signup prompt.

Modal title:

```text
Окуу планыңызды сактоо үчүн аккаунт түзүңүз
```

Modal body:

```text
EduBot сиздин прогрессиңизди, notes жана сертификаттарыңызды сактап берет. Расмий курс провайдердин сайтында ачылат.
```

Modal buttons:

```text
Аккаунт түзүү
Кирүү
Азырынча расмий курсту ачуу
```

### 13.4 Recommended logged-in button behavior

For logged-in users, show:

```text
Окууну баштоо
Менин окуу планыма кошуу
Расмий курсту ачуу
```

After the user starts the resource, change CTAs to:

```text
Окууну улантуу
Прогрессти жаңыртуу
Notes ачуу
Расмий курсту ачуу
```

### 13.5 Redirect-back flow after login/signup

When a logged-out user clicks “save”, “start”, or “add to learning plan”, redirect them to auth with a return URL.

Example:

```text
/login?redirect=/resources/harvard-cs50&intent=save-resource
/register?redirect=/resources/harvard-cs50&intent=start-resource
```

After successful login/signup:

```text
/resources/harvard-cs50
```

Then complete or resume the intended action:

```text
CS50 окуу планыңызга кошулду ✅
```

Implementation options:

1. Store `redirect` and `intent` in query params.
2. After auth success, read and validate the redirect path.
3. Navigate back to the resource page.
4. If backend support exists, run the intended action.
5. If backend support does not exist yet, show the detail page and a clear CTA.

Security note:

- Only allow internal relative redirects like `/resources/harvard-cs50`.
- Do not allow arbitrary external redirect URLs.

### 13.6 External provider login

Harvard/edX, Google, Microsoft, freeCodeCamp, AWS, and other providers may require their own account.

EduBot should not try to manage external provider authentication unless there is an official partnership, API, or SSO integration.

Show this explanation near the official link:

```text
Бул курс расмий провайдердин сайтында ачылат. Курсту көрүү үчүн Harvard/edX, Google, Microsoft же башка провайдердин аккаунту керек болушу мүмкүн. EduBot сизге окуу планын, прогрессти жана кошумча жардамды сактап берет.
```

### 13.7 Best user journey

Do not use this flow:

```text
Resource card → official provider website
```

Use this flow:

```text
Resource card
→ EduBot resource guide page
→ user reads value
→ user saves/starts in EduBot
→ EduBot asks for login only when useful
→ user opens official provider when ready
→ user returns to EduBot for progress, notes, AI help, reminders, and related EduBot courses
```

### 13.8 Product rationale

This approach balances user trust and platform growth:

- Users can see value without signup friction.
- EduBot still captures serious learners when they want saving/tracking.
- EduBot becomes the learning system, not just a traffic source to external platforms.
- The official course remains on the provider website, reducing legal and technical risk.
- EduBot account becomes valuable because it stores progress, notes, reminders, and certificates.

## 14. How to Keep Users in EduBot

Do not use this flow:

```text
Resource card → official provider website
```

Use this flow:

```text
Resource card → EduBot resource guide page → save/start/plan → official provider link
```

Retention features for later:

- Save resource
- Start resource
- Weekly checklist
- Notes
- AI assistant
- Reminders
- Certificate upload
- Related EduBot lessons
- Student dashboard widget
- “Continue external resource” reminders

## 15. Related EduBot Course Integration

External resources should support EduBot courses, not replace them.

Examples:

### Frontend course

After HTML/CSS module:

- MDN HTML
- MDN CSS
- freeCodeCamp Responsive Web Design

After JavaScript module:

- JavaScript.info
- MDN JavaScript Guide
- freeCodeCamp JavaScript Algorithms and Data Structures
- Harvard CS50

After React module:

- React Official Learn
- freeCodeCamp Front End Development Libraries

### AI course

- CS50 AI with Python
- Microsoft Learn AI Fundamentals
- Google AI learning resources
- Hugging Face NLP Course

### Backend course

- CS50 Python
- CS50 Databases with SQL
- Django documentation
- PostgreSQL tutorial resources

### Career / remote work course

- Remote Work Revolution for Everyone
- Exercising Leadership
- HubSpot Academy resources

## 16. Ethical Upsell Patterns

Use helpful wording:

```text
Бул курс англис тилинде. Эгер кыргызча түшүндүрмө, практика жана ментордук колдоо керек болсо, EduBot Frontend курсун караңыз.
```

```text
Бул тышкы ресурс теорияны бекемдөөгө жардам берет. Практикалык тапшырмалар жана кыргызча түшүндүрмөлөр үчүн EduBot курсун улантыңыз.
```

Avoid making external resources feel like bait. The external resource should be genuinely useful even if the user does not buy anything.

## 17. Future Backend Model

When MVP validates demand, move data to backend.

### ExternalResource

```text
id
slug
title
provider
providerKey
url
category
level
language
priceType
certificateType
durationLabel
shortDescription
whatYouWillLearn[]
whoIsItFor[]
whyEduBotRecommends
studyPlan[]
tags[]
relatedCourseIds[]
isFeatured
isPublished
createdAt
updatedAt
```

### UserExternalResourceProgress

```text
id
userId
resourceId
status: saved | started | in_progress | paused | completed
progressPercent
notes
certificateUrl
startedAt
completedAt
lastOpenedAt
createdAt
updatedAt
```

### CourseExternalResource

```text
id
courseId
resourceId
moduleId nullable
lessonId nullable
placement: course | module | lesson
sortOrder
note
createdAt
updatedAt
```

## 18. Admin/Instructors Later

Admin and instructors should be able to:

- create/edit external resources;
- mark a resource as featured;
- connect resources to courses, sections, or lessons;
- add Kyrgyz guidance notes;
- hide outdated resources;
- review click/save/completion analytics.

## 19. Analytics Events

Track these events later:

```text
external_resource_viewed
external_resource_saved
external_resource_started
external_resource_official_link_clicked
external_resource_completed
external_resource_certificate_uploaded
external_resource_related_edubot_course_clicked
external_resource_auth_prompt_shown
external_resource_auth_started
external_resource_auth_completed
```

These analytics help answer:

- Which free resources attract users?
- Which providers are most useful?
- Which free resources convert users to EduBot courses?
- Which topics should EduBot create courses for?
- Where do users drop off: detail page, auth prompt, official link, or progress tracking?

## 20. Legal and Safety Notes

- Do not copy/upload provider videos, PDFs, assignments, quizzes, or full course materials unless the license clearly allows it.
- Do not use provider logos in a way that implies partnership.
- Do not create certificates that look like provider certificates.
- Always link to the official provider page.
- Use neutral wording: “recommended”, “curated”, “external resource”.
- Keep a disclaimer on resource detail pages.
- Keep external provider authentication outside EduBot unless there is an official API/SSO integration.

Suggested disclaimer:

```text
Бул ресурс EduBot тарабынан түзүлгөн эмес жана EduBot расмий өнөктөш экенин билдирбейт. Биз бул шилтемени студенттерге пайдалуу акысыз билим мүмкүнчүлүгү катары сунуштайбыз. Курстун шарттары, сертификаты жана мазмуну расмий провайдердин сайтында аныкталат.
```

## 21. Implementation Tasks

### Phase 1 — Frontend MVP

- [ ] Create `src/features/externalResources/data/externalResources.js`.
- [ ] Add 20–30 curated resources with complete metadata.
- [ ] Create `ExternalResourceCard.jsx`.
- [ ] Create `ExternalResourcesGrid.jsx`.
- [ ] Create `ExternalResourcesHomeSection.jsx`.
- [ ] Create `ExternalResourceAuthPrompt.jsx`.
- [ ] Add section to `src/pages/Home.jsx` after `TopCourses`.
- [ ] Create `ExternalResourcesPage.jsx`.
- [ ] Create `ExternalResourceDetails.jsx`.
- [ ] Add `/resources` and `/resources/:slug` routes to `src/app/routes.jsx`.
- [ ] Add Kyrgyz, Russian, and English translations.
- [ ] Add disclaimer component.
- [ ] Add logged-out CTA behavior for save/start actions.
- [ ] Add login/register redirect params: `redirect` and `intent`.
- [ ] Validate redirect params to prevent open redirects.
- [ ] Add responsive mobile UI.
- [ ] Validate dark mode styling.

### Phase 2 — Course Page Integration

- [ ] Add `FeaturedExternalResources` block under `/courses` grid.
- [ ] Add CTA to `/resources`.
- [ ] Show related resources by category.
- [ ] Add “extra resources” section on course detail pages.
- [ ] Add resource recommendations based on course category/slug.

### Phase 3 — Logged-in Student Features

- [ ] Add save/start status.
- [ ] Add “My Learning Plan” dashboard widget.
- [ ] Add notes field.
- [ ] Add progress checklist.
- [ ] Add reminders/notifications.
- [ ] Add certificate/screenshot upload.
- [ ] After login/signup, return users to the same resource page.
- [ ] Resume intended action after login/signup when supported.

### Phase 4 — Backend and Admin

- [ ] Create backend `external-resources` module.
- [ ] Add admin CRUD.
- [ ] Add course-resource relation.
- [ ] Add user progress model.
- [ ] Add analytics events.
- [ ] Add admin dashboard for resource performance.

### Phase 5 — AI Learning Companion

- [ ] Add resource-specific AI helper prompts.
- [ ] Generate personal study plan.
- [ ] Explain difficult concepts in Kyrgyz.
- [ ] Generate practice tasks.
- [ ] Recommend related EduBot lessons.
- [ ] Avoid copying full provider course content.

## 22. Acceptance Criteria for MVP

- Public users can discover free resources from the homepage.
- Public users can open `/resources` and browse curated resources.
- Public users can open a resource detail page inside EduBot.
- Public users can open the official external course link without EduBot login.
- Save/start/learning-plan actions ask for EduBot login/signup.
- After login/signup, users return to the same resource page.
- Redirect URLs are validated as internal-only paths.
- Users understand that resources are external and curated by EduBot.
- Existing internal course/cart/favorites flow remains unchanged.
- UI works on mobile and desktop.
- UI supports dark mode.
- Kyrgyz text is polished and user-friendly.

## 23. Recommended First Implementation PR Scope

The first implementation PR after this plan should include only:

1. Static resource data.
2. Homepage section.
3. `/resources` listing page.
4. `/resources/:slug` detail page.
5. Translations.
6. Basic integration into `/courses` as a small promotional block.
7. Login/signup prompt for save/start actions.
8. Redirect-back query params.

Do not add backend or full progress tracking in the first implementation PR.

## 24. Long-term Vision

EduBot Learning should become a trusted learning guide for Kyrgyz-speaking students.

The product should not only ask users to buy EduBot courses. It should help them find the best learning route, whether that includes EduBot courses, free global resources, or a combination of both.

That makes EduBot stronger as a brand:

- more useful before purchase;
- more trustworthy for parents and students;
- better for SEO and social traffic;
- easier to market with Instagram posts;
- more aligned with the mission of preparing people for future careers.
