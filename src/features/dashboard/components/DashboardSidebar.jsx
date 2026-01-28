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
            className={`rounded-2xl shadow-xl transition-all duration-300 bg-white dark:bg-black ${
                resolvedOpen ? 'w-64 p-6' : 'w-20 p-4'
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
            <nav className="mt-6 space-y-2">
                {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeId === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onSelect(item.id)}
                            className={`w-full flex items-center ${
                                resolvedOpen ? 'justify-start' : 'justify-center'
                            } px-3 py-2 rounded-xl transition ${
                                isActive
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                            {Icon && (
                                <Icon
                                    className={`text-lg ${resolvedOpen ? 'mr-3' : ''} ${
                                        isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                                    }`}
                                />
                            )}
                            {resolvedOpen && <span className="font-medium">{item.label}</span>}
                        </button>
                    );
                })}
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