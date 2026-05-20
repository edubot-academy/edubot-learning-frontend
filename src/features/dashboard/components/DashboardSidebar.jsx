import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

const DashboardSidebar = ({
    items,
    activeId,
    onSelect,
    isOpen,
    onToggle,
    defaultOpen = true,
    className = '',
    toggleLabels,
}) => {
    const { t } = useTranslation();
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const resolvedOpen = typeof isOpen === 'boolean' ? isOpen : internalOpen;
    const resolvedToggleLabels = {
        collapse: toggleLabels?.collapse || t('dashboardSidebar.collapse'),
        expand: toggleLabels?.expand || t('dashboardSidebar.expand'),
    };

    const handleToggle = () => {
        if (onToggle) {
            onToggle(!resolvedOpen);
        } else {
            setInternalOpen((prev) => !prev);
        }
    };

    return (
        <aside
            className={`flex max-h-[calc(100vh-2rem)] max-w-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-edubot-soft transition-[width,padding] duration-300 dark:border-gray-700 dark:bg-gray-800 ${resolvedOpen ? 'w-64 p-5' : 'w-20 p-4'
                } ${className}`}
            aria-label={t('dashboardSidebar.navigationMenu')}
        >
            <div className={`mb-4 flex ${resolvedOpen ? 'justify-end' : 'justify-center'}`}>
                <button
                    type="button"
                    onClick={handleToggle}
                    className="inline-flex h-9 min-w-9 items-center justify-center rounded-xl border border-gray-200 bg-white px-2 text-sm font-semibold text-gray-600 transition hover:border-edubot-orange hover:text-edubot-orange focus:outline-none focus:ring-2 focus:ring-edubot-orange/40 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                    aria-label={resolvedOpen ? resolvedToggleLabels.collapse : resolvedToggleLabels.expand}
                    aria-expanded={resolvedOpen}
                >
                    {resolvedOpen ? '‹' : '›'}
                </button>
            </div>

            <nav
                className="space-y-1 overflow-y-auto pr-1"
                id="dashboard-nav-menu"
                aria-label={t('dashboardSidebar.sections')}
                data-dashboard-navigation
                tabIndex={-1}
            >
                {(() => {
                    const groupedItems = items.reduce((groups, item) => {
                        const category = item.category || 'other';
                        if (!groups[category]) groups[category] = [];
                        groups[category].push(item);
                        groups[category].sort((a, b) => (a.priority || 0) - (b.priority || 0));
                        return groups;
                    }, {});

                    const categoryOrder = ['primary', 'secondary', 'analytics', 'progress', 'personal', 'content', 'users', 'admin', 'other'];
                    const categoryLabels = {
                        primary: t('dashboardSidebar.categories.primary'),
                        secondary: t('dashboardSidebar.categories.secondary'),
                        progress: t('dashboardSidebar.categories.progress'),
                        personal: t('dashboardSidebar.categories.personal'),
                        content: t('dashboardSidebar.categories.content'),
                        users: t('dashboardSidebar.categories.users'),
                        analytics: t('dashboardSidebar.categories.analytics'),
                        admin: t('dashboardSidebar.categories.admin'),
                        other: t('dashboardSidebar.categories.other'),
                    };

                    return categoryOrder.map((category) => {
                        const categoryItems = groupedItems[category];
                        if (!categoryItems || categoryItems.length === 0) return null;

                        return (
                            <div key={category} className="mb-4">
                                {resolvedOpen && (
                                    <div className="mb-2 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-300" role="presentation">
                                        <span aria-hidden="true">
                                            {categoryLabels[category] || category}
                                        </span>
                                    </div>
                                )}
                                <div className="space-y-1">
                                    {categoryItems.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = activeId === item.id;
                                        return (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => onSelect(item.id)}
                                                title={item.label}
                                                data-dashboard-nav-item
                                                className={`w-full flex items-center ${resolvedOpen ? 'justify-start' : 'justify-center'
                                                    } rounded-xl px-3 py-2 text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-edubot-orange/40 ${isActive
                                                        ? 'bg-edubot-orange text-white shadow-sm'
                                                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
                                                    }`}
                                                aria-label={item.label}
                                                aria-current={isActive ? 'page' : undefined}
                                            >
                                                {Icon && (
                                                    <Icon
                                                        className={`text-lg ${resolvedOpen ? 'mr-3' : ''} ${isActive ? 'text-white' : 'text-edubot-orange dark:text-edubot-soft'}`}
                                                        aria-hidden="true"
                                                    />
                                                )}
                                                {resolvedOpen && (
                                                    <span className={`min-w-0 whitespace-normal break-words text-left text-sm font-medium leading-tight transition-all duration-300 ${isActive ? 'text-white' : ''} dark:text-gray-200`}>
                                                        {item.label}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    });
                })()}
            </nav>
        </aside>
    );
};

DashboardSidebar.propTypes = {
    items: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
            icon: PropTypes.elementType,
            category: PropTypes.oneOf(['primary', 'secondary', 'progress', 'personal', 'content', 'users', 'analytics', 'admin', 'other']),
            workspaceGroup: PropTypes.string,
            priority: PropTypes.number,
        })
    ).isRequired,
    activeId: PropTypes.string.isRequired,
    onSelect: PropTypes.func.isRequired,
    isOpen: PropTypes.bool,
    onToggle: PropTypes.func,
    defaultOpen: PropTypes.bool,
    className: PropTypes.string,
    toggleLabels: PropTypes.shape({
        collapse: PropTypes.string,
        expand: PropTypes.string,
    }),
};

export default DashboardSidebar;
