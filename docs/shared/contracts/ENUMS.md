# Shared Enums Contract

These enums must stay aligned between CRM and LMS wherever they are shared through integration.

## PaymentStatus

```ts
export enum PaymentStatus {
  SUBMITTED = 'submitted',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  OVERDUE = 'overdue',
}
```

## EnrollmentStatus

```ts
export enum EnrollmentStatus {
  PENDING_ACTIVATION = 'pending_activation',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}
```

## RiskIssueType

```ts
export enum RiskIssueType {
  LOW_ATTENDANCE = 'low_attendance',
  INACTIVE_STUDENT = 'inactive_student',
  LOW_HOMEWORK_COMPLETION = 'low_homework_completion',
  LOW_QUIZ_PARTICIPATION = 'low_quiz_participation',
  PAYMENT_RISK = 'payment_risk',
}
```

## RiskSeverity

```ts
export enum RiskSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}
```

## SourceSystem

```ts
export enum SourceSystem {
  CRM = 'crm',
  LMS = 'lms',
}
```

## LeadSource

```ts
export enum LeadSource {
  INSTAGRAM = 'instagram',
  TELEGRAM = 'telegram',
  WHATSAPP = 'whatsapp',
  WEBSITE = 'website',
  PHONE_CALL = 'phone_call',
  REFERRAL = 'referral',
}
```

## LeadStatus

```ts
export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  INTERESTED = 'interested',
  TRIAL_SCHEDULED = 'trial_scheduled',
  TRIAL_COMPLETED = 'trial_completed',
  OFFER_SENT = 'offer_sent',
  NEGOTIATION = 'negotiation',
  PAYMENT_PENDING = 'payment_pending',
  WON = 'won',
  LOST = 'lost',
}
```

## DealStage

```ts
export enum DealStage {
  NEW_LEAD = 'new_lead',
  CONTACTED = 'contacted',
  TRIAL_BOOKED = 'trial_booked',
  TRIAL_COMPLETED = 'trial_completed',
  OFFER_SENT = 'offer_sent',
  NEGOTIATION = 'negotiation',
  PAYMENT_PENDING = 'payment_pending',
  WON = 'won',
  LOST = 'lost',
}
```

## RetentionCaseStatus

```ts
export enum RetentionCaseStatus {
  OPEN = 'open',
  CONTACTED = 'contacted',
  MONITORING = 'monitoring',
  RESOLVED = 'resolved',
  ESCALATED = 'escalated',
}
```
