# Dashboard Routing

Dashboard pages use a base route plus a `tab` query parameter:

- Student dashboard: `/student?tab=<tab-id>`
- Instructor dashboard: `/instructor?tab=<tab-id>`
- Admin dashboard: `/admin?tab=<tab-id>`

Tab IDs live in `src/shared/constants/dashboardTabs.js`. Role-specific dashboard nav item lists should reuse those constants instead of duplicating string literals.

Legacy page-style dashboard routes should redirect to the query-tab route and preserve existing query parameters. Current legacy redirects are:

- `/instructor/sessions` -> `/instructor?tab=sessions`
- `/instructor/analytics` -> `/instructor?tab=analytics`
- `/instructor/homework` -> `/instructor?tab=homework`
- `/student/analytics` -> `/student?tab=progress`
- `/admin/analytics` -> `/admin?tab=analytics`

When adding a dashboard tab:

1. Add the tab ID to `dashboardTabs.js`.
2. Add the nav item in the role-specific constants file.
3. Use `getDashboardPath(role, TAB_CONSTANT)` for links.
4. Add a legacy redirect only if an existing public or bookmarked URL must keep working.
