# LMS Access Activation Rules

## Core rule

A student gets full LMS academic access only when the LMS enrollment status becomes `active`.

CRM may initiate or request enrollment, but LMS remains the final gate for academic access.

---

## Recommended access lifecycle

### 1. Payment submitted in CRM
CRM creates payment with status `submitted`.

### 2. CRM requests enrollment in LMS
LMS creates:
- student if needed
- enrollment with status `pending`
- `accessStatus = locked`

### 3. Payment confirmed in CRM
CRM updates payment status to `confirmed`.

### 4. CRM activates enrollment in LMS
LMS sets:
- `enrollmentStatus = active`
- `accessStatus = active`
- `activatedAt = now`

---

## Recommended business rule

Preferred rule:
- activate access when full payment is confirmed, or
- activate access when the first valid installment is confirmed

This rule should be decided by business policy and kept consistent.

---

## When access should remain locked

Access should remain locked when:
- payment is only submitted but not approved
- enrollment exists but activation has not happened
- enrollment is cancelled

---

## When access may be restricted later

Possible reasons:
- overdue payment
- administrative hold
- policy violation
- transfer or schedule issue

If access is restricted later:
- LMS may keep an internal hold or pause reason
- the shared CRM-facing enrollment status contract should not expose a separate public `paused` status
- CRM may receive a status update or create a follow-up task if needed

---

## Important non-rule

Do not unlock lessons only because:
- lead is won
- deal is won
- payment record exists

Only LMS enrollment activation should unlock academic access.
