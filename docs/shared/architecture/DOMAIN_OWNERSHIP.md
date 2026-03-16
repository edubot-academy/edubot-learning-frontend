# Domain Ownership

## Purpose

This document defines which system owns which domain so EduBot CRM and EduBot Learning do not duplicate responsibility.

---

## CRM ownership

CRM is the system of record for:

- leads
- lead sources
- assigned managers
- lead statuses
- lead notes and tags
- deals / sales opportunities
- sales pipeline stages
- trial scheduling from sales workflow perspective
- payment submission
- payment confirmation workflow
- communication timeline
- follow-up tasks
- sales notifications
- retention and re-engagement cases
- sales and retention dashboards

CRM can reference LMS data, but should not own academic truth.

### CRM may store snapshots of LMS data
To keep history stable, CRM may store snapshots such as:
- `courseNameSnapshot`
- `groupNameSnapshot`
- `teacherNameSnapshot` if needed for historical records

These snapshots do not replace LMS ownership.

---

## LMS ownership

LMS is the system of record for:

- courses
- course metadata
- groups / batches
- teacher assignment
- student academic records
- enrollments
- attendance
- homework assignments and submissions
- quizzes and attempts
- progress
- academic notifications
- academic reports
- student portal access

---

## Shared concepts with single ownership

### Course
- **Owned by LMS**
- CRM only consumes it

### Group
- **Owned by LMS**
- CRM only consumes it

### Student identity
- academic profile exists in LMS
- sales/contact profile exists in CRM
- mapping is required

### Enrollment
- **Owned by LMS**
- CRM triggers enrollment request but does not own academic enrollment state

### Payment
- **Owned by CRM**
- LMS may store `paymentStatusSnapshot` for access control context, but CRM is the financial source of truth for the sales flow

### Risk case / retention case
- **Owned by CRM**
- LMS only emits signals or summary metrics

---

## Non-goals

The following should not happen:
- duplicate course creation in CRM
- duplicate group management in CRM
- teacher attendance management in CRM
- sales directly editing attendance or homework records
- LMS owning sales pipeline logic

---

## Ownership summary table

| Domain | Owner | Other system role |
|---|---|---|
| Leads | CRM | none |
| Deals | CRM | none |
| Payments | CRM | LMS may consume snapshot |
| Courses | LMS | CRM consumes reference |
| Groups | LMS | CRM consumes reference |
| Enrollments | LMS | CRM requests / references |
| Attendance | LMS | CRM consumes summary / alerts |
| Homework | LMS | CRM consumes summary / alerts |
| Quizzes | LMS | CRM consumes summary / alerts |
| Retention Cases | CRM | LMS triggers risk signal |
| Student Portal Access | LMS | CRM does not control directly |
