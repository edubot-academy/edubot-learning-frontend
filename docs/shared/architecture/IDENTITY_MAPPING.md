# Identity Mapping Strategy

## Purpose

CRM and LMS use separate databases. This document defines how one real student/person is mapped across both systems.

---

## Problem

The same person may exist as:
- a lead/contact in CRM
- a student in LMS
- a participant in one or more enrollments in LMS

Without mapping, duplicates and broken integrations will appear.

---

## Recommended keys

### CRM-side identifiers
- `crmLeadId`
- `crmDealId`
- `crmPaymentId`

### LMS-side identifiers
- `lmsStudentId`
- `lmsEnrollmentId`

### Optional cross-system identifier
- `externalStudentId`

---

## Recommended mapping model

### In LMS student entity
Store:
- `crmLeadId` nullable
- `externalStudentId` nullable

### In CRM mapping table
Recommended table: `student_system_mappings`

Fields:
- `id`
- `companyId`
- `crmLeadId`
- `lmsStudentId`
- `lmsEnrollmentId` nullable
- `lastSyncedAt` nullable
- `createdAt`
- `updatedAt`

---

## Matching logic during enrollment request

When CRM sends enrollment request to LMS:

### LMS should attempt matching in this order
1. by existing `crmLeadId`
2. by exact email if available
3. by normalized phone number
4. create new LMS student if no safe match is found

---

## Normalization rules

### Phone
Normalize before comparing:
- trim spaces
- remove formatting characters when appropriate
- convert to stable international format where possible

### Email
Normalize before comparing:
- trim spaces
- lowercase

---

## Important safety rule

Never merge students only by name.

Name may be used as a supporting indicator, not as a primary matching key.

---

## Multiple enrollments

One CRM contact may have:
- one LMS student
- multiple LMS enrollments

This means `crmLeadId` to `lmsStudentId` is usually **one-to-one**, while `lmsStudentId` to `lmsEnrollmentId` is **one-to-many**.

---

## Update behavior

After successful enrollment request:
- LMS returns `lmsStudentId`
- LMS returns `lmsEnrollmentId`
- CRM stores or updates mapping record

---

## Duplicate prevention recommendations

### CRM
- prevent duplicate leads by phone/email
- allow controlled merge flow if needed

### LMS
- prevent duplicate student creation during enrollment request
- log match reason for auditability

---

## Audit recommendation

Store how mapping occurred:
- `matchedBy = crmLeadId | email | phone | created_new`
- `matchedAt`
- `matchedBySystem = lms`
