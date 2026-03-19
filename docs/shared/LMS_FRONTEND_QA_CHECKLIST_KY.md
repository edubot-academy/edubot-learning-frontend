# LMS Frontend QA Checklist (KY)

Бул чеклист CRM интеграциясынан кийинки LMS frontend өзгөрүүлөрүн текшерүү үчүн.

## 1) Admin агымы

1. `/admin` -> `Интеграция` табын ачыңыз.
2. `Severity`, `Issue type`, `Enrollment status` фильтрлерин коюп `Жаңыртуу` басыңыз.
3. Каталар чыкканда билдирүүдө `error.code` жана `requestId` көрсөтүлөрүн текшериңиз.
4. `/admin` -> `Катышуу` табын ачыңыз.
5. Курс тизмесинде `video` курс чыкпашы керек (offline/online_live гана).
6. Катышуу сактоо жана отчет жүктөө иштешин текшериңиз.

## 2) Instructor агымы

1. `/instructor?tab=sessions` ачыңыз.
2. Курс тизмесинде offline/online_live гана бар экенин текшериңиз.
3. `Homework` табында:
4. Жаңы тапшырма түзүңүз (`title`, `description`, `deadline`).
5. Тапшырма тизмеден тандалсын жана детал блок ачылсын.
6. `Edit` -> өзгөртүү -> `Сактоо` иштешин текшериңиз.
7. Submission тизмеси жүктөлөрүн текшериңиз.
8. `Approve` / `Reject` кнопкалары статус өзгөртүп жатканын текшериңиз.

## 3) Student агымы

1. `/student` кириңиз.
2. Dashboard фильтрлеринде `courseId/groupId` өзгөртүп маалымат тарылып жатканын текшериңиз.
3. Attendance маалыматтары акыркы аралык үчүн (`from/to`) жүктөлүп жатканын текшериңиз.
4. `Tasks` табында тапшырмалар session-homework булактан да келе аларын текшериңиз.
5. Эгер session-homework жеткиликсиз болсо fallback катары `/student/homework` иштесин.

## 4) Field contract текшерүү

1. Enrollment request payload'ында `crmLeadId` кетип жатканын текшериңиз.
2. Activation payload'ында `crmLeadId` кетип жатканын текшериңиз.
3. `crmContactId` frontend кодунда колдонулбай калганын, анын ордуна `crmLeadId` колдонулуп жатканын текшериңиз.

## 5) Regression smoke test

1. Login/logout бардык ролдордо иштейт.
2. Route protection бузулган эмес (`/student/*` студентке гана).
3. Existing dashboard tabs ачылат.
4. Attendance save/import/sync flow мурункудай иштейт.
5. API катасы чыкканда user түшүнө турган билдирүү чыгат.

## 6) Dev quick commands

```bash
# crmContactId калбаганын текшерүү
rg -n "crmContactId" src docs/shared

# student endpointтерди ким чакырып жатканын текшерүү
rg -n "fetchStudentDashboard\(|fetchStudentUpcomingSessions\(|fetchStudentRecordings\(|fetchStudentAttendance\(|fetchStudentHomework\(" src

# session homework API колдонулушу
rg -n "fetchSessionHomework|createSessionHomework|updateSessionHomework|fetchSessionHomeworkSubmissions|reviewSessionHomeworkSubmission" src
```
