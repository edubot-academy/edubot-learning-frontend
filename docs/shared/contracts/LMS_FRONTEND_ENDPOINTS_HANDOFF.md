# LMS New Frontend Endpoints (Handoff Note)

This document lists new/updated LMS endpoints for frontend integration after adding support for:

- `video`
- `offline`
- `online_live`

## Common auth

For LMS app endpoints below, send:

- `Authorization: Bearer <jwt>`

Role requirements are listed per endpoint.

---

## 1. Course Groups (Cohorts)

### POST `/course-groups`

Create a cohort (group) for a course template.

Roles:

- `admin`, `assistant`, `instructor`

Request body:

```json
{
    "courseId": 12,
    "name": "Python Bootcamp April Morning",
    "code": "PY-APR-2026-AM",
    "status": "planned",
    "startDate": "2026-04-01",
    "endDate": "2026-06-30",
    "seatLimit": 25,
    "timezone": "Asia/Bishkek",
    "location": "Bishkek, Main Branch",
    "meetingProvider": "zoom",
    "meetingUrl": "https://zoom.us/j/...",
    "instructorId": 45
}
```

Response:

- Created `CourseGroup` object.

---

### PATCH `/course-groups/:id`

Update group fields.

Roles:

- `admin`, `assistant`, `instructor`

Request body:

- Partial fields from create endpoint.

Response:

- Updated `CourseGroup` object.

---

### GET `/course-groups/:id`

Get one group.

Roles:

- `admin`, `assistant`, `instructor`

Response:

- `CourseGroup` (with course and instructor relations).

---

### GET `/course-groups?courseId=<id>&status=<status>`

List groups (filters optional).

Roles:

- `admin`, `assistant`, `instructor`

Response:

- Array of `CourseGroup`.

---

## 2. Course Sessions

### POST `/course-sessions`

Create one session under a group.

Roles:

- `admin`, `assistant`, `instructor`

Request body:

```json
{
    "groupId": 5,
    "sessionIndex": 1,
    "title": "Intro Session",
    "startsAt": "2026-04-02T13:00:00.000Z",
    "endsAt": "2026-04-02T15:00:00.000Z",
    "status": "scheduled",
    "recordingUrl": null,
    "materials": [{ "title": "Slides", "url": "https://..." }]
}
```

Response:

- Created `CourseSession` object.

---

### PATCH `/course-sessions/:id`

Update session fields.

Roles:

- `admin`, `assistant`, `instructor`

Response:

- Updated `CourseSession` object.

---

### GET `/course-sessions/:id`

Get one session.

Roles:

- `admin`, `assistant`, `instructor`

Response:

- `CourseSession` (with group/course relation).

---

### GET `/course-sessions?groupId=<id>`

List sessions.

Roles:

- `admin`, `assistant`, `instructor`

Response:

- Array of `CourseSession` ordered by `startsAt`.

---

### GET `/course-groups/:groupId/students`

Return the authoritative roster for one academic group.

Roles:

- `admin`, `assistant`, `instructor`

Query params:

- `page`
- `limit`
- `q`
- `progressGte`
- `progressLte`

Response:

```json
{
    "items": [
        {
            "id": 101,
            "userId": 101,
            "fullName": "Aizada Asanova",
            "email": "aizada@example.com",
            "groupId": 15,
            "courseGroupId": 15,
            "courseId": 12,
            "enrolledAt": "2026-04-01T08:00:00.000Z"
        }
    ],
    "total": 1,
    "page": 1,
    "limit": 50
}
```

Notes:

- This endpoint should be the primary roster source for delivery-course session flows.
- Session attendance and session homework assignment must validate against this group roster.
- Frontend dashboard/session flows should not fall back to course-wide student filtering when this endpoint is available.

---

## 3. Attendance (Session-based)

### POST `/attendance/sessions/:sessionId/bulk`

Mark attendance for session students.

Roles:

- `admin`, `assistant`, `instructor`

Request body:

