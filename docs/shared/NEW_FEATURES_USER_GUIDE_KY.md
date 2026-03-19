# Жаңы Функциялар Колдонмо (Kyrgyz)

Бул документ `crm-integration` жаңыртуусунан кийин кошулган жаңы функцияларды жөнөкөй тилде түшүндүрөт.

Максат:
- ар бир ролго (Admin, Instructor, Student) эмне жаңырганын так көрсөтүү;
- кайсы жерден ачып, кантип колдонуу керектигин кадам-кадам менен берүү;
- көп кездешкен каталарда эмне кылуу керектигин түшүндүрүү.

## 1) Кыскача эмне өзгөрдү

Системага төмөнкү багыттар чоң болуп кошулду:
- CRM-LMS интеграциясы (risk alerts, enrollment status events)
- Катышуу (attendance) модулу
- Аналитика беттери (Admin, Instructor, Student)
- Instructor үчүн сессия/группа башкаруу Workspace
- Instructor үчүн Homework Manager
- Internal leaderboard
- Жаңы роуттар жана таб аркылуу навигация

## 2) Жаңы роуттар (кайсы URL менен ачылат)

- Admin Analytics: `/admin/analytics`
- Student Analytics: `/student/analytics`
- Internal Leaderboard: `/leaderboard/internal`
- Instructor таб-redirect:
  - `/instructor/sessions` -> `/instructor?tab=sessions`
  - `/instructor/analytics` -> `/instructor?tab=analytics`
  - `/instructor/homework` -> `/instructor?tab=homework`

Эскертүү: айрым беттер ролго жараша гана ачылат. Эгер роль туура эмес болсо, `PrivateRoute` киргизбейт.

## 3) Admin үчүн колдонмо

### 3.1 Интеграция табы (CRM-LMS)

Кайдан ачылат:
1. `/admin` кириңиз.
2. Сол менюдан `Интеграция` табын тандаңыз.

Бул табда эмне бар:
- LMS Risk Alerts тизмеси
- Enrollment Status Events тизмеси
- Фильтрлер:
  - `Severity`
  - `Issue type`
  - `Enrollment status`
  - `Күндөн` / `Күнгө чейин`
- Жыйынтык карточкалар:
  - жалпы alert саны
  - критикалык alert саны
  - enrollment окуяларынын саны

Колдонуу тартиби:
1. Фильтрлерди коюңуз (мисалы `Severity=CRITICAL`).
2. `Жаңыртуу` баскычын басыңыз.
3. Таблицадан убакыт, issue, student, enrollment маалыматтарын текшериңиз.
4. Керек болсо `Фильтрди тазалоо` менен reset кылыңыз.

Кайсы учурда пайдалуу:
- CRMден келген студенттерде окуу коркунучу (risk) көбөйгөнүн эрте көрүү;
- enrollment статусунун өзгөрүшүн көзөмөлдөө.

### 3.2 Attendance табы

Кайдан ачылат:
1. `/admin` кириңиз.
2. Сол менюдан `Катышуу` табын тандаңыз.

Эмне жасай аласыз:
- Курсту тандоо
- Студенттер тизмесин көрүү
- Ар бир студентке статус коюу (`Катышты`, `Кечикти`, `Келген жок`)
- Белгилүү дата үчүн катышууну сактоо
- Отчет аралык даталар менен жүктөө

Практикалык кадам:
1. Курсту тандаңыз.
2. `Session date` тандаңыз.
3. Ар бир студентке статус/эскертүү киргизиңиз.
4. Сактоо баскычын басыңыз.
5. Отчет керек болсо `from/to` даталарын коюп отчетту ачып текшериңиз.

### 3.3 Admin Analytics бети

Кайдан ачылат:
- `/admin/analytics`

Негизги метрикалар:
- Overview
- Course popularity
- Group fill rate
- Attendance rate
- Dropout risk
- Instructor performance

Колдонуу тартиби:
1. Дата, курс, группа фильтрлерин тандаңыз.
2. Маалыматтарды жаңыртыңыз.
3. Алгач overview карточкаларды караңыз.
4. Андан кийин себеп-натыйжа анализ үчүн popularity/fill-rate/risk блокторун салыштырыңыз.

Практикалык кеңеш:
- Бир эле учурда көп фильтр колдонсоңуз, натыйжа тар диапазондо чыгат. Адегенде дата гана коюп, анан курс/группа кошуп тарылтыңыз.

## 4) Instructor үчүн колдонмо

### 4.1 Instructor Dashboard жаңыртуулары

Кайдан ачылат:
- `/instructor`

Жаңы табдар:
- `Сессиялар`
- `Катышуу`
- `Аналитика`
- `Leaderboard`
- `Homework`

Маанилүү өзгөрүү:
- Таб абалы URL query (`?tab=...`) аркылуу сакталат. Браузерди refresh кылсаңыз ошол табда каласыз.

### 4.2 Delivery course түзүү

Кайда:
- Instructor Dashboard ичиндеги жаңы quick action аркылуу.

Эмне киргизилет:
- course type (offline/online/video түрлөрү)
- title
- description
- category
- price
- language

Кадамдар:
1. `Create delivery course` модалын ачыңыз.
2. Милдеттүү талааларды толтуруңуз (`title`, `description`, `category`).
3. Бааны киргизиңиз (акысыз болсо `0`).
4. `Түзүү` баскычын басыңыз.
5. Ийгиликтүү болсо курс тизмеси жаңыланат.

### 4.3 Session Workspace (негизги операциялар)

Кайдан ачылат:
- `/instructor/sessions` (авто түрдө `/instructor?tab=sessions` болот)

