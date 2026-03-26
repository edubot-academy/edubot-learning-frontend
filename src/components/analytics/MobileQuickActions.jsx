import PropTypes from 'prop-types';
import { useState } from 'react';

/**
 * MobileQuickActions - Floating action buttons for mobile users
 * Provides quick access to common actions on mobile devices
 */
const MobileQuickActions = ({
    onRefresh,
    onExport,
    onShare,
    onFilter,
    loading = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const actions = [
        {
            id: 'refresh',
            label: 'Жаңылоо',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
            ),
            onClick: onRefresh,
            color: 'bg-blue-500 hover:bg-blue-600',
            disabled: loading,
        },
        {
            id: 'filter',
            label: 'Фильтр',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V19a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
            ),
            onClick: onFilter,
            color: 'bg-purple-500 hover:bg-purple-600',
        },
        {
            id: 'export',
            label: 'Экспорт',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            onClick: onExport,
            color: 'bg-green-500 hover:bg-green-600',
        },
        {
            id: 'share',
            label: 'Бөлүшүү',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
            ),
            onClick: onShare,
            color: 'bg-edubot-orange hover:bg-edubot-orange/90',
        },
    ];

    const toggleMenu = () => setIsOpen(!isOpen);

    const handleActionClick = (action) => {
        if (action.onClick && !action.disabled) {
            action.onClick();
            setIsOpen(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 sm:hidden">
            {/* Main FAB */}
            <button
                onClick={toggleMenu}
                className={`w-14 h-14 rounded-full bg-edubot-orange text-white shadow-lg transition-all duration-300 transform hover:scale-110 active:scale-95 touch-manipulation ${isOpen ? 'rotate-45' : ''}`}
                aria-label="Quick actions"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            </button>

            {/* Action Buttons */}
            <div className={`absolute bottom-16 right-0 space-y-3 transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                {actions.map((action, index) => (
                    <div
                        key={action.id}
                        className={`flex items-center justify-end transition-all duration-300 ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}`}
                        style={{ transitionDelay: `${index * 50}ms` }}
                    >
                        <span className="mr-3 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg whitespace-nowrap">
                            {action.label}
                        </span>
                        <button
                            onClick={() => handleActionClick(action)}
                            disabled={action.disabled}
                            className={`w-12 h-12 rounded-full text-white shadow-md transition-all duration-200 transform hover:scale-110 active:scale-95 touch-manipulation ${action.color} ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            aria-label={action.label}
                        >
                            {action.icon}
                        </button>
                    </div>
                ))}
            </div>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 sm:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
};

MobileQuickActions.propTypes = {
    onRefresh: PropTypes.func,
    onExport: PropTypes.func,
    onShare: PropTypes.func,
    onFilter: PropTypes.func,
    loading: PropTypes.bool,
};

export default MobileQuickActions;
