# LMS Enrollment / Session / Integration Release Notes

Date: 2026-03-28

## Scope

This release note summarizes the LMS changes delivered around:

- group-based delivery enrollment
- session-based attendance and homework
- CRM -> LMS enrollment lifecycle visibility
- homework submission attachments

## Delivered

### Enrollment and groups

- Delivery-course (`offline`, `online_live`) manual enrollment is now group-based in LMS dashboards.
- Instructor dashboard now has a dedicated `Groups` surface for group lifecycle and group enrollment.
- Admin dashboard delivery enrollment now requires a selected group.
- Group code generation is now system-assisted and editable at creation time.

### Attendance

- Dashboard attendance moved from legacy course/date flow to course -> group -> session flow.
- Session workspace attendance no longer falls back to legacy date-based writes.
- Save actions now stay disabled when there is no real change.
- Admin attendance UI is read-first and requires explicit edit mode before modification.

### Homework

- Session homework now uses the selected group roster instead of course-wide student lists.
- Homework publish behavior is consistent on create/edit.
- Student tasks now trust `/student/homework` as the source of truth.
- Students can submit homework with text, link, and uploaded files.
- Instructors can review attachment metadata and open submitted files from session homework review.

### CRM / LMS integration

- CRM -> LMS enrollment request/activate lifecycle is documented and hardened around idempotency.
- LMS integration dashboard now shows pending CRM enrollment events, failed dispatches, quick filters, and event detail payloads.
- Dashboard event detail supports copying LMS enrollment ID, LMS student ID, and CRM lead ID.

## Backend alignment completed

- `GET /course-groups/:groupId/students`
- session attendance validation against session group membership
- session homework assignment/submission validation
- homework attachment upload endpoint
- CRM integration idempotency hardening

## Remaining follow-up

- end-to-end CRM frontend -> CRM backend -> LMS backend -> LMS frontend smoke testing
- automated tests for enrollment, attendance, homework, and integration flows
- `video` self-serve payment/enrollment flow
- live meeting provider restoration hardening
