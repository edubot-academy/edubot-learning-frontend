# EduBot Shared Integration Docs

This folder contains the shared documentation needed to keep **EduBot CRM** and **EduBot Learning (LMS)** aligned while they continue to exist as separate working projects.

## Folder structure

- `architecture/`
  - `SYSTEM_ARCHITECTURE.md`
  - `DOMAIN_OWNERSHIP.md`
  - `BUSINESS_FLOW.md`
  - `IDENTITY_MAPPING.md`
- `contracts/`
  - `ENUMS.md`
  - `CRM_LMS_API_CONTRACT.md`
  - `WEBHOOK_EVENTS.md`
  - `ACCESS_ACTIVATION_RULES.md`
- `prompts/`
  - `SHARED_ARCHITECTURE_PROMPT.md`
  - `CRM_FRONTEND_PROMPT.md`
  - `CRM_BACKEND_PROMPT.md`
  - `LMS_FRONTEND_PROMPT.md`
  - `LMS_BACKEND_PROMPT.md`

## How to use

1. Add these docs to both repositories under `/docs/shared` or create a separate shared repo.
2. Treat `contracts/` as the source of truth for integration behavior.
3. Treat `architecture/` as the source of truth for ownership and business flow.
4. Use `prompts/` when working with Lovable or other AI-assisted generation tools.
5. Update these docs whenever statuses, API payloads, or ownership rules change.
