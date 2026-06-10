# Free External Learning Resources — EduBot Learning Integration Plan

_Last updated: 2026-06-10. Phases 1–5 complete (frontend + backend). See §22 for task status and §28–§33 for implementation notes._

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

## 21. UI/UX Design Plan

The design should make this feel like **EduBot Learning Guide**, not a simple list of external links.

Core user feeling:

```text
EduBot found the best resources for me, explained them, organized them, and helps me study.
```

### 21.1 Design principles

- Keep EduBot as the main learning environment.
- Show the official provider link, but do not make it the only or first value.
- Use “EduBot guide” framing on cards and detail pages.
- Use provider text badges instead of official logos unless logo usage is clearly allowed.
- Make free resources visually related to EduBot courses but clearly marked as external.
- Keep public pages useful without login.
- Ask for login only when the user wants to save, start, track, or personalize.

### 21.2 Homepage section design

Placement:

```jsx
<TopCourses />
<ExternalResourcesHomeSection />
<TopLearnersHome />
```

Layout:

- Two-column layout on desktop.
- Single-column stacked layout on mobile.
- Left side contains copy and CTAs.
- Right side contains a premium visual card stack.

Left copy:

```text
Акысыз билим мүмкүнчүлүктөрү

Дүйнөлүк курстарды EduBot менен туура багытта окуңуз

Harvard, Google, Microsoft, freeCodeCamp жана башка платформалардагы пайдалуу акысыз ресурстарды бир жерден табыңыз.
```

Buttons:

```text
Акысыз ресурстарды көрүү
Окуу жолун тандаңыз
```

Right visual card stack examples:

```text
Harvard CS50
Python
AI
Frontend
English
Remote Work
```

Each mini-card can show:

```text
Free to audit
English
EduBot guide
```

Visual style:

- light mode: white/soft gray background;
- dark mode: dark navy or dark gray card surface;
- accents: EduBot orange, green, and blue;
- rounded-2xl or rounded-3xl cards;
- subtle gradients and shadows;
- clear “EduBot сунуштайт” badge.

### 21.3 Resources listing page design

Route:

```text
/resources
```

Page title:

```text
Акысыз билим мүмкүнчүлүктөрү
```

Subtitle:

```text
EduBot сиз үчүн дүйнөдөгү сапаттуу акысыз курстарды жана материалдарды тандап, аларды кантип окууну түшүндүрүп берет.
```

Hero block:

```text
Эмнени үйрөнгүңүз келет?
```

Search placeholder:

```text
Python, AI, Frontend, English...
```

Category chips:

```text
Баары
Программалоо
Frontend
AI
Data
Cloud
English
Business
Teachers
Remote Work
```

Listing page should support:

- search;
- category chips;
- provider filter later;
- level filter later;
- language filter later;
- featured collection rows later.

### 21.4 External resource card design

Resource cards should feel like **guided opportunities**, not paid course cards.

Card structure:

```text
[Provider badge] Harvard / edX
CS50: Introduction to Computer Science

Computer science foundation, algorithms, problem solving.

Level: Beginner
Language: English
Price: Free to audit
Certificate: Paid optional

EduBot guide included

[Окуу планын көрүү]
[Расмий сайт]
```

Primary button:

```text
Окуу планын көрүү
```

Secondary button:

```text
Расмий сайт
```

Do not make the external link the only primary action.

Example card wireframe:

```text
┌──────────────────────────────┐
│ Harvard / edX        Free    │
│                              │
│ CS50: Computer Science       │
│ Программалоонун күчтүү       │
│ фундаменталдык курсу.        │
│                              │
│ Beginner • English • 11 wks  │
│ Certificate: paid optional   │
│                              │
│ ✅ EduBot guide included     │
│                              │
│ [Окуу планын көрүү]          │
└──────────────────────────────┘
```

### 21.5 Resource detail page design

Route:

```text
/resources/:slug
```

This is the most important page because it keeps the user inside EduBot before they open the official provider.

Use a two-column hero on desktop.

Left hero:

```text
Harvard / edX
CS50: Introduction to Computer Science

Программалоону жана computer science негиздерин башынан үйрөнүү үчүн эң белгилүү курстардын бири.
```

Badges:

```text
Beginner
English
Free to audit
Paid certificate optional
11 weeks
Hard but valuable
```

Hero buttons:

```text
EduBot ичинде окуу планын баштоо
Расмий курсту ачуу
```

Right hero card:

```text
EduBot сизге жардам берет:

✅ Окуу планын түзүү
✅ Прогрессти сактоо
✅ Notes жазуу
✅ Кыргызча түшүндүрмө алуу
✅ Сертификатты кошуу
```

### 21.6 Detail page content sections

Each detail page should answer:

```text
What is this?
Who is it for?
Is it hard?
How should I study it?
What should I do after it?
How can EduBot help me?
Where is the official course link?
```

Recommended sections:

1. **Бул курс эмне жөнүндө?**

```text
Бул курс computer science негиздерин, алгоритмдерди, маалымат структураларын жана problem solving ой жүгүртүүсүн үйрөтөт.
```

2. **Кимдер үчүн ылайыктуу?**

Use small cards:

```text
Жаңы баштагандар
Программалоону фундаменттен үйрөнгүсү келгендер
Frontend/Backend багытына даярдангандар
```

3. **Баштаардан мурун билиңиз**

```text
Бул курс күчтүү, бирок жеңил эмес.
Англис тили керек болушу мүмкүн.
Жумасына 6–10 саат бөлсөңүз жакшы.
Эгер кыйын болсо, EduBot ичинде кыргызча түшүндүрмө жана план менен окуңуз.
```

4. **EduBot окуу планы**

Timeline/checklist example:

```text
1-жума: Курстун структурасы менен таанышуу
2-жума: Problem solving жана Scratch/logic
3-жума: C basics же негизги программалоо түшүнүктөрү
4-жума: Algorithms
5-жума: Data structures
```

For MVP, checklist actions can be disabled, visual-only, or login-gated.

5. **Кыйын жерлери**

```text
Көп студенттерге кыйын болушу мүмкүн:

- Англисче терминдер
- Абстракттуу computer science түшүнүктөрү
- Тапшырмалардын татаалдыгы
- Туруктуу окуу тартиби
```

Then show:

```text
EduBot бул жерде план, түшүндүрмө жана кошумча практика менен жардам берет.
```

6. **Окшош EduBot курстары**

Soft upsell:

```text
Эгер кыргызча түшүндүрмө жана практикалык тапшырмалар менен окугуңуз келсе:
```

Show related internal course cards or compact links.

### 21.7 Auth prompt design

Do not block the whole page.

Public users can read the resource guide page and open official links.

When they click an EduBot-owned action such as:

```text
EduBot ичинде окуу планын баштоо
Менин окуу планыма кошуу
Прогрессти сактоо
```

Show modal:

```text
Окуу планыңызды сактоо үчүн аккаунт түзүңүз

EduBot сиздин прогрессиңизди, notes жана сертификаттарыңызды сактап берет.
Расмий курс провайдердин сайтында ачылат.

[Аккаунт түзүү]
[Кирүү]
[Азырынча расмий курсту ачуу]
```

This should feel helpful, not forced.

### 21.8 My Learning Plan dashboard widget

Later, logged-in students should see external resources beside EduBot courses.

Widget example:

```text
Менин окуу планым

EduBot курстары:
- Frontend курсу — 35%

Акысыз ресурстар:
- Harvard CS50 — Started
- MDN JavaScript — Saved
- Microsoft AI Fundamentals — Completed
```

