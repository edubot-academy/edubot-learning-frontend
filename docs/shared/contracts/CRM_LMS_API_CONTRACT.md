# CRM ↔ LMS API Contract

## Purpose

This document defines the minimum integration contract between EduBot CRM and EduBot Learning.

---

## Authentication

### CRM calling LMS
Use secure service-to-service auth headers:
- `Authorization: Bearer <integration_token>`
- `X-Client-System: crm`
- `X-Company-Id: <company_context_id>` (required; single-tenant CRM can use a constant like `default`)
- `X-Request-Id: <uuid>` (new value per transport attempt/retry)

For mutating enrollment endpoints, CRM must also send:
- `X-Idempotency-Key: <stable_key_per_business_action>`

Idempotency contract:
- same key + same payload => safe replay (same result)
- same key + different payload => `409 conflict`
- missing key on enrollment mutation => `400`
- enrollment mutation scope includes:
  - `POST /api/integration/enrollments`
  - `PATCH /api/integration/enrollments/:enrollmentId/activate`
  - `PATCH /api/integration/enrollments/:enrollmentId/pause`

### LMS calling CRM webhooks
Use:
- `Authorization: Bearer <webhook_token>`
- `X-Event-Type: <event_type>`
- `X-Request-Id: <uuid>`
- optional `X-Signature`

---

# LMS Integration API

Base path:

```http
/api/integration
```

## 1. Get courses

```http
GET /api/integration/courses
```

### Query params
- `page?`
- `limit?`
- `search?`
- `isActive?`

### Response shape

```ts
type IntegrationCourseDto = {
  id: string;
  name: string;
  duration: string;
  price: number;
  level: string | null;
  description: string | null;
  assignedTeacherId: string | null;
  assignedTeacherName: string | null;
  schedule: string | null;
  capacity: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type IntegrationCourseListResponse = {
  items: IntegrationCourseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
```

---

## 2. Get groups

```http
GET /api/integration/groups
```

### Query params
- `courseId?`
- `status?=planned|active|completed|cancelled`
- `page?`
- `limit?`

### Response shape

```ts
type IntegrationGroupDto = {
  id: string;
  courseId: string;
  courseName: string;
  teacherId: string | null;
  teacherName: string | null;
  name: string;
  startDate: string | null;
  endDate: string | null;
  schedule: string | null;
  maxCapacity: number | null;
  currentStudentCount: number;
  availableSeats: number | null;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
};

type IntegrationGroupListResponse = {
  items: IntegrationGroupDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
```

---

## 3. Create enrollment request

```http
POST /api/integration/enrollments
```

### Request body

```ts
type CreateIntegrationEnrollmentRequestDto = {
  crmLeadId: string;
  crmContactId?: string | null;
  crmDealId?: string | null;
  crmPaymentId?: string | null;
  student: {
    fullName: string;
    phone: string;
    email?: string | null;
  };
  courseId: string;
  courseType: 'video' | 'offline' | 'online_live';
  groupId?: string | null; // video: nullable; offline/online_live: required
  paymentStatus: 'submitted' | 'confirmed' | 'failed' | 'refunded' | 'overdue';
  sourceSystem: 'crm';
  meta?: {
    submittedByUserId?: string | null;
    submittedByName?: string | null;
    notes?: string | null;
  };
};
```

### Expected LMS behavior
- find or create student
- map stable CRM person identity, preferably `crmContactId`
- keep `crmLeadId` only for lineage/audit
- create enrollment as `pending`
- keep academic access locked until activated
- validate course/group rules:
  - `video` can be created with `groupId = null`
  - `offline` and `online_live` require `groupId`
- if the same learner already has an active matching LMS enrollment, a create-request retry must not downgrade it back to `pending` or locked

### Response shape

```ts
type CreateIntegrationEnrollmentResponseDto = {
  enrollmentId: string;
  studentId: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  accessActive: boolean;
};
```

---

## 4. Activate enrollment

```http
PATCH /api/integration/enrollments/:enrollmentId/activate
```

### Request body

