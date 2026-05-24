// Assistant Dashboard Feature Module
// This barrel export file provides clean imports for the assistant dashboard feature

export { default as AssistantDashboard } from "./pages/AssistantDashboard";
export { default as AssistantCourseStats } from "./components/AssistantCourseStats";
export { default as AssistantStudentTable } from "./components/AssistantStudentTable";
export { default as AssistantPagination } from "./components/AssistantPagination";
export { useAssistantDashboardData } from "./hooks/useAssistantDashboardData.jsx";
export { useAssistantWorkspaceData } from "./hooks/useAssistantWorkspaceData.js";
export * from "./utils/assistantDashboard.helpers";