This is one of the strongest retention points because users return to EduBot to manage learning.

### 21.9 EduBot course detail integration design

Inside EduBot course detail pages, show:

```text
Кошумча акысыз ресурстар
```

Example for Frontend course:

```text
Бул курска жардам бере турган акысыз ресурстар:

MDN HTML Guide
freeCodeCamp Responsive Web Design
JavaScript.info
Harvard CS50
```

Each card button should say:

```text
EduBot Guide ачуу
```

Do not send users directly to external links from the course detail section.

### 21.10 Visual language

Use EduBot design language:

- background: white/light gray in light mode;
- background: dark navy/gray in dark mode;
- primary accent: EduBot orange;
- support accents: green and blue;
- card radius: `rounded-2xl` or `rounded-3xl`;
- typography: clear section hierarchy, short copy, readable line height;
- icons: `FiBookOpen`, `FiExternalLink`, `FiGlobe`, `FiCheckCircle`, `FiBookmark`, `FiClock`;
- badges: small pill labels;
- avoid too many colors;
- avoid provider logos unless safe/legal;
- use provider text badges instead.

### 21.11 MVP design scope

For the first implementation, design only these four surfaces:

```text
1. Homepage “Акысыз билим мүмкүнчүлүктөрү” section
2. /resources listing page
3. /resources/:slug detail guide page
4. Small “Кошумча акысыз ресурстар” block inside /courses
```

Do not overbuild progress, notes, AI, certificates, or full dashboard widgets yet. Design the UI so those features can be added later.

## 22. Implementation Tasks

### Phase 1 — Frontend MVP

**Status: Complete.** See §28 for full implementation notes.

- [x] Create `src/features/externalResources/data/externalResources.js`.
- [x] Add curated resources with complete metadata — 10 resources launched (CS50 anchor + 9 more). See §25.4 for rationale on starting with 8–10 rather than 30.
- [x] Create `ExternalResourceCard.jsx`.
- [x] `ExternalResourcesGrid.jsx` — grid is inline in `ExternalResourcesPage.jsx`; separate file not needed.
- [x] Create `ExternalResourcesHomeSection.jsx`.
- [x] Create `ExternalResourceAuthPrompt.jsx`.
- [x] Add section to `src/pages/Home.jsx` after `TopCourses`.
- [x] Create `ExternalResourcesPage.jsx`.
- [x] Create `ExternalResourceDetails.jsx`.
- [x] Add `/resources` and `/resources/:slug` routes to `src/app/routes.jsx`.
- [x] Translations — marketing pages use hardcoded Kyrgyz strings following the existing pattern (no `useTranslation`). All text is in Kyrgyz.
- [x] Add disclaimer component (`ExternalResourceDisclaimer.jsx`).
- [x] Add logged-out CTA behavior — `ExternalResourceAuthPrompt` inline banner with register CTA.
- [ ] `?redirect=` and `?intent=` URL params — auth prompt passes `state` via `react-router` navigate, not query params. Implement explicit URL params in Phase 3 when save/start actions have backend support.
- [ ] Validate redirect params — `ExternalResourceDetails` validates the official URL before opening. The `?redirect=` login param validation belongs alongside Phase 3 when the param is introduced.
- [x] Responsive mobile UI — all components built with Tailwind responsive classes.
- [x] Dark mode styling — `dark:` classes throughout.
- [x] Homepage section matches the UI/UX design plan from §21.2.
- [x] Resource cards framed as guided opportunities, primary CTA is EduBot detail page.
- [x] Official provider link is secondary (icon button, not the primary CTA).

### Phase 2 — Course Page Integration

**Status: Complete.** See §29 for implementation notes.

- [x] Add `FeaturedExternalResources` block under `/courses` grid — `ExternalResourcesHomeSection` added to `Courses.jsx` using existing `SectionContainer`.
- [x] Add CTA to `/resources` — “Бардык ресурстарды көрүү →” link on both `/courses` and `/course/:id`.
- [x] Show related resources by category — `getResourcesRelatedToCourse()` matches course to resource category via keyword regex.
- [x] Add “extra resources” section on course detail pages — `SectionContainer` + `ExternalResourceCard` added to `CourseDetails.jsx` after `EnrolledCourseSupport`.
- [x] Add resource recommendations based on course category/slug — `getResourcesRelatedToCourse()` exported from data file, falls back to `isFeatured` resources.
- [x] Use “EduBot Guide ачуу” as the primary resource CTA inside course pages — injected via `ctaLabel` on each mapped resource item.
- [x] Full i18n for all components — `useTranslation` + `t()` throughout; all 38 UI string keys added to `ky`, `en`, `ru` locale files.
- [x] Multilingual content in all 10 resources — `en` and `ru` content keys added to all content fields (`shortDescription`, `whatYouWillLearn`, `whoIsItFor`, `whyRecommended`, each `studyPlan` week title+description, `difficultyNotes`). Language picked via `i18n.language` with `.ky` fallback.

### Phase 3 — Logged-in Student Features

**Status: Complete (frontend, localStorage-backed).** See §30 for implementation notes.

- [x] Add save/start status — `useResourceProgress` hook; `saved | started | completed` states persisted to localStorage per user.
- [x] Add “My Learning Plan” dashboard widget — `FreeResourcesWidget` injected into student dashboard OverviewTab; shows up to 5 saved/started/completed resources.
- [x] Add notes field — textarea on detail page, auto-saved to localStorage via `updateNotes`.
- [x] Add progress checklist — study plan week buttons toggle `checkedWeeks[]`; completed weeks show strikethrough and green dot.
- [ ] Add reminders/notifications — Phase 4 (requires backend).
- [ ] Add certificate/screenshot upload — Phase 4 (requires backend).
- [x] After login/signup, return users to the same resource page — `ExternalResourceAuthPrompt` stores `pendingAction` + redirects with `state.from`; `getPostLoginPath` returns the resource URL.
- [x] Resume intended action after login/signup — `executePendingAuthAction` handles `save-resource` type; navigates back and shows save toast.

### Phase 4 — Backend: Catalog and User Progress

**Status: Complete.** See §31 for implementation notes.

#### 4.1 — Project setup

- [x] Create `src/external-resources/` directory in the backend repo.
- [x] Create the following files inside it:
  ```
  external-resource.entity.ts
  user-external-resource-progress.entity.ts
  external-resources.module.ts
  external-resources.service.ts
  external-resources.controller.ts
  dto/create-external-resource.dto.ts
  dto/update-external-resource.dto.ts
  dto/upsert-progress.dto.ts
  ```
- [x] Register `ExternalResource` and `UserExternalResourceProgress` entities in `app.module.ts` TypeORM entity list.
- [x] Import `ExternalResourcesModule` in `app.module.ts`.

#### 4.2 — Database migrations

- [x] Create `src/database/migrations/1771000000040-createExternalResources.ts`:
  ```sql
  CREATE TABLE "external_resources" (
      "id"               SERIAL PRIMARY KEY,
      "slug"             varchar(255) NOT NULL UNIQUE,
      "title"            varchar(500) NOT NULL,
      "provider"         varchar(255) NOT NULL,
      "providerKey"      varchar(100) NOT NULL,
      "url"              varchar(2048) NOT NULL,
      "category"         varchar(100) NOT NULL,
      "level"            varchar(50),
      "language"         varchar(50),
      "priceLabel"       varchar(100),
      "certificateLabel" varchar(100),
      "durationLabel"    varchar(100),
      "content"          jsonb NOT NULL DEFAULT '{}',
      "isFeatured"       boolean NOT NULL DEFAULT false,
      "isPublished"      boolean NOT NULL DEFAULT false,
      "sortOrder"        integer NOT NULL DEFAULT 0,
      "createdAt"        TIMESTAMPTZ NOT NULL DEFAULT now(),
      "updatedAt"        TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  CREATE INDEX "IDX_external_resources_category" ON "external_resources" ("category");
  ```