```ts
type ActivateIntegrationEnrollmentRequestDto = {
  crmLeadId: string;
  crmContactId?: string | null;
  crmPaymentId?: string | null;
  paymentStatus: 'confirmed';
  activatedByUserId?: string | null;
  activatedByName?: string | null;
  notes?: string | null;
};
```

### Expected LMS behavior
- set enrollment status to `active`
- unlock academic access
- set `activatedAt`

### Response shape

```ts
type ActivateIntegrationEnrollmentResponseDto = {
  enrollmentId: string;
  studentId: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  accessActive: boolean;
};
```

---

## 5. Pause enrollment

```http
PATCH /api/integration/enrollments/:enrollmentId/pause
```

### Request body

```ts
type PauseIntegrationEnrollmentRequestDto = {
  reason: string;
  pausedByUserId?: string | null;
  pausedByName?: string | null;
};
```

---

## 6. Get student academic summary

```http
GET /api/integration/students/:studentId/summary
```

### Response shape

```ts
type IntegrationStudentSummaryResponseDto = {
  student: {
    id: string;
    crmLeadId: string | null;
    fullName: string;
  };
  enrollments: Array<{
    enrollmentId: string;
    courseId: string;
    courseName: string;
    groupId: string | null;
    groupName: string | null;
    enrollmentStatus: 'pending' | 'active' | 'completed' | 'cancelled';
    attendanceRate: number | null;
    homeworkCompletionRate: number | null;
    quizParticipationRate: number | null;
    progressPercent: number | null;
    lastActivityAt: string | null;
    riskLevel: 'low' | 'medium' | 'high' | 'critical' | null;
  }>;
};
```

---

## Transport retry/error policy

- CRM retries LMS calls only on transient failures: `429`, `5xx`, timeout/network errors.
- CRM does not retry on contract/auth/business errors: `400`, `401`, `403`, `404`, `409`, `422`.
- LMS error envelope expected by CRM:

```ts
type IntegrationErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  requestId: string;
  timestamp: string;
};
```

---

# CRM Webhook API

Base path:

```http
/api/integrations/lms
```

## 7. Risk alert webhook

```http
POST /api/integrations/lms/risk-alerts
```

### Request body

```ts
type LmsRiskAlertWebhookDto = {
  eventId: string;
  eventType: 'risk_alert';
  occurredAt: string;
  crmLeadId?: string | null;
  lmsStudentId: string;
  lmsEnrollmentId: string;
  lmsCourseId: string;
  lmsGroupId?: string | null;
  issueType: 'low_attendance' | 'inactive_student' | 'low_homework_completion' | 'low_quiz_participation' | 'payment_risk';
  severity: 'low' | 'medium' | 'high' | 'critical';
  metrics: {
    attendanceRate?: number | null;
    homeworkCompletionRate?: number | null;
    quizParticipationRate?: number | null;
    inactivityDays?: number | null;
    progressPercent?: number | null;
    lastActivityAt?: string | null;
  };
  summary: string;
};
```

### Expected CRM behavior
- dedupe by `eventId`
- find mapped contact/student
- create or update retention case
- add timeline event
- optionally create follow-up task

### Response shape

```ts
type LmsRiskAlertWebhookResponseDto = {
  success: boolean;
  message: string;
  retentionCaseId?: string;
};
```

---

## 8. Optional enrollment status webhook

```http
POST /api/integrations/lms/enrollment-status
```

### Request body

```ts
type LmsEnrollmentStatusWebhookDto = {
  eventId: string;
  eventType: 'enrollment_status_changed';
  occurredAt: string;
  crmLeadId?: string | null;
  lmsStudentId: string;
  lmsEnrollmentId: string;
  enrollmentStatus: 'pending' | 'active' | 'completed' | 'cancelled';
  accessStatus: 'locked' | 'active';
  reason?: string | null;
};
```

---

## Error format

```ts
type IntegrationErrorResponse = {
  success: false;
  message: string;
  errorCode: string;
  details?: unknown;
};
```

---

## Idempotency recommendation

Use:
- `X-Request-Id` for CRM → LMS calls
- `eventId` for LMS → CRM webhook events

Critical endpoints that must be idempotent:
- `POST /api/integration/enrollments`
- `POST /api/integrations/lms/risk-alerts`
