Build a modern LMS frontend for EduBot Learning.

This LMS is for education centers and academies that deliver:
- English courses
- IT courses
- DevOps courses
- training programs

Important architecture rule:
This frontend must connect to an existing LMS backend API.
Do not build the academic system as fake local-only logic.
Use scalable component-based architecture, protected routes, module-based API services, and production-oriented UI.

Business purpose:
The LMS should manage:
- course catalog
- groups
- teachers
- enrollments
- attendance
- homework
- quizzes
- progress
- student learning access

Important integration rules with CRM:
- courses are created in LMS and consumed by CRM
- groups are created in LMS and consumed by CRM
- student enrollments may be created from CRM
- enrollment access becomes active only after LMS enrollment status is active
- LMS should support sending academic risk signals back to CRM, such as low attendance, inactivity, and weak homework/quiz engagement

Main modules/pages:
1. Login
2. Dashboard
3. Courses
4. Course Detail
5. Groups
6. Group Detail
7. Teachers
8. Enrollments
9. Attendance
10. Homework
11. Quizzes
12. Progress
13. Students
14. Student Detail
15. Notifications
16. Reports
17. Settings
18. Student Portal

Design requirements:
- clean modern SaaS educational dashboard
- left sidebar navigation
- responsive layout
- support light and dark mode
- modern cards, tables, progress widgets, calendars, and data views
- clear distinction between academic and admin areas

Core LMS entities:

Course:
- course name
- duration
- price
- level
- description
- assigned teacher
- schedule
- capacity

Group:
- course
- teacher
- start date
- schedule
- students
- max capacity
- status

Enrollment:
- student
- course
- group
- status
- access status
- start date
- progress

Enrollment statuses:
- pending_activation
- active
- paused
- completed
- cancelled

Teacher tools:
- attendance taking
- homework assignment
- quiz management
- group roster
- student notes

Attendance UI:
- mark present/absent/late
- group-wise session view
- attendance summary per student
- attendance trends
- identify at-risk students

Homework UI:
- assign homework
- submission status
- grading/feedback
- completion statistics

Quiz UI:
- create/manage quizzes
- submissions
- scores
- participation rate

Progress UI:
- course progress
- lesson completion
- quiz summary
- homework completion
- attendance summary

Student detail page should show:
- profile
- active enrollments
- group
- attendance rate
- homework completion
- quiz performance
- risk indicators
- notes/history

Reports should include:
- attendance reports
- course/group occupancy
- homework completion
- quiz participation
- student engagement
- at-risk student count

Risk signal UX:
The LMS admin/teacher view should make it easy to identify:
- low attendance
- inactivity
- missing homework
- low quiz participation
These risk states should be visible and prepared for CRM follow-up integration.

Student portal:
- show active courses
- group/schedule
- lessons/resources
- homework
- quizzes
- attendance summary
- progress summary
- notifications

Language rule:
All visible UI text must be in Kyrgyz.
Code/comments can remain in English.

Generate a real, scalable LMS frontend suitable for academic operations.