- [x] Create `src/database/migrations/1771000000041-createUserExternalResourceProgress.ts`:
  ```sql
  CREATE TABLE "user_external_resource_progress" (
      "id"                SERIAL PRIMARY KEY,
      "userId"            integer NOT NULL,
      "resourceId"        integer NOT NULL
          REFERENCES "external_resources"("id") ON DELETE CASCADE,
      "status"            varchar(20) NOT NULL DEFAULT 'saved',
      "progressPercent"   integer NOT NULL DEFAULT 0,
      "notes"             text,
      "checklistProgress" jsonb,
      "certificateUrl"    varchar(2048),
      "startedAt"         TIMESTAMPTZ,
      "completedAt"       TIMESTAMPTZ,
      "createdAt"         TIMESTAMPTZ NOT NULL DEFAULT now(),
      "updatedAt"         TIMESTAMPTZ NOT NULL DEFAULT now(),
      CONSTRAINT "UQ_uerp_user_resource" UNIQUE ("userId", "resourceId")
  );
  CREATE INDEX "IDX_uerp_user" ON "user_external_resource_progress" ("userId");
  ```
- [x] Run migrations on staging and verify tables exist.
- [x] Add down migrations (DROP TABLE) for both.

#### 4.3 — Seed initial data

- [x] Create `src/scripts/seed-external-resources.ts` that reads from the frontend static data file (or a shared JSON file) and inserts rows into `external_resources`.
- [x] Mark all seeded resources as `isPublished: true` and set `sortOrder` incrementally.
- [x] Run seed script on staging. Verify `GET /external-resources` returns data.
- [x] Document how to re-run the seed without duplicates (use `ON CONFLICT (slug) DO UPDATE`).

#### 4.4 — Public catalog API (no auth)

- [x] `GET /external-resources` — list published resources.
  - Support `?category=` filter.
  - Support `?featured=true` filter for homepage section.
  - Support `?limit=` and `?offset=` for pagination (default limit 20).
  - Return only `isPublished: true` records.
  - Order by `sortOrder ASC, createdAt DESC`.
  - Do not return the full `content` JSONB in list responses — return summary fields only (`slug`, `title`, `provider`, `providerKey`, `category`, `level`, `language`, `priceLabel`, `certificateLabel`, `durationLabel`, `isFeatured`).
- [x] `GET /external-resources/:slug` — single resource detail.
  - Return full `content` JSONB.
  - Return 404 if not found or not published.
- [x] Both endpoints: omit `@UseGuards(JwtAuthGuard)` so they work without authentication.
- [x] Write unit tests for list filtering and detail 404 behavior.

#### 4.5 — User progress API (JWT required)

- [x] `GET /external-resources/my` — return all resources the authenticated user has saved or started, joined with resource summary fields.
  - Use `@UseGuards(JwtAuthGuard)` and read `req.user.id`.
  - Order by `updatedAt DESC`.
- [x] `POST /external-resources/:slug/progress` — save or start a resource.
  - Accepts `{ status: 'saved' | 'started' }`.
  - Uses `INSERT ... ON CONFLICT DO UPDATE` (upsert) so repeated calls are idempotent.
  - Sets `startedAt` when status transitions to `started` for the first time.
  - Returns the updated progress record.
- [x] `PATCH /external-resources/:slug/progress` — update progress details.
  - Accepts `{ status?, notes?, checklistProgress?, progressPercent? }`.
  - Sets `completedAt` when status transitions to `completed`.
  - Returns the updated progress record.
- [x] Write unit tests for upsert idempotency and status transition timestamps.

#### 4.6 — Admin catalog API (instructor / admin role)

- [x] `POST /external-resources` — create a new resource.
  - Restrict to `instructor` or `admin` role using existing `@Roles()` decorator.
  - Validate `slug` is URL-safe (lowercase, hyphens only).
  - Validate `url` is a valid HTTPS URL.
  - Default `isPublished: false` so new resources start as drafts.
- [x] `PATCH /external-resources/:id` — update an existing resource.
  - Allow partial updates including toggling `isPublished` and `isFeatured`.
- [x] `DELETE /external-resources/:id` — soft-delete or hard-delete.
  - Hard delete is acceptable at MVP since `user_external_resource_progress` cascades.
- [x] Write integration tests for role guard (non-admin gets 403).

#### 4.7 — Sitemap update

- [x] Inject `ExternalResourcesService` into `SitemapModule`.
- [x] In `SitemapController`, query all published resources and add `/resources/:slug` entries with `priority 0.8` and `changefreq monthly`.
- [x] Verify sitemap output at `/sitemap.xml` on staging includes resource URLs.

#### 4.8 — Frontend data source migration

- [x] Replace the static `import { externalResources }` in the frontend with API calls to `GET /external-resources` and `GET /external-resources/:slug`.
- [x] Add a loading state and error state to `ExternalResourcesPage` and `ExternalResourceDetails`.
- [x] Connect `POST /external-resources/:slug/progress` to the save/start CTA buttons (previously auth-gated with no backend action).
- [x] Connect `GET /external-resources/my` to the student dashboard widget.
- [x] Verify field names match exactly between frontend components and API responses (no rename needed if static data used the same schema).

#### 4.9 — Acceptance criteria for Phase 4

- `GET /external-resources` returns only published resources; unpublished resources are not visible.
- `GET /external-resources/:slug` returns 404 for unknown or unpublished slugs.
- Unauthenticated users can call both public endpoints without a token.
- Authenticated users can save, start, and update progress on a resource.
- Calling save twice on the same resource does not create duplicate rows.
- Status transition to `started` sets `startedAt`; transition to `completed` sets `completedAt`.
- Admin can create, update, and delete resources; non-admin gets 403.
- Sitemap includes all published resource slugs.
- Frontend fetches live data from the API; static file is no longer used.

---

### Phase 5 — Backend: Course-Resource Linking and Analytics

**Status: Complete.** See §32 for implementation notes.

#### 5.1 — CourseExternalResource join table

- [x] Create migration `1771000000042-createCourseExternalResources.ts`:
  ```sql
  CREATE TABLE "course_external_resources" (
      "id"         SERIAL PRIMARY KEY,
      "courseId"   integer NOT NULL REFERENCES "courses"("id") ON DELETE CASCADE,
      "resourceId" integer NOT NULL REFERENCES "external_resources"("id") ON DELETE CASCADE,
      "placement"  varchar(20) NOT NULL DEFAULT 'course',
      "sortOrder"  integer NOT NULL DEFAULT 0,
      "note"       text,
      "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT now(),
      CONSTRAINT "UQ_course_resource" UNIQUE ("courseId", "resourceId")
  );
  CREATE INDEX "IDX_cer_course" ON "course_external_resources" ("courseId");
  ```
- [x] Add `GET /courses/:id/external-resources` endpoint that returns linked resources for a course detail page.
- [x] Add admin endpoints to link/unlink resources to courses.
- [x] Remove `relatedCourseSlugs` from the JSONB `content` field and migrate existing data to the join table.

#### 5.2 — Analytics events

