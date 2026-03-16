# EduBot Platform System Architecture

## Overview

EduBot currently consists of **two separate working backend systems**:

1. **EduBot CRM**
2. **EduBot Learning (LMS)**

These systems must stay separate at the service level, but they must integrate tightly enough to support the full customer and student lifecycle.

## Business lifecycle

Lead → Contact → Trial Lesson → Deal → Payment Submission → Payment Confirmation → Enrollment in LMS → Group Assignment → Learning Activity → Academic Risk Detection → CRM Follow-up / Retention

## Core architectural rule

- **CRM owns commercial workflow**
- **LMS owns academic workflow**

This separation prevents duplication, sync drift, and unclear responsibility.

---

## System responsibilities

### EduBot CRM owns
- leads
- contacts from sales perspective
- deals and sales pipeline
- payment submission
- payment confirmation workflow
- sales tasks
- follow-ups
- communication timeline
- retention and re-engagement cases
- reporting related to sales and retention

### EduBot Learning owns
- course catalog
- groups / batches
- teachers
- students from academic perspective
- enrollments
- attendance
- homework
- quizzes
- learning progress
- academic notifications
- academic reporting

---

## Integration principles

### 1. Course catalog is created once
Courses must be created **only in LMS**.

CRM must not maintain a second academic course catalog.

CRM may store:
- LMS course ID
- course name snapshot for historical records
- LMS group ID
- group name snapshot for historical records

### 2. CRM can sell, LMS can teach
CRM can:
- display courses and groups fetched from LMS
- attach course/group selection to a lead or deal
- collect payment submission
- trigger enrollment requests

LMS can:
- create or map student records
- create enrollments
- activate academic access
- manage group participation
- track attendance, homework, quizzes, and progress

### 3. Academic access is controlled by LMS
A student should receive full academic access only when LMS enrollment status becomes `active`.

CRM may initiate the process, but LMS remains the final gatekeeper for academic access.

### 4. LMS sends back academic risk signals
When a student becomes academically at risk, LMS should notify CRM.

Examples:
- low attendance
- inactivity
- poor homework completion
- low quiz participation

CRM should convert those signals into:
- retention cases
- follow-up tasks
- timeline records
- notifications for sales/support

---

## Recommended high-level flow

### CRM to LMS
- fetch courses
- fetch groups
- create enrollment request
- activate enrollment after payment confirmation
- pause enrollment if needed
- fetch student academic summary

### LMS to CRM
- risk alerts
- optional enrollment status updates

---

## Technical integration style

### Recommended now
- direct API integration between CRM and LMS
- secure service-to-service authentication
- idempotent requests for critical operations
- webhook/event support from LMS to CRM

### Recommended later
- optional integration service / message broker if traffic or complexity grows

---

## Data boundaries

### CRM writes
- lead data
- deal state
- payment state
- sales task state
- retention case state
- communication history

### LMS writes
- course data
- group data
- student academic data
- enrollment state
- attendance records
- homework records
- quiz records
- academic progress summaries

---

## Cross-system identity

Since CRM and LMS have separate databases, student identity must be linked through mapping fields and/or mapping tables.

Recommended keys:
- `crmContactId`
- `lmsStudentId`
- `lmsEnrollmentId`
- optional `externalStudentId`

See `IDENTITY_MAPPING.md` for the detailed strategy.

---

## Architecture goals

This architecture is designed to achieve:
- no duplicate academic catalog
- clear business ownership
- scalable integration
- safe academic access control
- strong retention workflows
- easier reporting and auditing
