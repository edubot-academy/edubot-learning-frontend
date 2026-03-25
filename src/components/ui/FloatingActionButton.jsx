import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiBook, FiUsers, FiMessageSquare, FiX, FiChevronUp } from 'react-icons/fi';

const FloatingActionButton = ({
    actions = [],
    position = 'bottom-right',
    className = "",
    role = 'instructor' // instructor, student, admin, assistant
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const fabRef = useRef(null);
    const navigate = useNavigate();

    // Default actions based on role with real navigation
    const defaultActions = {
        instructor: [
            {
                id: 'create-course',
                label: 'Жаңы курс',
                icon: '📚',
                color: 'bg-blue-500 hover:bg-blue-600',
                onClick: () => navigate('/instructor/course/create')
            },
            {
                id: 'add-student',
                label: 'Студент кошуу',
                icon: '👤',
                color: 'bg-green-500 hover:bg-green-600',
                onClick: () => navigate('/instructor/students')
            },
            {
                id: 'create-session',
                label: 'Live сессия',
                icon: '🎥',
                color: 'bg-purple-500 hover:bg-purple-600',
                onClick: () => navigate('/instructor/sessions')
            }
        ],
        student: [
            {
                id: 'join-course',
                label: 'Курска кошулуу',
                icon: '🎓',
                color: 'bg-blue-500 hover:bg-blue-600',
                onClick: () => navigate('/courses')
            },
            {
                id: 'ask-question',
                label: 'Суроо берүү',
                icon: '❓',
                color: 'bg-green-500 hover:bg-green-600',
                onClick: () => navigate('/student/support')
            }
        ],
        admin: [
            {
                id: 'add-user',
                label: 'Колдонуучу кошуу',
                icon: '👥',
                color: 'bg-blue-500 hover:bg-blue-600',
                onClick: () => navigate('/admin')
            },
            {
                id: 'create-company',
                label: 'Компания түзүү',
                icon: '🏢',
                color: 'bg-purple-500 hover:bg-purple-600',
                onClick: () => navigate('/admin/companies/create')
            }
        ],
        assistant: [
            {
                id: 'view-analytics',
                label: 'Аналитика',
                icon: '📊',
                color: 'bg-blue-500 hover:bg-blue-600',
                onClick: () => navigate('/assistant')
            }
        ]
    };

    const roleActions = actions.length > 0 ? actions : defaultActions[role] || [];

    // Close FAB when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (fabRef.current && !fabRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const positionClasses = {
        'bottom-right': 'bottom-6 right-6',
        'bottom-left': 'bottom-6 left-6',
        'top-right': 'top-6 right-6',
        'top-left': 'top-6 left-6'
    };

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    const handleActionClick = (action) => {
        action.onClick();
        setIsOpen(false);
    };

    return (
        <div
            ref={fabRef}
            className={`fixed ${positionClasses[position]} z-50 ${className}`}
            role="region"
            aria-label="Quick actions menu"
        >
            {/* Action Items */}
            <div className={`relative ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'} transition-all duration-300`}>
                <div
                    className="absolute bottom-16 right-0 space-y-3"
                    role="menu"
                    aria-label="Quick actions"
                    aria-orientation="vertical"
                >
                    {roleActions.map((action, index) => (
                        <div
                            key={action.id}
                            className={`flex items-center gap-3 transition-all duration-300 ${isOpen
                                ? 'opacity-100 translate-y-0'
                                : 'opacity-0 translate-y-2'
                                }`}
                            style={{
                                transitionDelay: isOpen ? `${index * 50}ms` : '0ms'
                            }}
                        >
                            {/* Action Label */}
                            <div
                                className={`bg-gray-800 dark:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                                    } transition-all duration-200`}
                                role="tooltip"
                                aria-hidden="true"
                            >
                                {action.label}
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={() => handleActionClick(action)}
                                className={`w-12 h-12 ${action.color} text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center text-lg`}
                                title={action.label}
                                aria-label={action.label}
                                role="menuitem"
                                tabIndex={isOpen ? 0 : -1}
                            >
                                {action.icon}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main FAB Button */}
            <button
                onClick={handleToggle}
                className={`w-14 h-14 bg-edubot-orange hover:bg-edubot-soft text-white rounded-full shadow-lg hover:shadow-xl transform transition-all duration-300 flex items-center justify-center ${isOpen ? 'rotate-45 scale-110' : 'rotate-0 scale-100 hover:scale-110'
                    }`}
                title="Тез аракеттер"
                aria-label="Тез аракеттер менюсун ач/жаб"
                aria-expanded={isOpen}
                aria-controls="fab-actions-menu"
            >
                <FiPlus className="h-6 w-6" />
            </button>

            {/* Backdrop for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                    aria-hidden="true"
                />
            )}
        </div>
    );
};

export default FloatingActionButton;