- [x] Add `ExternalResourceEvent` entity or extend existing analytics service:
  ```
  event_type: viewed | saved | started | official_link_clicked | completed | ai_plan_generated
  userId (nullable — public users can view)
  resourceSlug
  meta (jsonb, nullable)
  createdAt
  ```
- [x] Fire `viewed` on `GET /external-resources/:slug` (no auth needed, log anonymously).
- [x] Fire `saved` and `started` on progress POST/PATCH.
- [x] Fire `official_link_clicked` via redirect proxy endpoint: `GET /external-resources/:slug/go` — logs the click and redirects to the official URL.
- [x] Add analytics queries to the existing analytics dashboard:
  - Which resources are viewed most?
  - Which resources convert to save/start?
  - Which resources lead to EduBot course clicks?

#### 5.3 — AI Learning Companion

- [x] Add resource-context to the existing AI module: pass `resource.content.studyPlan` and `resource.content.whyRecommended` as system context.
- [x] Add `POST /external-resources/:slug/ai-study-plan` endpoint that generates a personalised weekly study plan using the AI module, tailored to the student's existing EduBot course progress.
- [x] Add Kyrgyz-language concept explainer: AI responds in the language specified by the `lang` query param (default `ky`).
- [x] Do not copy provider course content into the AI prompt — use only the EduBot-authored guide metadata.

---

### Phase 6 — Admin UI and Certificate Upload

- [ ] Build admin panel pages for creating and editing external resources (reuse existing dashboard UI patterns).
- [ ] Add `isPublished` / `isFeatured` toggle controls.
- [ ] Add resource-to-course linking UI inside the course edit page.
- [ ] Add certificate upload: `POST /external-resources/:slug/certificate` uploads a file to S3 via the existing `MediaService`, saves the URL to `UserExternalResourceProgress.certificateUrl`.
- [ ] Add certificate display on the student profile/dashboard.

### Phase 7 — AI Learning Companion

- [ ] Add resource-specific AI helper prompts.
- [ ] Generate personal study plan.
- [ ] Explain difficult concepts in Kyrgyz.
- [ ] Generate practice tasks.
- [ ] Recommend related EduBot lessons.
- [ ] Avoid copying full provider course content.

## 23. Acceptance Criteria for MVP

- Public users can discover free resources from the homepage.
- Public users can open `/resources` and browse curated resources.
- Public users can open a resource detail page inside EduBot.
- Public users can open the official external course link without EduBot login.
- Resource cards use “Окуу планын көрүү” / EduBot guide as the main action.
- Save/start/learning-plan actions ask for EduBot login/signup.
- After login/signup, users return to the same resource page.
- Redirect URLs are validated as internal-only paths.
- Users understand that resources are external and curated by EduBot.
- Existing internal course/cart/favorites flow remains unchanged.
- UI works on mobile and desktop.
- UI supports dark mode.
- Kyrgyz text is polished and user-friendly.
- The experience answers: what this resource is, who it is for, how hard it is, how to study it, and how EduBot helps.

## 24. Recommended First Implementation PR Scope

The first implementation PR after this plan should include only:

1. Static resource data.
2. Homepage section.
3. `/resources` listing page.
4. `/resources/:slug` detail page.
5. Translations.
6. Basic integration into `/courses` as a small promotional block.
7. Login/signup prompt for save/start actions.
8. Redirect-back query params.
9. UI design from section 21.

Do not add backend or full progress tracking in the first implementation PR.

## 25. Strategic Recommendations

### 25.1 Don't launch 30 resources — launch CS50 perfectly

Pick one resource and build the best Kyrgyz-language study guide that exists anywhere for it. CS50 is the right choice: massive global brand recognition, genuinely free, and Kyrgyz students have heard of it but don't know where to start.

A complete CS50 guide should include:

- Week-by-week study plan in Kyrgyz
- Glossary: algorithm, recursion, pointer — explained in plain Kyrgyz
- "Кыйын жерлери" — an honest section about what is hard and why
- A Telegram or WhatsApp study group link

Then post one Instagram reel: "Harvard CS50ту кыргызча кантип өтүү керек." In the local tech community, that gets shared. One resource done properly beats 30 pages of copy-pasted descriptions.

Validate demand with one resource before writing content for twenty-nine.

### 25.2 The business model is the ladder, not the feature

The three existing products already form a perfect acquisition funnel:

```
Free external resources     → discovery, trust, zero friction
Paid EduBot courses         → structured Kyrgyz-language curriculum
Group sessions + instructor → live mentorship and accountability
```

Free resources bring in the student who would never pay first. The paid course sells to them once they are stuck ("I want CS50 explained in Kyrgyz with practice tasks"). The group session sells to the student who needs a human ("I want a mentor checking my progress weekly").

The free resources feature only creates business value if the handoff between those three tiers is explicit and frictionless. Build the bridges:

- CS50 detail page → "Кыргызча менторлук менен окугуңуз келесизби?" → Group session
- CS50 detail page → "Практикалык тапшырмалар керекпи?" → Frontend course

### 25.3 Fix the Phase 1 CTA problem

The primary CTA "EduBot ичинде окуу планын баштоо" promises backend save/start tracking that does not exist until Phase 4. A user who creates an EduBot account expecting to track progress will land back on the resource page and find nothing saved. That is a trust-destroying first impression.

Replace the broken CTA in MVP with something that delivers value on day one:

**MVP primary CTA:** "CS50 окуу тобуна кошулуу — жумасына 1 жолугушуу"

A weekly live session or Telegram group where someone who finished CS50 answers questions in Kyrgyz. Charge 500–1000 KGS/month for that. It costs almost nothing to run. Students feel community and accountability. That is the product until the backend tracking exists.

Do not gate nothing. If auth-required actions have no backend yet, either defer the CTA to Phase 3 or replace it with a study group that can be delivered today.

### 25.4 Content creation effort is a bottleneck

30 resources × each requiring `shortDescription`, `whatYouWillLearn`, `whoIsItFor`, `studyPlan`, `whyEduBotRecommends`, and difficulty notes — all written in quality Kyrgyz — is a significant content production job. It is not a developer task and is not captured as a staffing requirement in this plan.

If this is not staffed explicitly before implementation starts, the detail pages will ship with placeholder copy, which defeats the entire value proposition.

Start with 8–10 deeply written resources rather than 30 shallow ones. The detail page is the product.

### 25.5 SEO requires server-side rendering from day one

The plan cites SEO and social traffic as a primary benefit. This only works if `/resources` and `/resources/:slug` are rendered server-side or statically. A client-rendered SPA returns near-empty HTML to Google.

"CS50 кыргызча" has near-zero search competition today. That advantage disappears the moment another site indexes it first.

This is a build decision that must be made before the first page ships. Options: SSR via a Next.js migration, Vite SSG plugin, or pre-rendering via `react-snap`. The current frontend stack uses Vite + React SPA — evaluate SSG at Vite level before Phase 1 starts.

### 25.6 Shareable social proof from day one

In Kyrgyzstan, Instagram and TikTok are the primary discovery channels. The plan has no mention of shareability.

Every student who completes a week of CS50 should be able to share a card: "1-апта CS50 аяктадым — EduBot менен." That card is free acquisition. Design it into the progress tracking feature from the start, not as an afterthought in Phase 3.

### 25.7 Redirect-back security note belongs in the implementation task list

The `?redirect=` + `?intent=` auth flow described in section 13.5 is the right pattern. The security note ("only allow internal relative redirects") is mentioned in the planning doc but is not in the Phase 1 implementation checklist. An open redirect vulnerability in an auth flow is a real security risk.

Add this to the Phase 1 task list explicitly:

- [ ] Validate redirect param: only accept relative paths starting with `/resources/`
- [ ] Do not allow protocol-relative or external URLs as redirect targets

### 25.8 Phase ordering: course page integration after student features

Phase 2 (Course Page Integration) is scheduled before Phase 3 (Logged-in Student Features). This is the wrong order. Promoting a resource detail page inside paid course pages before the detail page has real value (notes, plan, tracking) will dilute the upsell and make it feel like a link directory.

Recommended order: Phase 3 → Phase 2. Build the student experience first, then surface it inside paid course pages once it is worth promoting.

### 25.9 Language is the permanent moat

No international platform will ever write a CS50 study guide in Kyrgyz. EduBot can own every Kyrgyz-language tech education search query. This is not a nice-to-have — it is the durable competitive advantage that no well-funded competitor can buy.

Every resource guide page is a landing page with zero competition. The content investment compounds over time as SEO builds. Treat content quality as a core product investment, not a marketing task.

---

## 26. Backend Architecture

_Last reviewed: 2026-06-09. Based on actual backend repo inspection._

### 26.1 Build trigger

Do not build the backend module until the static frontend MVP has validated demand. The trigger is confirmed user behavior: students saving resources, joining study groups, or explicitly asking for progress tracking. Target: 2–3 weeks of traffic data from Phase 1 before writing a single backend line.

### 26.2 Stack context

The backend uses NestJS + TypeORM + PostgreSQL + Redis + S3. Multi-tenant via `TenantContextMiddleware` and `CompanyIsolationGuard`. JSONB columns for flexible structured data (`study_plans.blocks`, `group_sessions.materials`). Sequential migration timestamps (`1771000000039` is the current latest). Standard module pattern: entity → service → controller → module → dto.

### 26.3 Two tables only at MVP

```
external_resources                    catalog, platform-level, not tenant-scoped
user_external_resource_progress       per-user state: save / start / notes / checklist
```

Do not add a `CourseExternalResource` join table at MVP. Use a `relatedCourseSlugs` array inside the resource's JSONB `content` field instead. Add the join table in Phase 4 when admins manage it through a UI.

### 26.4 Entity: ExternalResource

```typescript
// src/external-resources/external-resource.entity.ts

export type ExternalResourceContent = {
    shortDescription:  Record<string, string>;        // { ky: '...', ru: '...', en: '...' }
    whatYouWillLearn:  Record<string, string[]>;
    whoIsItFor:        Record<string, string[]>;
    whyRecommended:    Record<string, string>;
    studyPlan: Array<{
        week:        number;
        title:       Record<string, string>;
        description: Record<string, string>;
    }>;
    difficultyNotes:    Record<string, string[]>;
    relatedCourseSlugs: string[];
};

@Entity('external_resources')
@Index('IDX_external_resources_slug', ['slug'], { unique: true })
@Index('IDX_external_resources_category', ['category'])
export class ExternalResource {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    slug!: string;                     // 'harvard-cs50'

    @Column()
    title!: string;

    @Column()
    provider!: string;                 // 'Harvard / edX'

    @Column()
    providerKey!: string;              // 'harvard' — for badge grouping

    @Column()
    url!: string;                      // official external link

    @Column()
    category!: string;                 // 'programming' | 'frontend' | 'ai' | ...

    @Column({ nullable: true })
    level?: string;

    @Column({ nullable: true })
    language?: string;

    @Column({ nullable: true })
    priceLabel?: string;               // 'Free to audit'

    @Column({ nullable: true })
    certificateLabel?: string;         // 'Paid optional'

    @Column({ nullable: true })
    durationLabel?: string;            // '11 weeks'

    @Column({ type: 'jsonb' })
    content!: ExternalResourceContent;

    @Column({ default: false })
    isFeatured!: boolean;

    @Column({ default: false })
    isPublished!: boolean;

    @Column({ type: 'int', default: 0 })
    sortOrder!: number;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
```

Rationale for JSONB `content`: matches the existing codebase pattern (`study_plans.blocks`, `group_sessions.materials`). Avoids a complex i18n table at MVP. Can be migrated to a proper localization table later when the catalog exceeds ~50 resources.

### 26.5 Entity: UserExternalResourceProgress

```typescript
// src/external-resources/user-external-resource-progress.entity.ts

export type ResourceProgressStatus =
    'saved' | 'started' | 'in_progress' | 'paused' | 'completed';

@Entity('user_external_resource_progress')
@Index('IDX_uerp_user', ['userId'])
@Unique('UQ_uerp_user_resource', ['userId', 'resourceId'])
export class UserExternalResourceProgress {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    userId!: number;

    @Column()
    resourceId!: number;

    @ManyToOne(() => ExternalResource, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'resourceId' })
    resource!: ExternalResource;

    @Column({ default: 'saved' })
    status!: ResourceProgressStatus;

    @Column({ type: 'int', default: 0 })
    progressPercent!: number;

    @Column({ type: 'text', nullable: true })
    notes?: string | null;

    @Column({ type: 'jsonb', nullable: true })
    checklistProgress?: Array<{ weekIndex: number; done: boolean }> | null;

    @Column({ type: 'varchar', nullable: true })
    certificateUrl?: string | null;

    @Column({ type: 'timestamptz', nullable: true })
    startedAt?: Date | null;

    @Column({ type: 'timestamptz', nullable: true })
    completedAt?: Date | null;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
```

### 26.6 API routes

```
# Public — no auth required
GET  /external-resources                  list published resources (?category= &featured=)
GET  /external-resources/:slug            resource detail

# User — JWT required
GET  /external-resources/my              user's saved and started resources
POST /external-resources/:slug/progress  save or start a resource
PATCH /external-resources/:slug/progress update status, notes, checklist

# Admin — instructor or admin role
POST   /external-resources               create resource
PATCH  /external-resources/:id           update resource
DELETE /external-resources/:id           delete resource
```

Public endpoints omit `@UseGuards(JwtAuthGuard)` following the existing pattern in the codebase.

### 26.7 Migrations

Next two migration files after `1771000000039`:

```typescript
// src/database/migrations/1771000000040-createExternalResources.ts
await queryRunner.query(`
    CREATE TABLE "external_resources" (
        "id"               SERIAL PRIMARY KEY,
        "slug"             varchar(255) NOT NULL UNIQUE,
        "title"            varchar(500) NOT NULL,
        "provider"         varchar(255) NOT NULL,
        "providerKey"      varchar(100) NOT NULL,
        "url"              varchar(2048) NOT NULL,
        "category"         varchar(100) NOT NULL,
        "level"            varchar(50),
        "language"         varchar(50),
        "priceLabel"       varchar(100),
        "certificateLabel" varchar(100),
        "durationLabel"    varchar(100),
        "content"          jsonb NOT NULL DEFAULT '{}',
        "isFeatured"       boolean NOT NULL DEFAULT false,
        "isPublished"      boolean NOT NULL DEFAULT false,
        "sortOrder"        integer NOT NULL DEFAULT 0,
        "createdAt"        TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt"        TIMESTAMPTZ NOT NULL DEFAULT now()
    )
