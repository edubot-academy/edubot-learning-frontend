# CRM ↔ LMS API Contract

## Purpose

This document defines the minimum integration contract between EduBot CRM and EduBot Learning.

---

## Authentication

### CRM calling LMS
Use secure service-to-service auth headers:
- `Authorization: Bearer <integration_token>`
- `X-Client-System: crm`
- `X-Company-Id: <company_id>`
- `X-Request-Id: <uuid>`

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
  crmCompanyId: string;
  crmLeadId: string;
  crmDealId?: string | null;
  crmPaymentId?: string | null;
  student: {
    fullName: string;
    phone: string;
    email?: string | null;
  };
  courseId: string;
  groupId: string;
  paymentStatus: 'submitted' | 'confirmed' | 'failed' | 'refunded' | 'overdue';
  enrollmentStatus?: 'pending_activation' | 'active' | 'paused' | 'completed' | 'cancelled';
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
- map `crmLeadId`
- create enrollment as `pending_activation` by default
- keep academic access locked until activated

### Response shape

```ts
type CreateIntegrationEnrollmentResponseDto = {
  success: boolean;
  message: string;
  student: {
    id: string;
    crmLeadId: string | null;
    fullName: string;
    phone: string;
    email: string | null;
  };
  enrollment: {
    id: string;
    courseId: string;
    groupId: string;
    enrollmentStatus: 'pending_activation' | 'active' | 'paused' | 'completed' | 'cancelled';
    accessStatus: 'locked' | 'active';
    paymentStatusSnapshot: 'submitted' | 'confirmed' | 'failed' | 'refunded' | 'overdue';
    createdAt: string;
  };
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
  crmCompanyId: string;
  crmLeadId: string;
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
  success: boolean;
  message: string;
  enrollment: {
    id: string;
    enrollmentStatus: 'pending_activation' | 'active' | 'paused' | 'completed' | 'cancelled';
    accessStatus: 'locked' | 'active';
    activatedAt: string | null;
  };
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
    enrollmentStatus: 'pending_activation' | 'active' | 'paused' | 'completed' | 'cancelled';
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
  companyId: string;
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
  companyId: string;
  crmLeadId?: string | null;
  lmsStudentId: string;
  lmsEnrollmentId: string;
  enrollmentStatus: 'pending_activation' | 'active' | 'paused' | 'completed' | 'cancelled';
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