```json
{
    "courseId": 12,
    "rows": [
        {
            "studentId": 101,
            "status": "present",
            "joinedAt": "2026-04-02T13:01:00.000Z",
            "leftAt": "2026-04-02T14:58:00.000Z",
            "notes": "on time"
        },
        {
            "studentId": 102,
            "status": "late"
        }
    ]
}
```

Status values:

- `present | absent | late | excused`

Response:

```json
{
    "success": true,
    "sessionId": 77,
    "courseId": 12,
    "updated": 2
}
```

---

### GET `/attendance/sessions/:sessionId`

Get attendance records for one session.

Roles:

- `admin`, `assistant`, `instructor`

Response:

- `{ items: AttendanceRecord[], total: number }`

---

### Legacy attendance endpoints (still available)

- `POST /attendance/session` (course/date based)
- `GET /attendance/course?courseId=<id>&from=<date>&to=<date>`

Notes:

- These endpoints are legacy-only.
- Instructor/admin dashboard attendance and session workspace should use session-based attendance endpoints with an explicit `sessionId`.
- Frontend should not submit attendance writes unless a concrete session is selected.

---

## 4. Session Homework

### GET `/course-sessions/:sessionId/homework?includeUnpublished=<bool>`

List homework for one session.

Roles:

- `admin`, `assistant`, `instructor`, `student`

Notes:

- `student` sees only published homework that is visible to the logged-in learner.
- `includeUnpublished=true` is intended for internal roles only.

---

### POST `/course-sessions/:sessionId/homework`

Create homework for one session.

Roles:

- `admin`, `assistant`, `instructor`

Request body:

```json
{
    "title": "Homework 1",
    "description": "Complete the worksheet",
    "deadline": "2026-04-05T18:00:00.000Z",
    "maxScore": 100,
    "isPublished": true,
    "assignedStudentIds": [101, 102]
}
```

Notes:

- Backend also accepts `dueAt`; frontend may normalize `deadline | dueAt | dueDate` for display.
- `assignedStudentIds` must belong to the selected group roster for that session.

---

### PATCH `/course-sessions/:sessionId/homework/:homeworkId`

Update one session homework item.

Roles:

- `admin`, `assistant`, `instructor`

Notes:

- Editing homework should preserve publish state unless `isPublished` is changed explicitly.

---

### POST `/course-sessions/:sessionId/homework/:homeworkId/submissions`

Submit student homework.

Roles:

- `student`

Request body:

```json
{
    "text": "My answer",
    "link": "https://drive.google.com/...",
    "attachmentUrl": "https://signed.example.com/file.pdf"
}
```

Notes:

- Student payload aliases `text` -> `answerText` and `link` -> `attachmentUrl` are supported.
- Submission must contain at least one of text, link, or uploaded attachment.

---

### POST `/course-sessions/:sessionId/homework/:homeworkId/submissions/upload`

Upload one homework attachment before submission save.

Roles:

- `student`

Content type:

- `multipart/form-data`

Form fields:

- `file`

Response:

```json
{
    "key": "homework-submissions/dev/session-118/homework-2/student-55/1711612345678-solution.pdf",
    "url": "https://signed.example.com/...",
    "fileName": "solution.pdf",
    "contentType": "application/pdf",
    "size": 125004
}
```

Validation:

- max size: `20 MB`
- allowed academic file types include PDF, DOC/DOCX, XLS/XLSX, PPT/PPTX, ZIP, TXT, CSV, JSON, JPG/JPEG, PNG, WEBP

---

### GET `/course-sessions/:sessionId/homework/:homeworkId/submissions`

List instructor review submissions for one session homework item.

Roles:

- `admin`, `assistant`, `instructor`

Notes:

- Submission read payload should expose attachment metadata and downloadable URLs for instructor review UI.

---

## 5. Live Integration

### POST `/live-integration/sessions/:sessionId/meeting`

Create/attach meeting for a session.

Roles:

- `admin`, `assistant`, `instructor`

Request body:

```json
{
    "provider": "zoom",
    "topic": "Frontend Bootcamp - Session 1",
    "agenda": "Intro + setup",
    "startTime": "2026-04-02T13:00:00.000Z",
    "durationMinutes": 120,
    "timezone": "Asia/Bishkek",
    "hostUserId": "me"
}
```

For non-zoom providers:

```json
{
    "provider": "custom",
    "customJoinUrl": "https://meet.google.com/..."
}
```

Response (zoom):

```json
{
    "success": true,
    "provider": "zoom",
    "sessionId": 77,
    "meetingId": "1234567890",
    "joinUrl": "https://zoom.us/j/...",
    "hostUrl": "https://zoom.us/s/...",
    "startTime": "2026-04-02T13:00:00.000Z",
    "durationMinutes": 120,
    "timezone": "Asia/Bishkek"
}
```

---

### PATCH `/live-integration/sessions/:sessionId/meeting`

Update existing session meeting.

Roles:

- `admin`, `assistant`, `instructor`

Request body:

- Same as create, partial fields allowed.

Response:

- Updated meeting payload.

---

### POST `/live-integration/sessions/:sessionId/attendance/import`

Import session attendance from Zoom participant logs.

Roles:

- `admin`, `assistant`, `instructor`

Request body:

```json
{
    "presentMinPercent": 70,
    "lateGraceMinutes": 10
}
```

Response:

```json
{
    "success": true,
    "sessionId": 77,
    "meetingId": "1234567890",
    "imported": 18,
    "unmatchedParticipants": [{ "email": "guest@gmail.com", "name": "Guest User" }],
    "rules": {
        "presentMinPercent": 70,
        "lateGraceMinutes": 10
    }
}
```

---

### POST `/live-integration/sessions/:sessionId/recordings/sync`

Sync Zoom recordings into LMS and optionally set session `recordingUrl`.

Roles:

- `admin`, `assistant`, `instructor`

Request body:

```json
{
    "setSessionRecordingUrl": true
}
```

Response:

```json
{
    "success": true,
    "sessionId": 77,
    "meetingId": "1234567890",
    "synced": 3,
    "recordingUrl": "https://zoom.us/rec/play/..."
}
```

---

### GET `/live-integration/sessions/:sessionId/meeting?provider=zoom`

Get meeting details attached to session.

Roles:

- `admin`, `assistant`, `instructor`

Response:

- Meeting metadata (`meetingId`, `joinUrl`, `hostUrl`, `status`, timing).

---

### DELETE `/live-integration/sessions/:sessionId/meeting?provider=zoom`

Delete/cancel meeting from session.

Roles:

- `admin`, `assistant`, `instructor`

Response:

- `{ success, sessionId, deleted, meetingId }`

---

## 6. Updated existing course endpoints

### POST `/courses`

### PATCH `/courses/:id`

New payload field:

- `courseType`: `video | offline | online_live`

---

## 7. Zoom webhook endpoint (backend integration)

### POST `/webhooks/zoom`

Used by Zoom platform (not LMS frontend).

Responsibilities:

- Verify Zoom signature (`x-zm-signature`, `x-zm-request-timestamp`)
- Handle `endpoint.url_validation`
- Store incoming events idempotently in `zoom_webhook_events`

---

## Frontend implementation notes

1. Always include JWT bearer token.
2. Expect role-based `403` for unauthorized role actions.
3. Keep datetime fields in ISO format.
4. For attendance bulk submit, send all visible students for current session in one request.
5. For live classes, use `GET /live-integration/sessions/:sessionId/meeting` to restore join link state.

## 8. Admin Ops Endpoints (LMS backend operations)

### GET `/live-integration/admin/health`

Get Zoom integration processing health.

Roles:

- `admin`

Response:

```json
{
    "success": true,
    "queue": {
        "total": 120,
        "processed": 114,
        "failed": 6
    },
    "lastError": {
        "id": 42,
        "eventType": "recording.completed",
        "attempts": 3,
        "error": "...",
        "createdAt": "2026-03-11T12:00:00.000Z"
    }
}
```

---