Негизги мүмкүнчүлүктөр:
- Course group түзүү/жаңыртуу
- Session түзүү/жаңыртуу
- Meeting link/provider сактоо
- Meeting өчүрүү
- Zoom attendance import
- Zoom recordings sync
- Session деңгээлде катышуу белгилөө

Минималдуу иш агымы:
1. Курсту тандаңыз.
2. Группа түзүңүз (же бар группаны тандаңыз).
3. Группага сессия түзүңүз.
4. Meeting link/provider орнотуңуз.
5. Өткөндөн кийин attendance белгилеңиз жана керек болсо zoom import/sync колдонуңуз.

Эскертүү:
- Zoom интеграция функциялары backend/provider туура конфигурация болгондо гана иштейт.

### 4.4 Instructor Attendance

Кайдан ачылат:
- `/instructor?tab=attendance`

Эмне үчүн керек:
- Окутуучу өз курстары боюнча катышууну күн сайын толтурат.

Иштөө принциби Admin табына окшош: курс тандайсыз, студент статусун коёсуз, сактайсыз, отчет аласыз.

### 4.5 Instructor Analytics

Кайдан ачылат:
- `/instructor/analytics` (redirect менен `?tab=analytics`)

Эмне көрсөтөт:
- instructor overview
- riskтеги студенттер тизмеси
- курс/группа/дата фильтрлери

Кадам:
1. Датаны коюңуз (мисалы акыркы 30 күн).
2. Курс/группа тандаңыз.
3. Risk тизмесинен кайсы студентке өзүнчө көңүл буруу керектигин аныктаңыз.

### 4.6 Instructor Homework

Кайдан ачылат:
- `/instructor/homework` (redirect менен `?tab=homework`)

Эмне кыласыз:
- course/group боюнча homework фильтрлөө
- summary (total/pending/reviewed)
- homework тизмесин кароо

Кадам:
1. Курсту тандаңыз.
2. Керек болсо группаны тандаңыз.
3. `limit` коюп тизмени кеңейтиңиз/тарылтыңыз.
4. Summary блок менен жүктөмдү баалаңыз.

## 5) Student үчүн колдонмо

### 5.1 Student Dashboard жаңыртуусу

Кайдан ачылат:
- `/student`

Жаңырган жерлер:
- катышуу метрикасы (attendance rate)
- leaderboard байланыштары
- топ/курс фильтрлер менен прогресс көрүнүштөрү

### 5.2 Student Analytics

Кайдан ачылат:
- `/student/analytics`

Эмне бар:
- progress summary
- attendance жана milestone көрүнүшү
- дата/курс/группа фильтрлери

Кадам:
1. Дата диапазонун коюңуз.
2. Курс/группа тандаңыз.
3. `Refresh` басыңыз.
4. Milestones жана progress блокторун окуңуз.

### 5.3 Internal Leaderboard

Кайдан ачылат:
- `/leaderboard/internal`

Кимдер көрөт:
- admin, instructor, assistant, student (ролго жараша уруксат берилген)

Эмне үчүн пайдалуу:
- ичиндеги рейтинг/атаандаштык динамикасын байкоо.

## 6) Enrollment (CRM аркылуу) процесси

Бул өзгөрүү registration/enroll flowго таасир этет.

Эмне жаңы:
- интеграция курс/группа тандаган логика
- enrollment request түзүү
- андан кийин activation кадамы
- `sourceSystem=CRM` менен белгилөө

Жөнөкөй түшүндүрмө:
1. Колдонуучу катталат.
2. Курска/группага байланышкан интеграция enrollment түзүлөт.
3. Activation бүткөндө enrollment активдүү абалга өтөт.

Эгер көйгөй чыкса:
- курс/группа интеграциялык endpointтен келбей жатса, адегенде ошол endpoint жооп берип жатканын текшериңиз;
- activation этапта токтосо, enrollmentId туура өтүп жатканын текшериңиз.

## 7) Көп кездешкен каталар жана чечим

### 7.1 `401` (Session expired)
- Белги: сессия мөөнөтү бүттү.
- Чечим: аккаунттан чыгып кайра кириңиз.

### 7.2 `403` (No permission)
- Белги: роль бул аракетке уруксатсыз.
- Чечим: туура роль менен кириңиз же админден уруксат сураңыз.

### 7.3 `404` (Not found)
- Белги: курс/группа/ресурс табылган жок.
- Чечим: ресурс өчкөнбү же туура `id` берилдиби текшериңиз.

### 7.4 `400` (Validation)
- Белги: форма талаалары туура эмес же жетишсиз.
- Чечим: милдеттүү талааларды толтуруңуз, сандык талааларды текшериңиз.

## 8) Команда үчүн иштөө эрежеси (жөнөкөй)

- Алгач рольго жараша бетти тандаңыз (`/admin`, `/instructor`, `/student`).
- Аналитикада анализди дайыма бирдей форматта жасаңыз:
  1. Overview
  2. Risk/Attendance
  3. Course/Group drill-down
- Attendance күн сайын бир убакта толтурулсун.
- Risk alert чыкса, ошол эле күндө instructor/admin ортосунда action пландалсын.

## 9) Кыска чеклист

### Admin чеклист
- Integration tab текшерилди
- Attendance сакталды
- Admin analytics каралды

### Instructor чеклист
- Session/group түзүлдү же жаңыртылды
- Meeting link туура
- Attendance белгиленди
- Homework статусу каралды
- Instructor analyticsтен risk студенттер каралды

### Student чеклист
- Student dashboard көрсөткүчтөрү текшерилди
- Student analytics жаңыртылды
- Leaderboard/internal каралды

---

Документ версиясы: `v1`
Жаңыртылган күнү: `2026-03-16`
