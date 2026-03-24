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
            className={`rounded-2xl shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 ${resolvedOpen ? 'w-64 p-6' : 'w-20 p-4'
                } ${className}`}
        >
            <button
                onClick={handleToggle}
                className="w-full flex items-center justify-between text-sm font-semibold text-gray-500 dark:text-gray-400"
                type="button"
            >
                <span>{resolvedOpen ? toggleLabels.collapse : toggleLabels.expand}</span>
                <span className="text-lg">{resolvedOpen ? '‹' : '›'}</span>
            </button>
            <nav className="mt-6 space-y-1">
                {(() => {
                    const groupedItems = items.reduce((groups, item) => {
                        const category = item.category || 'other';
                        if (!groups[category]) groups[category] = [];
                        groups[category].push(item);
                        groups[category].sort((a, b) => (a.priority || 0) - (b.priority || 0));
                        return groups;
                    }, {});

                    const categoryOrder = ['primary', 'secondary', 'progress', 'personal', 'content', 'users', 'admin', 'other'];
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
                            <div key={category} className="mb-4">
                                {resolvedOpen && (
                                    <div className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                        {categoryLabels[category] || category}
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
                                                    } px-3 py-2 rounded-xl transition-all duration-200 ${isActive
                                                        ? 'bg-edubot-orange text-white shadow-lg'
                                                        : category === 'primary'
                                                            ? 'text-edubot-dark dark:text-edubot-soft hover:bg-edubot-orange/10 dark:hover:bg-edubot-orange/20 hover:shadow-md'
                                                            : category === 'secondary'
                                                                ? 'text-edubot-green dark:text-edubot-teal hover:bg-edubot-green/10 dark:hover:bg-edubot-green/20 hover:shadow-md'
                                                                : category === 'progress'
                                                                    ? 'text-edubot-teal dark:text-edubot-soft hover:bg-edubot-teal/10 dark:hover:bg-edubot-teal/20 hover:shadow-md'
                                                                    : category === 'personal'
                                                                        ? 'text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/20 hover:shadow-md'
                                                                        : category === 'content'
                                                                            ? 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/20 hover:shadow-md'
                                                                            : category === 'users'
                                                                                ? 'text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 hover:shadow-md'
                                                                                : category === 'analytics'
                                                                                    ? 'text-edubot-teal dark:text-edubot-green hover:bg-edubot-teal/10 dark:hover:bg-edubot-teal/20 hover:shadow-md'
                                                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md'
                                                    }`}
                                            >
                                                {Icon && (
                                                    <Icon
                                                        className={`text-lg ${resolvedOpen ? 'mr-3' : ''} ${isActive ? 'text-white' : category === 'primary'
                                                            ? 'text-edubot-orange dark:text-edubot-soft'
                                                            : category === 'secondary'
                                                                ? 'text-edubot-green dark:text-edubot-teal'
                                                                : category === 'progress'
                                                                    ? 'text-edubot-teal dark:text-edubot-soft'
                                                                    : category === 'personal'
                                                                        ? 'text-purple-600 dark:text-purple-400'
                                                                        : category === 'content'
                                                                            ? 'text-indigo-600 dark:text-indigo-400'
                                                                            : category === 'users'
                                                                                ? 'text-blue-600 dark:text-blue-400'
                                                                                : category === 'analytics'
                                                                                    ? 'text-edubot-teal dark:text-edubot-green'
                                                                                    : 'text-gray-500 dark:text-gray-400'
                                                            }`}
                                                    />
                                                )}
                                                {resolvedOpen && <span className="font-medium text-sm">{item.label}</span>}
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