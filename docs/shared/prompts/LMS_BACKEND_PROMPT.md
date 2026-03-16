You are a senior backend architect for EduBot Learning.

Build a scalable modular NestJS + PostgreSQL + TypeORM backend for an LMS used by education centers and academies.

Architecture requirements:
- NestJS
- PostgreSQL
- TypeORM
- modular architecture
- DTOs with validation
- Swagger-ready controllers
- RBAC
- clean service/module boundaries
- audit-friendly structure
- production-oriented API design

Important coding rules:
- Group code by file
- Always include DTOs with validation
- Use English for code/comments
- All API-visible user-facing messages should be in Kyrgyz
- Enforce permissions using role and company/organization context when needed

This backend owns:
- courses
- groups
- teachers
- students
- enrollments
- attendance
- homework
- quizzes
- progress
- academic notifications
- reports

Important integration rules:
- Courses are created only here in LMS
- CRM consumes course and group data from LMS APIs
- CRM can request enrollment creation
- LMS controls academic access through enrollment status
- LMS must support risk signal/webhook/event sending back to CRM
- LMS must keep mapping references to CRM contact/student IDs where needed

Required modules:
1. auth
2. users
3. students
4. teachers
5. courses
6. groups
7. enrollments
8. attendance
9. homework
10. quizzes
11. progress
12. reports
13. notifications
14. crm-integration
15. dashboard
16. settings

Course entity fields:
- id
- company/organization
- name
- duration
- price
- level
- description
- assignedTeacherId
- schedule
- capacity
- isActive
- createdAt
- updatedAt

Group entity fields:
- id
- courseId
- teacherId
- name
- startDate
- endDate
- schedule
- maxCapacity
- status
- createdAt
- updatedAt

Student entity fields:
- id
- company/organization
- fullName
- phone
- email
- crmContactId (nullable mapping field)
- externalStudentId (nullable)
- status
- createdAt
- updatedAt

Enrollment entity fields:
- id
- studentId
- courseId
- groupId
- crmContactId (nullable)
- sourceSystem
- paymentStatusSnapshot
- enrollmentStatus
- accessStatus
- activatedAt
- pausedAt
- completedAt
- createdAt
- updatedAt

Enrollment statuses:
- pending_activation
- active
- paused
- completed
- cancelled

Attendance module requirements:
- create session attendance records
- mark present/absent/late
- calculate attendance rate per student
- calculate attendance risk thresholds
- expose attendance summary APIs for CRM integration

Homework module requirements:
- create homework assignments
- track submissions
- feedback/score
- completion rate
- detect no-submission or low-engagement risk

Quiz module requirements:
- create quizzes
- store attempts/scores
- calculate participation and performance
- detect low quiz participation risk

Progress module requirements:
- aggregate student learning status
- attendance
- homework
- quiz metrics
- overall engagement summary

Create integration APIs for CRM:
- GET /integration/courses
- GET /integration/groups
- POST /integration/enrollments
- PATCH /integration/enrollments/:id/activate
- PATCH /integration/enrollments/:id/pause
- GET /integration/students/:id/summary

The integration flow should support:
- CRM requests enrollment after payment submission
- LMS creates student if needed
- LMS creates enrollment as pending_activation
- CRM later activates enrollment after payment confirmation
- LMS grants course access only when enrollment is active

Create CRM webhook/event support from LMS for:
- low attendance
- inactive student
- low homework completion
- low quiz participation

For each risk event, include:
- crmContactId if available
- lmsStudentId
- enrollmentId
- courseId
- groupId
- issueType
- severity
- summary metrics

Provide DTOs, entities, services, controllers, modules, and integration structure.
Use production-grade NestJS design and group all code by file.
