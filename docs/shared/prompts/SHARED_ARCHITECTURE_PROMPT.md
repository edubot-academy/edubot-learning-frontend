You are a senior system architect for a multi-system education platform.

I have 2 separate backend systems:

1. EduBot CRM
2. EduBot Learning (LMS)

These are separate products but must integrate tightly.

Business goal:
Support the full lifecycle of an education customer:

Lead → Contact → Trial Lesson → Deal → Payment Submission → Payment Confirmation → Enrollment in LMS → Group Assignment → Learning Progress → Attendance / Homework / Quiz Tracking → Retention Follow-up in CRM

Important ownership rules:

CRM owns:
- leads
- contacts from sales perspective
- deals / sales pipeline
- payment submission
- payment confirmation workflow
- sales follow-ups
- manager tasks
- communication timeline
- retention / re-engagement cases triggered by LMS signals

LMS owns:
- course catalog
- groups / batches
- teachers
- enrollments
- attendance
- homework
- quizzes
- progress
- academic activity

Critical rules:
- Courses must be created only once in LMS
- CRM must consume courses and groups from LMS through API
- CRM must not create duplicate academic courses
- Sales should be able to select course/group in CRM and submit payment
- After payment is submitted or confirmed, CRM should request enrollment in LMS
- LMS should create student/enrollment records and control academic access
- Academic access should be granted only when LMS enrollment becomes active
- If attendance/progress becomes risky, LMS should send risk signals back to CRM
- CRM should create follow-up tasks or retention cases for sales/support

Student identity:
- CRM and LMS have separate databases
- There must be a mapping strategy between CRM contacts/students and LMS students
- Use mapping fields like crmContactId, lmsStudentId, externalStudentId where appropriate

Target industries:
- education centers
- IT academies
- language schools
- training centers

Primary modules in CRM:
- dashboard
- leads
- contacts/students
- deals
- sales pipeline
- trial lessons
- payments
- tasks
- communication timeline
- retention/risk cases
- reports
- user management

Primary modules in LMS:
- dashboard
- courses
- groups
- teachers
- enrollments
- attendance
- homework
- quizzes
- progress
- student portal
- notifications
- reports

User roles across systems:
- Super Admin
- Admin
- Sales Manager
- Assistant
- Teacher
- Marketing
- Support
- Viewer
- Student (LMS only)

Technical preferences:
- scalable modular architecture
- clean domain boundaries
- strong API contracts
- event-based or webhook-based integration where appropriate
- reusable DTOs / validation
- production-oriented design
- clean modern SaaS UX
- role-based access control
- auditability and future scalability

Language rules:
- Code, comments, architecture explanations in English
- All user-facing labels, buttons, toasts, validation messages, and visible UI text must be in Kyrgyz

When generating any part of the system, respect these ownership rules and do not duplicate academic data in CRM.
