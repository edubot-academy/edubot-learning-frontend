# Shared Business Flow

## Primary lifecycle

Lead → Contact → Trial Lesson → Deal → Payment Submitted → Payment Confirmed → Enrollment Requested → Enrollment Activated → Group Participation → Learning Progress → Risk Detection → CRM Follow-up

---

## Detailed flow

### 1. Lead creation in CRM
A lead enters CRM from a source such as:
- Instagram
- Telegram
- WhatsApp
- Website
- Phone call
- Referral

CRM stores:
- basic contact info
- interested course reference
- assigned manager
- status
- notes
- tags

### 2. Lead qualification and deal creation
Sales updates lead status and creates or advances a deal.

CRM may reference:
- LMS course ID
- LMS group ID

### 3. Trial flow
If trial is required:
- CRM schedules trial lesson
- task/reminder is created
- trial result is recorded

### 4. Payment submission in CRM
Sales submits payment details or proof.

CRM creates payment record with status:
- `submitted`

### 5. Enrollment request from CRM to LMS
After payment submission, CRM sends enrollment request to LMS.

LMS behavior:
- find or create student
- map CRM contact to LMS student
- create enrollment with status `pending_activation`
- keep academic access locked

### 6. Payment confirmation in CRM
Assistant/admin/authorized user confirms payment.

CRM updates payment status to:
- `confirmed`

### 7. Enrollment activation in LMS
CRM calls LMS to activate the enrollment.

LMS behavior:
- set enrollment status to `active`
- unlock academic access
- keep activation audit data

### 8. Teacher and group operations in LMS
Teacher uses LMS to manage:
- group roster
- attendance
- homework
- quizzes
- student notes

### 9. Academic risk detection in LMS
LMS evaluates conditions such as:
- attendance below threshold
- consecutive absences
- inactivity
- low homework completion
- low quiz participation

### 10. Risk alert sent from LMS to CRM
LMS sends secure webhook/event to CRM.

CRM behavior:
- create or update retention case
- create task if required
- add timeline record
- notify responsible sales/support user

### 11. Retention follow-up in CRM
Sales/support contacts student to understand issues and recover engagement.

CRM tracks:
- outreach attempts
- notes
- case status
- resolution

---

## Secondary flow: payment problem after activation
1. CRM marks payment overdue
2. CRM may create payment reminder task
3. CRM may optionally call LMS to pause enrollment
4. LMS changes enrollment status to `paused` if business rules require

---

## Secondary flow: same student buys another course
1. CRM references existing contact
2. CRM creates new deal
3. CRM sends another enrollment request
4. LMS reuses existing student if mapped
5. LMS creates new enrollment for new course/group