`);
await queryRunner.query(
    `CREATE INDEX "IDX_external_resources_category" ON "external_resources" ("category")`
);

// src/database/migrations/1771000000041-createUserExternalResourceProgress.ts
await queryRunner.query(`
    CREATE TABLE "user_external_resource_progress" (
        "id"                SERIAL PRIMARY KEY,
        "userId"            integer NOT NULL,
        "resourceId"        integer NOT NULL
            REFERENCES "external_resources"("id") ON DELETE CASCADE,
        "status"            varchar(20) NOT NULL DEFAULT 'saved',
        "progressPercent"   integer NOT NULL DEFAULT 0,
        "notes"             text,
        "checklistProgress" jsonb,
        "certificateUrl"    varchar(2048),
        "startedAt"         TIMESTAMPTZ,
        "completedAt"       TIMESTAMPTZ,
        "createdAt"         TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt"         TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_uerp_user_resource" UNIQUE ("userId", "resourceId")
    )
`);
await queryRunner.query(
    `CREATE INDEX "IDX_uerp_user" ON "user_external_resource_progress" ("userId")`
);
```

### 26.8 Sitemap integration

The existing `SitemapController` only indexes courses. Inject `ExternalResourcesService` and add resource URLs. This is the single highest-ROI backend task — it turns static pages into indexed SEO content.

```typescript
// In sitemap.controller.ts, after the courses loop:
for (const resource of publishedResources) {
    xml += `<url>
        <loc>${baseUrl}/resources/${resource.slug}</loc>
        <lastmod>${resource.updatedAt.toISOString()}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>`;
}
```

### 26.9 Frontend static data must match the future DB schema

The static `externalResources.js` data file should use the same field names as the entities above (`slug`, `provider`, `providerKey`, `category`, `content`, etc.). When migrating from static to backend, the frontend components do not change — only the data source switches from a local import to `GET /external-resources`. Mismatched field names now mean a breaking refactor later.

### 26.10 What not to build in Phase 2 backend

- No admin UI panel — seed the DB directly or via a script with the 8–10 launch resources.
- No `CourseExternalResource` join table — `relatedCourseSlugs` in JSONB is sufficient until Phase 4.
- No certificate file upload — requires S3 handling and is a distraction from validating core demand.
- No analytics table — log resource events to stdout or the existing analytics module. Add a dedicated `external_resource_events` table in Phase 4 when traffic volume justifies it.

---

## 27. Long-term Vision

EduBot Learning should become a trusted learning guide for Kyrgyz-speaking students.

The product should not only ask users to buy EduBot courses. It should help them find the best learning route, whether that includes EduBot courses, free global resources, or a combination of both.

That makes EduBot stronger as a brand:

- more useful before purchase;
- more trustworthy for parents and students;
- better for SEO and social traffic;
- easier to market with Instagram posts;
- more aligned with the mission of preparing people for future careers.

---

## 28. Phase 1 Implementation Notes

_Completed: 2026-06-09._

### 28.1 Files created

```
src/features/externalResources/
  data/externalResources.js                  — static catalog, 10 resources
  components/ExternalResourceCard.jsx        — card with provider dot, tags, dual CTAs
  components/ExternalResourceFilters.jsx     — category pill tabs
  components/ExternalResourcesHomeSection.jsx — home page wrapper using SectionContainer
  components/ExternalResourceAuthPrompt.jsx  — inline "register to save progress" banner
  components/ExternalResourceDisclaimer.jsx  — third-party content notice
  pages/ExternalResourcesPage.jsx            — /resources listing with filter
  pages/ExternalResourceDetails.jsx          — /resources/:slug two-column detail page
```

Files updated:

```
src/app/routes.jsx     — two lazy-loaded routes added: /resources and /resources/:slug
src/pages/Home.jsx     — ExternalResourcesHomeSection inserted after TopCourses
```

### 28.2 Data schema alignment

The static data file uses the same field names as the planned backend entities (`slug`, `provider`, `providerKey`, `category`, `content.shortDescription.ky`, `content.whatYouWillLearn.ky`, `content.studyPlan[].week`, etc.). When Phase 4 migrates the data source from the static file to `GET /external-resources`, the components do not need to change — only the data-fetching call site.

The 10 launch resources are also the seed data for the backend migration in Phase 4.

### 28.3 Design decisions and deviations from plan

**i18n added in Phase 2 (not hardcoded Kyrgyz as originally planned).**
Phase 1 shipped hardcoded Kyrgyz following the existing marketing-page pattern. Phase 2 switched all external-resources components to `useTranslation` because the feature surfaces inside paid course detail pages used by students across all three supported locales (ky, en, ru). 38 UI string keys were added to `src/i18n/locales/{ky,en,ru}/public.js` under the `externalResources` namespace. Content fields in `externalResources.js` now carry `ky`, `en`, and `ru` versions; components read them via a `cl(obj)` helper: `obj[lang] ?? obj.ky`.

**Provider logo fallback uses letter-avatar, not Clearbit.**
Clearbit's free logo CDN shut down. Two-tier fallback: curated CDN/Wikipedia URLs in `PROVIDER_LOGOS` → letter avatar with brand color from `PROVIDER_COLORS`. `PROVIDER_DOMAINS` removed.

**No separate `ExternalResourcesGrid.jsx`.**
The grid (3-column responsive) is a single `<div className="grid ...">` inside `ExternalResourcesPage.jsx`. A separate file would add indirection with no benefit at this scale.

**No `utils/externalResourceFilters.js`.**
The `CATEGORIES` constant and `getResourcesByCategory` helper live directly in `data/externalResources.js`. Moving them to a utils file would split the data from its accessors for no gain.

**`ExternalResourceFilters` is stateless.**
Filters receive `active` and `onChange` from the page. No internal state. This makes it trivially reusable when the page gains URL-based filter params in Phase 3.

**Auth prompt uses `react-router` `state`, not `?redirect=` query param.**
The `?redirect=` + `?intent=` URL param pattern from §13.5 is the correct final design but requires the login/register pages to read and act on those params. That plumbing belongs alongside Phase 3 when save/start actions actually do something. Using `navigate(..., { state: { from } })` is the same pattern already in `UnauthModal` and avoids introducing a redirect param handler before it can be validated.

**`ExternalResourceDetails` validates external URL before opening.**
The `handleOfficialLink` function checks whether the URL is internal or external before opening. Internal URLs navigate via `react-router`; external URLs open with `noopener noreferrer`. This closes the open-redirect risk for the official link CTA noted in §25.7.

### 28.4 Known gaps before Phase 2

| Gap | Blocking? | Resolved? |
|---|---|---|
| `?redirect=`/`?intent=` login params not wired | No — auth prompt works via router state | No — Phase 3 |
| Loading/error states on detail page (sync lookup) | No — static data never fails | No — Phase 4 |
| Category list hardcoded in data file | No | No — Phase 4 |
| Homepage shows first 3 resources, not `isFeatured` | No | No — Phase 4 |
| No `/courses` page integration | No | **Yes — Phase 2** |
| No progress tracking UI | No — auth prompt teases it | No — Phase 3 |

### 28.5 What to do next

1. **Phase 3 / study group CTA**: Replace the auth prompt with a concrete study group CTA per §25.3 — deliver value before the backend exists.
2. **Phase 4**: Only after 2–3 weeks of traffic data confirms demand (§26.1).

---

## 29. Phase 2 Implementation Notes

_Completed: 2026-06-10._

### 29.1 Files updated

