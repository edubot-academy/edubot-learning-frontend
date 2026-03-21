# EduBot Shared Integration Docs

This folder contains the shared documentation needed to keep **EduBot CRM** and **EduBot Learning (LMS)** aligned while they continue to exist as separate working projects.

## Folder structure

- `architecture/`
    - `SYSTEM_ARCHITECTURE.md`
    - `DOMAIN_OWNERSHIP.md`
    - `BUSINESS_FLOW.md`
    - `IDENTITY_MAPPING.md`
    - `ZOOM_INTEGRATION_ARCHITECTURE.md`
- `contracts/`
    - `ENUMS.md`
    - `CRM_LMS_API_CONTRACT.md`
    - `WEBHOOK_EVENTS.md`
    - `ACCESS_ACTIVATION_RULES.md`
    - `LMS_FRONTEND_ENDPOINTS_HANDOFF.md`
    - `LEADERBOARD_SKILLS_SHARE_CONTRACT.md`
- `prompts/`
    - `SHARED_ARCHITECTURE_PROMPT.md`
    - `LMS_FRONTEND_PROMPT.md`
    - `LMS_BACKEND_PROMPT.md`
- `releases/`
    - `LEADERBOARD_V2_RELEASE_NOTES.md`
- `NEW_FEATURES_USER_GUIDE_KY.md`
    - Kyrgyz end-user guide for new CRM integration features (admin/instructor/student)
- `LMS_FRONTEND_QA_CHECKLIST_KY.md`
    - Kyrgyz QA checklist for LMS frontend (integration, attendance, homework, role flows)

## How to use

1. Add these docs to both repositories under `/docs/shared` or create a separate shared repo.
2. Treat `contracts/` as the source of truth for integration behavior.
3. Treat `architecture/` as the source of truth for ownership and business flow.
4. Use `prompts/` when working with Lovable or other AI-assisted generation tools.
5. Update these docs whenever statuses, API payloads, or ownership rules change.
