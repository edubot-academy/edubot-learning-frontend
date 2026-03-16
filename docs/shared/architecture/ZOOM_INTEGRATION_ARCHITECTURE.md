# Zoom Integration Architecture (LMS)

## Goal

Enable instructors to run live classes from LMS with end-to-end support for:

- meeting creation
- join link delivery
- attendance import
- recording sync

This document maps Zoom integration to existing LMS endpoints:

- `POST /course-sessions`
- `PATCH /course-sessions/:id`
- `POST /attendance/sessions/:sessionId/bulk`
- `POST /live-integration/sessions/:sessionId/meeting`

## Service Design (NestJS style)

### Modules

1. `ZoomAuthModule`

- Handles OAuth install, token refresh, and connection lifecycle.

2. `ZoomMeetingModule`

- Handles create/update/delete meeting calls and LMS session mapping.

3. `ZoomWebhookModule`

- Receives, verifies, and dispatches Zoom webhooks.

4. `ZoomSyncModule`

- Pulls recordings and participants, reconciles attendance, updates LMS.

5. `ZoomJobsModule`

- Queue workers for resilient async processing (BullMQ/Redis).

## Data Model

### `zoom_connections`

- `id` (PK)
- `company_id` (FK)
- `installer_user_id` (FK)
- `zoom_account_id`
- `access_token_encrypted`
- `refresh_token_encrypted`
- `token_expires_at`
- `scope`
- `status` (`active|revoked`)
- `created_at`, `updated_at`

### `zoom_meetings`

- `id` (PK)
- `company_id` (FK)
- `course_session_id` (FK, unique)
- `zoom_meeting_id`
- `zoom_meeting_uuid`
- `host_zoom_user_id`
- `provider` (`zoom`)
- `join_url`
- `start_url` (optional)
- `passcode` (optional)
- `meeting_status` (`scheduled|started|ended|deleted`)
- `settings_json`
- `created_at`, `updated_at`

### `zoom_recordings`

- `id` (PK)
- `company_id` (FK)
- `course_session_id` (FK)
- `zoom_meeting_id`
- `zoom_recording_id` (unique)
- `file_type`
- `recording_start`
- `recording_end`
- `play_url`
- `download_url` (optional per policy)
- `processing_status`
- `synced_at`
- `created_at`, `updated_at`

### `zoom_participants`

- `id` (PK)
- `company_id` (FK)
- `course_session_id` (FK)
- `zoom_meeting_id`
- `zoom_user_id` (nullable)
- `email` (nullable)
- `display_name`
- `join_time`
- `leave_time`
- `duration_minutes`
- `raw_payload_json`
- unique key: (`zoom_meeting_id`, `email`, `join_time`)

### `zoom_webhook_events`

- `id` (PK)
- `company_id` (nullable)
- `event_type`
- `zoom_event_id` or dedupe hash
- `event_ts`
- `payload_json`
- `processing_status` (`pending|processed|failed`)
- `error_message` (nullable)
- `created_at`

## Zoom API Usage

### Create meeting

- Zoom: `POST /users/{userId}/meetings`
- Triggered by LMS flow:
    - `POST /live-integration/sessions/:sessionId/meeting` with `provider=zoom`
- Effects:
    - write `zoom_meetings`
    - update session/group join URL via LMS live-integration service

### Update meeting

- Zoom: `PATCH /meetings/{meetingId}`
- Triggered by LMS flow:
    - `PATCH /course-sessions/:id` when `startsAt|endsAt|title` changes
- Effects:
    - sync schedule and metadata

### Delete meeting

- Zoom: `DELETE /meetings/{meetingId}`
- Triggered by LMS flow:
    - session cancellation or explicit delete action
- Effects:
    - mark `zoom_meetings.meeting_status = deleted`
    - disable join URL in LMS UI

### Sync recordings

- Zoom: `GET /meetings/{meetingId}/recordings`
- Triggered by webhook `recording.completed` and periodic backfill job
- Effects:
    - upsert `zoom_recordings`
    - map to LMS session recording archive (`course_sessions.recordingUrl` and materials)

### Import attendance

- Zoom: `GET /past_meetings/{meetingUUID}/participants`
- Triggered by webhook `meeting.ended` and fallback scheduler
- Effects:
    - aggregate participant duration
    - map participants to enrolled students
    - call `POST /attendance/sessions/:sessionId/bulk`

## Webhook Handlers

### Endpoint

- `POST /integrations/zoom/webhooks`

### Validation

1. Verify Zoom signature + timestamp window.
2. Parse and persist raw event in `zoom_webhook_events`.
3. Dedupe by event id/hash (idempotent processing).
4. Enqueue async processing job.

### Event routing

- `meeting.created`
    - ensure local meeting mapping exists.
- `meeting.updated`
    - sync local meeting metadata.
- `meeting.deleted`
    - mark meeting deleted and disable joins.
- `meeting.started`
    - optionally mark session as live in LMS.
- `meeting.ended`
    - enqueue attendance import.
- `recording.completed`
    - enqueue recording sync.
- `recording.deleted`
    - soft-remove recordings from LMS archive.

## Attendance Reconciliation Rules

Given an LMS session (`startsAt`, `endsAt`) and Zoom participants list:

1. Identify student by priority:

- Zoom email -> LMS user email
- Zoom user id -> stored mapping
- fallback by normalized display name (low confidence)

2. Compute effective duration:

- sum multiple join/leave intervals per participant

3. Determine status:

- `present`: duration >= configurable threshold (e.g. 70% of session)
- `late`: first join after configurable grace period
- `absent`: no qualified attendance
- `excused`: only if external LMS rule applies (not from Zoom alone)

4. Submit to LMS attendance endpoint:

- `POST /attendance/sessions/:sessionId/bulk`

## Meeting Lifecycle

1. Instructor creates LMS session (`POST /course-sessions`).
2. Instructor attaches Zoom meeting (`POST /live-integration/sessions/:sessionId/meeting`).
3. Students join through LMS join button.
4. Zoom emits webhooks during/after class.
5. On class end, worker imports participants and writes attendance.
6. On recording completion, worker syncs recording links.
7. Instructor sees updated attendance and recordings in LMS.

## Reliability and Operations

### Queue jobs

- `zoom.webhook.process`
- `zoom.attendance.sync`
- `zoom.recording.sync`
- `zoom.backfill.daily`

### Retry policy

- exponential backoff
- max attempts + dead-letter queue

### Observability

- structured logs with correlation id (`sessionId`, `zoomMeetingId`)
- metrics:
    - webhook latency
    - sync success/failure rate
    - attendance import freshness
    - recording availability lag

## Security

1. Encrypt tokens at rest.
2. Rotate encryption keys using KMS.
3. Restrict who can view `start_url`.
4. Validate webhook signatures strictly.
5. Limit scopes to required Zoom permissions.

## Minimal Backend Interfaces

### Internal service contracts

- `ZoomMeetingService.createForSession(sessionId, options)`
- `ZoomMeetingService.updateForSession(sessionId, patch)`
- `ZoomMeetingService.deleteForSession(sessionId)`
- `ZoomAttendanceService.syncSessionAttendance(sessionId)`
- `ZoomRecordingService.syncSessionRecordings(sessionId)`

### Admin/ops endpoints (optional)

- `POST /integrations/zoom/:sessionId/sync-attendance`
- `POST /integrations/zoom/:sessionId/sync-recordings`
- `GET /integrations/zoom/events?status=failed`
