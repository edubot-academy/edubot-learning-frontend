export const getWorkspaceGroupIdForTab = (workspaceGroups, tabId) => {
    if (!workspaceGroups || !tabId) return null;

    const group = Object.values(workspaceGroups).find((item) =>
        Array.isArray(item?.tabs) && item.tabs.includes(tabId)
    );

    return group?.id || null;
};

export const applyWorkspaceGroups = (navItems, workspaceGroups) =>
    navItems.map((item) => ({
        ...item,
        workspaceGroup: getWorkspaceGroupIdForTab(workspaceGroups, item.id),
    }));