### POST `/live-integration/admin/webhooks/retry-failed`

Retry failed Zoom webhook events in batch.

Roles:

- `admin`

Request body:

```json
{
    "limit": 50
}
```

Response:

```json
{
    "success": true,
    "selected": 6,
    "processed": 5,
    "stillFailed": 1
}
```

---

### POST `/live-integration/admin/webhooks/:eventId/replay`

Replay one stored Zoom webhook event by DB id.

Roles:

- `admin`

---

## 9. CRM Integration Admin Endpoints (LMS dashboard operations)

### GET `/admin/integration/health`

Return CRM/LMS webhook queue health.

Roles:

- `admin`, `assistant`

---

### GET `/admin/integration/risk-summary`

Return risk severity/issue summary for the integration dashboard.

Roles:

- `admin`, `assistant`

---

### GET `/admin/integration/events?page=<n>&limit=<n>&status=<pending|sent|failed>&eventType=<risk_alert|enrollment_status_changed>`

List CRM integration events for the LMS dashboard.

Roles:

- `admin`, `assistant`

Notes:

- Enrollment monitoring UI should use `eventType=enrollment_status_changed`.
- `status` here means webhook delivery state, not LMS enrollment state.

---

### GET `/admin/integration/events/:id`

Get one CRM integration event with full payload detail.

Roles:

- `admin`, `assistant`

Notes:

- Dashboard event detail drawers may use this endpoint to show payload JSON, enrollment status, access status, and failure reason.

Response:

```json
{
    "success": true,
    "eventId": 42,
    "processed": true,
    "lastError": null,
    "attempts": 4
}
```

---

## 8. Analytics Endpoints

Common analytics query filters (optional):

- `from` (ISO date string)
- `to` (ISO date string)
- `courseId`
- `groupId`

### Admin analytics

#### GET `/analytics/admin/overview`

Returns combined admin dashboard data. Supports filters: `from`, `to`, `courseId`, `groupId`

Returns combined admin dashboard data:

- course popularity
- group fill rate
- attendance rate
- dropout risk
- instructor performance

Roles:

- `admin`

#### GET `/analytics/admin/course-popularity`

Returns enrollment counts per course. Supports filters: `from`, `to`, `courseId`, `groupId`

Roles:

- `admin`

#### GET `/analytics/admin/group-fill-rate`

Returns group seat utilization. Supports filters: `from`, `to`, `courseId`, `groupId`

Roles:

- `admin`

#### GET `/analytics/admin/attendance-rate`

Returns global attendance KPI (`total`, `good`, `rate`). Supports filters: `from`, `to`, `courseId`, `groupId`

Roles:

- `admin`

#### GET `/analytics/admin/dropout-risk`

Returns risk distribution and top at-risk students. Supports filters: `from`, `to`, `courseId`, `groupId`

Roles:

- `admin`

#### GET `/analytics/admin/instructor-performance`

Returns instructor-level performance summary. Supports filters: `from`, `to`, `courseId`, `groupId`

Roles:

- `admin`

---

### Instructor analytics

#### GET `/analytics/instructor/overview`

Returns instructor dashboard widgets. Supports filters: `from`, `to`, `courseId`, `groupId`

Returns instructor dashboard widgets:

- student attendance
- homework completion
- engagement score
- students at risk

Roles:

- `instructor`, `admin`

Query:

- `instructorId` (optional, admin-only override)

#### GET `/analytics/instructor/students-at-risk`

Returns at-risk students for instructor's groups. Supports filters: `from`, `to`, `courseId`, `groupId`

Roles:

- `instructor`, `admin`

Query:

- `instructorId` (optional, admin-only override)

---

### Student analytics

#### GET `/analytics/student/overview`

Returns student dashboard widgets. Supports filters: `from`, `to`, `courseId`, `groupId`

Returns student dashboard widgets:

- progress
- attendance
- completed tasks
- course milestones

Roles:

- `student`, `admin`, `instructor`, `assistant`

Query:

- `studentId` (optional, ignored for student role)
