// Admin Panel Feature Module
// This barrel export file provides clean imports for the admin panel feature

export { default as AdminPanel } from "./pages/AdminPanel";

// Components
export { default as AdminStatsTab } from "./components/AdminStatsTab";
export { default as AdminUsersTab } from "./components/AdminUsersTab";
export { default as AdminCoursesTab } from "./components/AdminCoursesTab";

// Stats Components
export { default as MetricCard } from "./stats/MetricCard";
export { default as GrowthBadge } from "./stats/GrowthBadge";
export { default as TrendCard } from "./stats/TrendCard";
export { default as Sparkline } from "./stats/Sparkline";
export { default as TopCoursesTable } from "./stats/TopCoursesTable";

// Hooks
export { useAdminTabState } from "./hooks/useAdminTabState";
export { useAdminUsersFilters } from "./hooks/useAdminUsersFilters";

// Utils
export * from "./utils/adminPanel.constants";
export * from "./utils/adminPanel.helpers";
