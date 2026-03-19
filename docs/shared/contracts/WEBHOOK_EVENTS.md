# LMS → CRM Webhook Events

## Purpose

This document defines webhook/event payloads that LMS can send to CRM.

---

## Common headers

Recommended headers:
- `Authorization: Bearer <webhook_token>`
- `X-Event-Type: <event_type>`
- `X-Request-Id: <uuid>`
- optional `X-Signature`

---

## Event: risk_alert

Used when academic behavior requires CRM follow-up.

### Payload

```json
{
  "eventId": "evt_10001",
  "eventType": "risk_alert",
  "occurredAt": "2026-03-09T10:00:00.000Z",
  "companyId": "company_1",
  "crmLeadId": "contact_123",
  "lmsStudentId": "lms_student_1",
  "lmsEnrollmentId": "enrollment_1001",
  "lmsCourseId": "course_101",
  "lmsGroupId": "group_201",
  "issueType": "low_attendance",
  "severity": "high",
  "metrics": {
    "attendanceRate": 62,
    "lastActivityAt": "2026-03-07T10:00:00.000Z"
  },
  "summary": "Студенттин катышуусу 70%дан төмөн түштү"
}
```

### Supported issue types
- `low_attendance`
- `inactive_student`
- `low_homework_completion`
- `low_quiz_participation`
- `payment_risk`

---

## Event: enrollment_status_changed

Used when LMS changes enrollment state asynchronously.

### Payload

```json
{
  "eventId": "evt_10002",
  "eventType": "enrollment_status_changed",
  "occurredAt": "2026-03-09T12:00:00.000Z",
  "companyId": "company_1",
  "crmLeadId": "contact_123",
  "lmsStudentId": "lms_student_1",
  "lmsEnrollmentId": "enrollment_1001",
  "enrollmentStatus": "active",
  "accessStatus": "active",
  "reason": "First installment confirmed"
}
```

---

## CRM expected behavior

For `risk_alert`:
- dedupe by `eventId`
- create/update retention case
- create timeline item
- assign task if needed

For `enrollment_status_changed`:
- update local integration state
- add timeline event
- optionally notify sales/admin

---

## Retry policy recommendation

If CRM returns non-2xx:
- LMS should retry with backoff
- LMS should log failed attempts
- event should remain idempotent through `eventId`
