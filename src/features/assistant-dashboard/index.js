// Assistant Dashboard Feature Module
// This barrel export file provides clean imports for the assistant dashboard feature

export { default as AssistantDashboard } from "./pages/AssistantDashboard";
export { default as AssistantCompanyState } from "./components/AssistantCompanyState";
export { default as AssistantCourseStats } from "./components/AssistantCourseStats";
export { default as AssistantStudentTable } from "./components/AssistantStudentTable";
export { default as AssistantPagination } from "./components/AssistantPagination";
export { useAssistantDashboardData } from "./hooks/useAssistantDashboardData.jsx";
export * from "./utils/assistantDashboard.helpers";
