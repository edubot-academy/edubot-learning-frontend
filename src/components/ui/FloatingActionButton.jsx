import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiBook, FiUserPlus, FiVideo } from "react-icons/fi";
import PropTypes from "prop-types";

const FAB_SIZE = 56;
const ACTION_MENU_WIDTH = 200;
const ACTION_MENU_HEIGHT = 200;

const FloatingActionButton = ({
    actions = [],
    position = "bottom-right",
    className = "",
    role = "instructor",
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [hasDragged, setHasDragged] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [dragPosition, setDragPosition] = useState(null);

    const fabRef = useRef(null);
    const dragStartRef = useRef({ x: 0, y: 0 });

    const navigate = useNavigate();

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);

        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const defaultActions = useMemo(
        () => ({
            instructor: [
                {
                    id: "create-course",
                    label: "Жаңы курс",
                    icon: <FiBook className="w-5 h-5" />,
                    color: "bg-blue-500 hover:bg-blue-600",
                    onClick: () => navigate("/instructor/course/create"),
                },
                {
                    id: "add-student",
                    label: "Студент кошуу",
                    icon: <FiUserPlus className="w-5 h-5" />,
                    color: "bg-green-500 hover:bg-green-600",
                    onClick: () => navigate("/instructor/students"),
                },
                {
                    id: "create-session",
                    label: "Live сессия",
                    icon: <FiVideo className="w-5 h-5" />,
                    color: "bg-purple-500 hover:bg-purple-600",
                    onClick: () => navigate("/instructor/sessions"),
                },
            ],
            student: [
                {
                    id: "join-course",
                    label: "Курска кошулуу",
                    icon: <span className="text-lg">🎓</span>,
                    color: "bg-blue-500 hover:bg-blue-600",
                    onClick: () => navigate("/courses"),
                },
                {
                    id: "ask-question",
                    label: "Суроо берүү",
                    icon: <span className="text-lg">❓</span>,
                    color: "bg-green-500 hover:bg-green-600",
                    onClick: () => navigate("/student/support"),
                },
            ],
            admin: [
                {
                    id: "add-user",
                    label: "Колдонуучу кошуу",
                    icon: <span className="text-lg">👥</span>,
                    color: "bg-blue-500 hover:bg-blue-600",
                    onClick: () => navigate("/admin"),
                },
                {
                    id: "create-company",
                    label: "Компания түзүү",
                    icon: <span className="text-lg">🏢</span>,
                    color: "bg-purple-500 hover:bg-purple-600",
                    onClick: () => navigate("/admin/companies/create"),
                },
            ],
            assistant: [
                {
                    id: "view-analytics",
                    label: "Аналитика",
                    icon: <span className="text-lg">📊</span>,
                    color: "bg-blue-500 hover:bg-blue-600",
                    onClick: () => navigate("/assistant"),
                },
            ],
        }),
        [navigate]
    );

    const roleActions = actions.length > 0 ? actions : defaultActions[role] || [];

    useEffect(() => {
        if (!isDragging || !isMobile) return;

        const handleMove = (e) => {
            const touch = e.touches?.[0];
            if (!touch) return;

            const deltaX = Math.abs(touch.clientX - dragStartRef.current.x);
            const deltaY = Math.abs(touch.clientY - dragStartRef.current.y);

            if (deltaX > 10 || deltaY > 10) {
                setHasDragged(true);
            }

            const newX = touch.clientX - dragOffset.x;
            const newY = touch.clientY - dragOffset.y;

            const maxX = window.innerWidth - FAB_SIZE;
            const maxY = window.innerHeight - FAB_SIZE;

            setDragPosition({
                x: Math.max(0, Math.min(newX, maxX)),
                y: Math.max(0, Math.min(newY, maxY)),
            });

            if (e.cancelable) {
                e.preventDefault();
            }
        };

        const handleEnd = () => {
            setIsDragging(false);
            setTimeout(() => setHasDragged(false), 100);
        };

        document.addEventListener("touchmove", handleMove, { passive: false });
        document.addEventListener("touchend", handleEnd);

        return () => {
            document.removeEventListener("touchmove", handleMove);
            document.removeEventListener("touchend", handleEnd);
        };
    }, [isDragging, isMobile, dragOffset]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (fabRef.current && !fabRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const positionClasses = {
        "bottom-right": "bottom-6 right-6",
        "bottom-left": "bottom-6 left-6",
        "top-right": "top-6 right-6",
        "top-left": "top-6 left-6",
    };

    const getPositionClasses = () => {
        if (role === "instructor") {
            return "bottom-24 right-4 z-[70] md:bottom-6 md:right-6";
        }

        return `${positionClasses[position] || positionClasses["bottom-right"]} z-50`;
    };

    const getActionPosition = () => {
        if (!isMobile || !dragPosition) return "bottom-16 right-0";

        const { x, y } = dragPosition;
        const screenWidth = window.innerWidth;

        const horizontalPosition =
            x + ACTION_MENU_WIDTH + 20 > screenWidth ? "left-0" : "right-0";

        const verticalPosition =
            y - ACTION_MENU_HEIGHT - 20 < 0 ? "top-16" : "bottom-16";

        return `${verticalPosition} ${horizontalPosition}`;
    };

    const getActionDirection = () => {
        if (!isMobile || !dragPosition) return "items-end";

        const { x } = dragPosition;
        const screenWidth = window.innerWidth;

        return x + ACTION_MENU_WIDTH + 20 > screenWidth
            ? "items-start"
            : "items-end";
    };

    const handleToggle = () => {
        setIsOpen((prev) => !prev);
    };

    const handleActionClick = (action) => {
        action.onClick?.();
        setIsOpen(false);
    };

    const handleDragStart = (e) => {
        if (!isMobile || !fabRef.current) return;

        const touch = e.touches?.[0];
        if (!touch) return;

        dragStartRef.current = { x: touch.clientX, y: touch.clientY };
        setHasDragged(false);
        setIsDragging(true);

        const rect = fabRef.current.getBoundingClientRect();

        setDragOffset({
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top,
        });

        if (!dragPosition) {
            setDragPosition({
                x: rect.left,
                y: rect.top,
            });
        }

        if (e.cancelable) {
            e.preventDefault();
        }
    };

    const handleButtonClick = () => {
        if (hasDragged) return;
        handleToggle();
    };

    const wrapperStyle =
        isMobile && dragPosition
            ? {
                left: `${dragPosition.x}px`,
                top: `${dragPosition.y}px`,
                right: "auto",
                bottom: "auto",
            }
            : undefined;

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] md:hidden"
                    onClick={() => setIsOpen(false)}
                    aria-hidden="true"
                />
            )}

            <div
                ref={fabRef}
                className={`fixed ${dragPosition && isMobile ? "z-[70]" : getPositionClasses()
                    } ${className}`}
                style={wrapperStyle}
                role="region"
                aria-label="Quick actions menu"
            >
                <div
                    id="fab-actions-menu"
                    className={`absolute ${getActionPosition()} space-y-3 flex flex-col ${getActionDirection()} transition-all duration-300 ${isOpen
                            ? "opacity-100 visible"
                            : "opacity-0 invisible pointer-events-none"
                        }`}
                    role="menu"
                    aria-label="Quick actions"
                    aria-orientation="vertical"
                >
                    {roleActions.map((action, index) => (
                        <div
                            key={action.id}
                            className={`flex items-center gap-3 transition-all duration-300 ${isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                                }`}
                            style={{
                                transitionDelay: isOpen ? `${index * 50}ms` : "0ms",
                            }}
                        >
                            <div
                                className={`bg-gray-800 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg transition-all duration-200 ${isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
                                    }`}
                                role="tooltip"
                                aria-hidden="true"
                            >
                                {action.label}
                            </div>

                            <button
                                type="button"
                                onClick={() => handleActionClick(action)}
                                className={`w-12 h-12 ${action.color} text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center text-lg`}
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

                <button
                    type="button"
                    onClick={isMobile ? handleButtonClick : handleToggle}
                    onTouchStart={isMobile ? handleDragStart : undefined}
                    className={`w-14 h-14 bg-edubot-orange hover:bg-edubot-soft text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 ${isDragging
                            ? "cursor-grabbing scale-110"
                            : isMobile
                                ? "cursor-grab"
                                : "cursor-pointer"
                        } ${isOpen ? "rotate-45 scale-110" : "rotate-0 scale-100 hover:scale-110"}`}
                    title="Тез аракеттер"
                    aria-label="Тез аракеттер менюсун ачуу же жабуу"
                    aria-expanded={isOpen}
                    aria-controls="fab-actions-menu"
                >
                    <FiPlus className="h-6 w-6" />
                </button>
            </div>
        </>
    );
};

FloatingActionButton.propTypes = {
    actions: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
            icon: PropTypes.node.isRequired,
            color: PropTypes.string.isRequired,
            onClick: PropTypes.func.isRequired,
        })
    ),
    position: PropTypes.oneOf([
        "bottom-right",
        "bottom-left",
        "top-right",
        "top-left",
    ]),
    className: PropTypes.string,
    role: PropTypes.oneOf(["instructor", "student", "admin", "assistant"]),
};

export default FloatingActionButton;