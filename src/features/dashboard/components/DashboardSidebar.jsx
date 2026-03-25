import { useState } from 'react';
import PropTypes from 'prop-types';

const DashboardSidebar = ({
    items,
    activeId,
    onSelect,
    isOpen,
    onToggle,
    defaultOpen = true,
    className = '',
    toggleLabels = { collapse: 'Менюну жыйуу', expand: 'Меню' },
}) => {
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const resolvedOpen = typeof isOpen === 'boolean' ? isOpen : internalOpen;

    const handleToggle = () => {
        if (onToggle) {
            onToggle(!resolvedOpen);
        } else {
            setInternalOpen((prev) => !prev);
        }
    };

    return (
        <aside
            className={`rounded-2xl shadow-xl transition-all duration-500 ease-in-out bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-2xl transform hover:scale-[1.02] ${resolvedOpen ? 'w-64 p-6' : 'w-20 p-4'
                } ${className}`}
            role="navigation"
            aria-label="Dashboard navigation menu"
        >
            <button
                onClick={handleToggle}
                className="w-full flex items-center justify-between text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-edubot-orange dark:hover:text-edubot-soft transition-all duration-200 group"
                type="button"
                aria-label={resolvedOpen ? toggleLabels.collapse : toggleLabels.expand}
                aria-expanded={resolvedOpen}
                aria-controls="dashboard-nav-menu"
            >
                <span className={`transition-all duration-300 ${resolvedOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>
                    {resolvedOpen ? toggleLabels.collapse : toggleLabels.expand}
                </span>
                <span className="text-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-180">
                    {resolvedOpen ? '‹' : '›'}
                </span>
            </button>
            <nav className="mt-6 space-y-1" id="dashboard-nav-menu" role="menubar" aria-orientation="vertical">
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
                        primary: 'Негизги функциялар',
                        secondary: 'Окутуу башкаруу',
                        progress: 'Окутуу прогресси',
                        personal: 'Жеке башкаруу',
                        content: 'Мазмун башкаруу',
                        users: 'Колдонуучулар башкаруу',
                        analytics: 'Аналитика жана статистика',
                        admin: 'Система башкаруу',
                        other: 'Башкалар'
                    };

                    return categoryOrder.map((category) => {
                        const categoryItems = groupedItems[category];
                        if (!categoryItems || categoryItems.length === 0) return null;

                        return (
                            <div key={category} className="mb-4 animate-fade-in">
                                {resolvedOpen && (
                                    <div className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider mb-2 transition-all duration-300 hover:text-gray-700 dark:hover:text-gray-200" role="presentation">
                                        <span className="inline-block transition-transform duration-300 hover:scale-105" aria-hidden="true">
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
                                                onClick={() => onSelect(item.id)}
                                                className={`w-full flex items-center ${resolvedOpen ? 'justify-start' : 'justify-center'
                                                    } px-3 py-2 rounded-xl transition-all duration-300 ease-out transform hover:scale-105 hover:-translate-y-0.5 ${isActive
                                                        ? 'bg-edubot-orange text-white shadow-lg scale-105 ring-2 ring-edubot-orange/50'
                                                        : category === 'primary'
                                                            ? 'text-edubot-dark dark:text-edubot-soft hover:bg-edubot-orange/10 dark:hover:bg-edubot-orange/20 hover:shadow-md hover:ring-2 hover:ring-edubot-orange/20'
                                                            : category === 'secondary'
                                                                ? 'text-edubot-green dark:text-edubot-teal hover:bg-edubot-green/10 dark:hover:bg-edubot-green/20 hover:shadow-md hover:ring-2 hover:ring-edubot-green/20'
                                                                : category === 'progress'
                                                                    ? 'text-edubot-teal dark:text-edubot-soft hover:bg-edubot-teal/10 dark:hover:bg-edubot-teal/20 hover:shadow-md hover:ring-2 hover:ring-edubot-teal/20'
                                                                    : category === 'personal'
                                                                        ? 'text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/20 hover:shadow-md hover:ring-2 hover:ring-purple-200/50'
                                                                        : category === 'content'
                                                                            ? 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/20 hover:shadow-md hover:ring-2 hover:ring-indigo-200/50'
                                                                            : category === 'users'
                                                                                ? 'text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 hover:shadow-md hover:ring-2 hover:ring-blue-200/50'
                                                                                : category === 'analytics'
                                                                                    ? 'text-edubot-teal dark:text-edubot-green hover:bg-edubot-teal/10 dark:hover:bg-edubot-teal/20 hover:shadow-md hover:ring-2 hover:ring-edubot-teal/20'
                                                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md hover:ring-2 hover:ring-gray-200/50'
                                                    }`}
                                                role="menuitem"
                                                aria-label={item.label}
                                                aria-current={isActive ? 'page' : undefined}
                                            >
                                                {Icon && (
                                                    <Icon
                                                        className={`text-lg transition-all duration-300 ${resolvedOpen ? 'mr-3' : ''} ${isActive ? 'text-white scale-110' : category === 'primary'
                                                            ? 'text-edubot-orange dark:text-edubot-soft group-hover:scale-110 group-hover:rotate-12'
                                                            : category === 'secondary'
                                                                ? 'text-edubot-green dark:text-edubot-teal group-hover:scale-110 group-hover:rotate-12'
                                                                : category === 'progress'
                                                                    ? 'text-edubot-teal dark:text-edubot-soft group-hover:scale-110 group-hover:rotate-12'
                                                                    : category === 'personal'
                                                                        ? 'text-purple-600 dark:text-purple-300 group-hover:scale-110 group-hover:rotate-12'
                                                                        : category === 'content'
                                                                            ? 'text-indigo-600 dark:text-indigo-300 group-hover:scale-110 group-hover:rotate-12'
                                                                            : category === 'users'
                                                                                ? 'text-blue-600 dark:text-blue-300 group-hover:scale-110 group-hover:rotate-12'
                                                                                : category === 'analytics'
                                                                                    ? 'text-edubot-teal dark:text-edubot-soft group-hover:scale-110 group-hover:rotate-12'
                                                                                    : 'text-gray-600 dark:text-gray-300 group-hover:scale-110 group-hover:rotate-12'
                                                            }`}
                                                    />
                                                )}
                                                {resolvedOpen && (
                                                    <span className={`font-medium text-sm transition-all duration-300 ${isActive ? 'text-white' : ''} dark:text-gray-200`}>
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