```
src/pages/Courses.jsx            — ExternalResourcesHomeSection block + "view all" CTA added
src/pages/CourseDetails.jsx      — SectionContainer + ExternalResourceCard + getResourcesRelatedToCourse
src/features/externalResources/data/externalResources.js
                                 — getResourcesRelatedToCourse() exported; PROVIDER_DOMAINS removed;
                                   en+ru content added to all 10 resources
src/features/externalResources/components/ExternalResourceCard.jsx
                                 — useTranslation added; ctaLabel prop; isFree detection fixed;
                                   Clearbit removed; PROVIDER_LOGOS two-tier fallback
src/features/externalResources/components/ExternalResourceFilters.jsx
                                 — useTranslation; category labels from i18n
src/features/externalResources/components/ExternalResourcesHomeSection.jsx
                                 — useTranslation throughout
src/features/externalResources/components/ExternalResourceAuthPrompt.jsx
                                 — useTranslation throughout
src/features/externalResources/components/ExternalResourceDisclaimer.jsx
                                 — useTranslation; providerName interpolation
src/features/externalResources/pages/ExternalResourcesPage.jsx
                                 — useTranslation; count interpolation in subtitle
src/features/externalResources/pages/ExternalResourceDetails.jsx
                                 — full redesign: cover hero, badge pills, timeline study plan,
                                   sidebar stats, cl() content-language helper, ProviderLogo component
src/i18n/locales/ky/public.js    — 38 externalResources keys added
src/i18n/locales/en/public.js    — 38 externalResources keys added
src/i18n/locales/ru/public.js    — 38 externalResources keys added
```

### 29.2 Course-to-resource matching

`getResourcesRelatedToCourse(course, limit = 3)` builds a haystack from `course.category.name`, `course.categoryName`, and `course.title`, then uses regex to map to one of four resource categories (`web`, `ai`, `data`, `programming`). Falls back to `isFeatured` resources if no category match or fewer than `limit` matched. The function is stateless and has no external dependencies.

### 29.3 Content language helper pattern

All components that render multilingual content use:

```js
const lang = i18n.language?.split('-')[0] ?? 'ky';
const cl = (obj) => obj?.[lang] ?? obj?.ky ?? null;
```

`split('-')[0]` normalises locale codes like `en-US` → `en`. The `.ky` fallback ensures nothing breaks if a future resource omits a translation.

### 29.4 Known gaps before Phase 3

| Gap | Blocking? | Resolved? |
|---|---|---|
| `?redirect=`/`?intent=` login params not wired | No | **Yes — Phase 3** (pendingAction + state.from) |
| Progress tracking UI | No | **Yes — Phase 3** |
| `isFeatured` flag only set on CS50 (id 1) | No — fallback works | No — Phase 4 |
| No loading/error state on detail page | No — static data | No — Phase 4 |

---

## 30. Phase 3 Implementation Notes

_Completed: 2026-06-10._

### 30.1 Files created

```
src/features/externalResources/hooks/useResourceProgress.js
                                 — localStorage-backed hook; key ext_res_v1_{userId};
                                   operations: save, start, complete, toggleWeek, updateNotes, remove
src/features/externalResources/components/FreeResourcesWidget.jsx
                                 — compact list of saved/started/completed resources;
                                   injected into student dashboard OverviewTab
```

### 30.2 Files updated

```
src/features/externalResources/pages/ExternalResourceDetails.jsx
                                 — save/start/complete buttons; week checkboxes in study plan;
                                   notes textarea; sidebar action button adapts to status
src/features/externalResources/components/ExternalResourceAuthPrompt.jsx
                                 — stores pendingAction {type:'save-resource', slug, title}
                                   before redirecting to login
src/features/auth/utils/postLogin.js
                                 — save-resource handler: navigate + toast after login
src/features/student-dashboard/components/tabs/OverviewTab.jsx
                                 — FreeResourcesWidget injected at bottom
src/i18n/locales/{ky,en,ru}/public.js
                                 — 20 Phase 3 keys: save, start, continue, complete, notes,
                                   weekProgress, toast messages, widget strings, status labels
```

### 30.3 Storage schema

```js
// localStorage key: ext_res_v1_{userId}
{
  [slug]: {
    status: 'saved' | 'started' | 'completed',
    notes: string,
    checkedWeeks: number[],
    savedAt: ISO string,
    startedAt: ISO string | null,
    completedAt: ISO string | null,
    title: string,
    provider: string,
  }
}
```

One key per user ID. Falls back to `ext_res_v1_anon` for unauthenticated state (guest saves are visible after login when the same device is used and the userId key is created on next save).

### 30.4 Known gaps before Phase 4

| Gap | Blocking? | Phase |
|---|---|---|
| Progress not synced across devices | No — by design until backend | Phase 4 |
| Reminders / push notifications | No | Phase 4 |
| Certificate/screenshot upload | No | Phase 4 |
| Anon progress lost on login if user never re-saves | Low risk | Phase 4 |

---

## 31. Phase 4 Implementation Notes

_Completed: 2026-06-10._

### 31.1 Backend files created

```
backend/src/external-resources/
  external-resource.entity.ts                    — entity matching §26.4
  user-external-resource-progress.entity.ts      — entity matching §26.5
  external-resources.module.ts                   — imports AiModule, registers all entities
  external-resources.service.ts                  — catalog + progress + AI + analytics
  external-resources.controller.ts              — public, user, and admin route handlers
  course-external-resources.controller.ts        — GET/POST/DELETE /courses/:courseId/...
  dto/create-external-resource.dto.ts
  dto/update-external-resource.dto.ts
  dto/upsert-progress.dto.ts
backend/src/database/migrations/
  1771000000040-createExternalResources.ts
  1771000000041-createUserExternalResourceProgress.ts
backend/src/scripts/
  seed-external-resources.ts                     — ON CONFLICT (slug) DO UPDATE idempotent seed
```

### 31.2 Frontend files created / updated

```
src/features/externalResources/
  api.js                                         — full set of API helper functions
  hooks/useResourceProgress.js                   — rewritten: API source-of-truth for logged-in users
  pages/ExternalResourceDetails.jsx              — API fetch, loading state, AI study plan UI
  components/FreeResourcesWidget.jsx             — simplified: uses getAllEntries() only
src/pages/CourseDetails.jsx                      — API-linked resources with static fallback
src/i18n/locales/{ky,en,ru}/public.js           — 5 AI plan keys added
```

### 31.3 API routes added (beyond plan)

Two routes were added that were not in the original Phase 4 spec:

- `GET /external-resources/:slug/go` — redirect proxy that logs `official_link_clicked` before redirecting. Replaces the direct external link in the frontend, closing the open-redirect risk noted in §25.7.
- `DELETE /external-resources/:slug/progress` — removes a user's progress row. Required by the `removeResource` operation in the frontend hook (found during code review — see §33 #1).

### 31.4 Routing order

NestJS resolves path parameters greedily. `GET /external-resources/my` must be registered before `GET /external-resources/:slug`, otherwise `:slug` captures `my`. Two-segment paths (`/:slug/go`, `/:slug/progress`) do not conflict with single-segment `/:slug`.

### 31.5 `useResourceProgress` refactor — API as source of truth

The original Phase 3 hook stored all progress in `localStorage` keyed by `ext_res_v1_{userId}`. Phase 4 changed the architecture:

- **Logged-in users**: hook fetches from `GET /external-resources/my` on mount; React state is an optimistic layer on top. localStorage is not read or written for logged-in users.
- **Anonymous users**: unchanged — localStorage key `ext_res_v1_anon` is the sole store.
- **Re-login merge**: on mount when `userId` becomes truthy, the hook reads `ext_res_v1_anon`, uploads each entry to the API via `upsertExternalResourceProgress`, clears the anon key, then fetches the authoritative server state. Anon entries not yet reflected in the server response are merged optimistically.

The old per-user key format (`ext_res_v1_{userId}`) was planned in §30.3 but never shipped — the hook was fully rewritten before any per-user key was ever written to production.

