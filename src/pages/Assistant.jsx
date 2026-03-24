import React from "react";
import { AssistantDashboard } from "@features/assistant-dashboard";

// This file now serves as a redirect to the refactored AssistantDashboard
// The actual implementation has been moved to:
// src/features/assistant-dashboard/pages/AssistantDashboard.jsx

const Assistant = () => {
    return <AssistantDashboard />;
};

export default Assistant;