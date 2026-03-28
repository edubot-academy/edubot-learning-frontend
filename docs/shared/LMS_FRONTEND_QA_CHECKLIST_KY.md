# LMS Frontend QA Checklist (KY)

Бул чеклист CRM интеграциясынан кийинки LMS frontend өзгөрүүлөрүн текшерүү үчүн.

## 1) Admin агымы

1. `/admin` -> `Интеграция` табын ачыңыз.
2. `Severity`, `Issue type`, `Enrollment status` фильтрлерин коюп `Жаңыртуу` басыңыз.
3. Каталар чыкканда билдирүүдө `error.code` жана `requestId` көрсөтүлөрүн текшериңиз.
4. `Pending`, `Active`, `Failed Dispatch` quick view'лары иштеп жатканын текшериңиз.
5. Каалаган event сапындагы `Толук көрүү` ачылып, payload JSON, enrollment/access status, reason көрүнөрүн текшериңиз.
6. Detail modal'дан `LMS enrollment ID`, `LMS student ID`, `CRM lead ID` copy иштеп жатканын текшериңиз.
4. `/admin` -> `Катышуу` табын ачыңыз.
5. Курс тизмесинде `video` курс чыкпашы керек (offline/online_live гана).
6. Экран адегенде info/read mode'до ачыларын текшериңиз.
7. `Өзгөртүү режимин ачуу` басмайынча attendance өзгөрбөшү керек.
8. Course -> Group -> Session тандоо агымы иштеп жатканын текшериңиз.
9. Өзгөртүү жок болсо `Сактоо` disable абалда калышын текшериңиз.
10. Edit mode'до attendance сактоо иштешин текшериңиз.

## 2) Instructor агымы

1. `/instructor?tab=groups` ачыңыз.
2. `Группа түзүү` modal'ы ачылып, group code auto-generate болуп жатканын текшериңиз.
3. Group create/edit modal footer'ындагы action buttons ар дайым көрүнүп турушу керек.
4. Group'ка студент кошуу modal'ы иштеп жатканын текшериңиз.
5. `/instructor?tab=attendance` ачыңыз.
6. Курс тизмесинде offline/online_live гана бар экенин текшериңиз.
7. Course -> Group -> Session тандоо агымы иштеп жатканын текшериңиз.
8. Өзгөртүү жок болсо `Сактоо` disable болушу керек.
9. Attendance статусу dropdown аркылуу өзгөрөрүн текшериңиз.
10. `/instructor?tab=sessions` же session workspace'те:
11. Жаңы homework түзүңүз (`title`, `description`, `deadline`, `assignedStudentIds`).
12. Deadline түзүлгөндөн кийин UI'да `Мөөнөт коюлган эмес` деп кетпей, туура көрүнөрүн текшериңиз.
13. Submission тизмеси жүктөлөрүн текшериңиз.
14. File менен жөнөтүлгөн submission'да тиркелген файл аталышы жана `Ачуу` аракети көрүнөрүн текшериңиз.
15. `Approve` / `Reject` кнопкалары статус өзгөртүп жатканын текшериңиз.

## 3) Student агымы

1. `/student` кириңиз.
2. Dashboard фильтрлеринде `courseId/groupId` өзгөртүп маалымат тарылып жатканын текшериңиз.
3. Attendance маалыматтары акыркы аралык үчүн (`from/to`) жүктөлүп жатканын текшериңиз.
4. `Tasks` табы негизги булак катары `/student/homework` колдонуп жатканын текшериңиз.
5. Upcoming session тизмеси өзгөрсө да мурда берилген тапшырмалар жоголбой жатканын текшериңиз.
6. Homework file upload'да:
7. валиддүү PDF/DOCX файл тандалса submit агымы ийгиликтүү бүтүшү керек.
8. жараксыз extension дароо тосулушу керек.
9. 20 MB ашкан файл дароо тосулушу керек.
10. Upload учурунда `Файл жүктөлүүдө...`, андан кийин `Тапшырма жөнөтүлүүдө...` абалдары көрүнүшү керек.

## 4) CRM/LMS contract текшерүү

1. `X-Idempotency-Key` contract docs'то enrollment mutation'дар үчүн талап кылынарын текшериңиз.
2. Enrollment create агымы `pending` жана locked access катары документтелгенин текшериңиз.
3. Activation агымы гана access'ти `active` кылаарын текшериңиз.
4. `offline` жана `online_live` үчүн `groupId` талап кылынарын текшериңиз.

## 5) Regression smoke test

1. Login/logout бардык ролдордо иштейт.
2. Route protection бузулган эмес (`/student/*` студентке гана).
3. Existing dashboard tabs ачылат.
4. Attendance жаңы session-based flow менен иштейт.
5. API катасы чыкканда user түшүнө турган билдирүү чыгат.

## 6) Dev quick commands

```bash
# X-Idempotency-Key docs жана integration client колдонулушу
rg -n "X-Idempotency-Key|idempotency" src docs/shared

# student endpointтерди ким чакырып жатканын текшерүү
rg -n "fetchStudentDashboard\(|fetchStudentUpcomingSessions\(|fetchStudentRecordings\(|fetchStudentAttendance\(|fetchStudentHomework\(" src

# session homework API колдонулушу
rg -n "fetchSessionHomework|createSessionHomework|updateSessionHomework|fetchSessionHomeworkSubmissions|reviewSessionHomeworkSubmission" src

# homework upload flow колдонулушу
rg -n "uploadSessionHomeworkAttachment|submissions/upload" src docs/shared
```