### 31.6 Known gaps after Phase 4

| Gap | Phase |
|---|---|
| Admin UI to create/edit resources | Phase 6 |
| Certificate upload | Phase 6 |
| Per-resource analytics dashboard view | Phase 6 |
| Anon progress uses `ext_res_v1_anon` key regardless of tab/device isolation | Acceptable for MVP |

---

## 32. Phase 5 Implementation Notes

_Completed: 2026-06-10._

### 32.1 Files created

```
backend/src/external-resources/
  course-external-resource.entity.ts            — CourseExternalResource join entity
  external-resource-event.entity.ts             — ExternalResourceEvent analytics entity
  course-external-resources.controller.ts        — CRUD at /courses/:courseId/external-resources
backend/src/database/migrations/
  1771000000042-createCourseExternalResources.ts
  1771000000043-createExternalResourceEvents.ts
```

### 32.2 CourseExternalResource entity

Differs slightly from the plan spec: the `placement` column was dropped (no known consumer). Schema as shipped:

```typescript
@Entity('course_external_resources')
@Index('IDX_cer_course', ['courseId'])
@Unique('UQ_cer_course_resource', ['courseId', 'resourceId'])
export class CourseExternalResource {
    @PrimaryGeneratedColumn() id!: number;
    @Column() courseId!: number;
    @Column() resourceId!: number;
    @ManyToOne(() => ExternalResource, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'resourceId' }) resource!: ExternalResource;
    @Column({ type: 'int', default: 0 }) sortOrder!: number;
    @Column({ type: 'text', nullable: true }) note?: string | null;
    @CreateDateColumn() createdAt!: Date;
}
```

### 32.3 ExternalResourceEvent entity

`eventType` union: `viewed | saved | started | official_link_clicked | completed | ai_plan_generated` (plan spec had `certificate_uploaded`; replaced by `ai_plan_generated` since certificate upload is deferred to Phase 6).

TypeORM pitfall: `@Column({ type: 'int', nullable: true })` is required on the `userId` field. TypeORM cannot infer a DB type from the TypeScript union `number | null` and throws `DataTypeNotSupportedError` without the explicit `type`.

### 32.4 AI Study Plan endpoint

`POST /external-resources/:slug/ai-study-plan` (JWT required). Uses existing `AiAssistantService.generateResponse()` from `AiModule`. The prompt includes:

- Resource title, provider, category, level, duration, price
- Week-by-week study plan with each week's `[done/todo]` status from `checklistProgress`
- Student's current status and progress percent
- Student's personal notes (if any)

Responds in the language passed as `?lang=ky` (default). Capped at 400 tokens, temperature 0.75. Fires `ai_plan_generated` event after response (fire-and-forget, does not block the response).

### 32.5 Frontend AI plan UI

`ExternalResourceDetails.jsx` additions:

- Three state vars (`aiPlan`, `aiLoading`, `aiError`) declared at the top of the component with all other state, before any early returns (React hooks rules).
- Toggle button shown only to logged-in users; pressing again hides the plan.
- Spinner shown during generation (`aiLoading`).
- Plan rendered in an orange-gradient card with a dismiss button.
- Error shown inline if generation fails.

### 32.6 `handleOfficialLink` change

The frontend no longer opens the external URL directly. It navigates to the backend proxy:

```js
window.open(`${API_BASE_URL}/external-resources/${resource.slug}/go`, '_blank', 'noopener,noreferrer');
```

The backend `GET :slug/go` handler calls `@Redirect()`, logs `official_link_clicked`, and returns `{ url: resource.url }`. This closes the analytics gap and keeps the external URL server-side.

---

## 33. Code Review Findings and Fixes

_Review conducted: 2026-06-10. All 8 confirmed findings fixed._

### 33.1 #1 — removeResource never called the API

**File:** `useResourceProgress.js`  
**Problem:** `removeResource` deleted the localStorage entry but never called the backend. Unsaving a resource on one device would re-appear after the next `GET /external-resources/my` fetch on another device or on page reload.  
**Fix:** Added `DELETE /external-resources/:slug/progress` backend endpoint and `deleteExternalResourceProgress(slug)` frontend API function. Hook now calls it inside `removeResource` when `userId` is truthy.

### 33.2 #2 — toggleWeek called syncToApi inside a setState updater

**File:** `useResourceProgress.js`  
**Problem:** React Strict Mode double-invokes state updaters in development. A `syncToApi` call placed inside the `mutate((prev) => {...})` callback would fire twice per toggle, sending two conflicting API requests.  
**Fix:** Captured `nextCheckedWeeks` into a `let` variable inside the updater (for the state update), then called `syncToApi` outside the `mutate()` call (for the side effect).

### 33.3 #3 — updateNotes fired a syncToApi call on every keystroke

**File:** `useResourceProgress.js`  
**Problem:** Each character typed in the notes field triggered an API request. Under a fast typist that is ~5 req/s.  
**Fix:** Debounced using `debounce` from `src/lib/utils.js` (600ms cooldown). The debounced function is stored in a `useRef` so it is stable across re-renders (no new debounce instance on each render).

### 33.4 #4 — API empty array suppressed the static fallback in CourseDetails

**File:** `src/pages/CourseDetails.jsx`  
**Problem:** `linkedResources ?? staticResources` only catches `null`/`undefined`. When the API returns `[]` (course exists but has no linked resources), `??` passes through the empty array and the static fallback is never shown.  
**Fix:** Changed to `linkedResources?.length ? linkedResources : staticResources`.

### 33.5 #5 — Save/Start buttons flashed during the API fetch window

**File:** `useResourceProgress.js`, `ExternalResourceDetails.jsx`  
**Problem:** On mount, the hook initialises `store` as `{}`. Before `GET /external-resources/my` completes, `getEntry(slug)` returns `null`, so the page shows "Save" even for a resource the user has already started — a visible flash.  
**Fix:** Added `progressLoading` boolean to the hook (true while the initial fetch is in flight). In `ExternalResourceDetails`, `entry` is forced to `null` while `progressLoading` is true, so the buttons are suppressed until the real state arrives.

### 33.6 #6 — linkedResources stale on course navigation

**File:** `src/pages/CourseDetails.jsx`  
**Problem:** When navigating from one course to another, `linkedResources` retained the previous course's resources until the new `fetchResourcesByCourse` call resolved. The stale resources were briefly visible under the new course.  
**Fix:** Added `setLinkedResources(null)` at the top of the `useEffect`, before the fetch, so the section is hidden immediately on navigation.

### 33.7 #7 — Anonymous progress lost on re-login

**File:** `useResourceProgress.js`  
**Problem:** An unauthenticated user saved resources to `ext_res_v1_anon`. On login, the hook switched to fetching from the API — which had no record of the anon saves. The anon data sat in localStorage indefinitely and was never merged.  
**Fix:** On mount when `userId` is truthy, the hook reads `ext_res_v1_anon`, uploads each entry to the API via `syncToApi`, clears the anon key, fetches the server state, and optimistically merges any anon entries not yet reflected in the API response.

### 33.8 #8 — Wrong event type tracked for AI plan generation

**File:** `external-resources.service.ts`, `external-resource-event.entity.ts`  
**Problem:** `generateStudyPlan` called `this.trackEvent(slug, 'viewed', userId)`, which would pollute the `viewed` counter with AI plan requests and make the analytics counts inaccurate.  
**Fix:** Added `'ai_plan_generated'` to the `ExternalResourceEventType` union. Service now calls `this.trackEvent(slug, 'ai_plan_generated', userId)` after the AI response.
