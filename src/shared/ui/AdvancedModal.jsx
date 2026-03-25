import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';

// Animation variants for different modal types
const ANIMATION_VARIANTS = {
    fade: 'animate-fade-in',
    slideUp: 'animate-slide-up',
    scale: 'animate-scale-in',
    bounce: 'animate-bounce-in',
};

// Size configurations with responsive breakpoints
const SIZE_CONFIGS = {
    xs: 'max-w-sm sm:max-w-xs',
    sm: 'max-w-md sm:max-w-sm',
    md: 'max-w-lg sm:max-w-md',
    lg: 'max-w-2xl sm:max-w-lg',
    xl: 'max-w-4xl sm:max-w-xl',
    '2xl': 'max-w-6xl sm:max-w-2xl',
    full: 'max-w-full mx-4 sm:mx-6',
};

const AdvancedModal = ({
    isOpen,
    onClose,
    title,
    subtitle,
    size = 'md',
    showCloseButton = true,
    showBackdrop = true,
    closeOnBackdropClick = true,
    closeOnEscape = true,
    initialFocus = true,
    animation = 'slideUp',
    preventClose = false,
    children,
    footer,
    actions,
    variant = 'default',
    loading = false,
    className = '',
}) => {
    const [localIsOpen, setLocalIsOpen] = useState(isOpen);
    const [portalTarget, setPortalTarget] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const modalRef = useRef(null);
    const previousFocusRef = useRef(null);
    const animationTimeoutRef = useRef(null);

    // Animation states
    const [animationClass, setAnimationClass] = useState('');

    useEffect(() => {
        setLocalIsOpen(isOpen);
    }, [isOpen]);

    useEffect(() => {
        setPortalTarget(document.body);
    }, []);

    // Handle animation
    useEffect(() => {
        if (localIsOpen) {
            setIsAnimating(true);
            setAnimationClass(ANIMATION_VARIANTS[animation] || ANIMATION_VARIANTS.slideUp);

            // Clear any existing timeout
            if (animationTimeoutRef.current) {
                clearTimeout(animationTimeoutRef.current);
            }

            // Remove animation class after animation completes
            animationTimeoutRef.current = setTimeout(() => {
                setIsAnimating(false);
                setAnimationClass('');
            }, 300);
        }

        return () => {
            if (animationTimeoutRef.current) {
                clearTimeout(animationTimeoutRef.current);
            }
        };
    }, [localIsOpen, animation]);

    // Enhanced focus management
    const trapFocus = useCallback((e) => {
        if (!modalRef.current) return;

        const focusableElements = modalRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        }
    }, []);

    // Enhanced keyboard and accessibility handling
    useEffect(() => {
        if (!localIsOpen) return;

        // Store currently focused element
        previousFocusRef.current = document.activeElement;

        const handleEscape = (e) => {
            if (e.key === 'Escape' && closeOnEscape && onClose && !preventClose && !loading) {
                e.preventDefault();
                onClose();
            }
        };

        const handleKeyDown = (e) => {
            trapFocus(e);

            // Additional keyboard shortcuts
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'Enter':
                        if (actions && actions.length > 0 && !loading) {
                            e.preventDefault();
                            const primaryAction = actions.find(action => action.variant === 'primary') || actions[0];
                            if (primaryAction && primaryAction.onClick) {
                                primaryAction.onClick();
                            }
                        }
                        break;
                }
            }
        };

        // Prevent body scroll
        const originalOverflow = document.body.style.overflow;
        const originalPaddingRight = document.body.style.paddingRight;

        // Calculate scrollbar width to prevent layout shift
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${scrollbarWidth}px`;

        document.addEventListener('keydown', handleEscape);
        document.addEventListener('keydown', handleKeyDown);

        // Enhanced initial focus
        if (initialFocus && modalRef.current) {
            const timeoutId = setTimeout(() => {
                const focusableElements = modalRef.current.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );

                // Try to focus the first input, then first button, then modal itself
                const firstInput = modalRef.current.querySelector('input:not([disabled]), textarea:not([disabled])');
                const firstButton = modalRef.current.querySelector('button:not([disabled])');

                if (firstInput) {
                    firstInput.focus();
                } else if (firstButton) {
                    firstButton.focus();
                } else {
                    modalRef.current.focus();
                }
            }, 150);

            return () => {
                clearTimeout(timeoutId);
                document.body.style.overflow = originalOverflow;
                document.body.style.paddingRight = originalPaddingRight;
                document.removeEventListener('keydown', handleEscape);
                document.removeEventListener('keydown', handleKeyDown);

                // Enhanced focus restoration
                if (previousFocusRef.current && previousFocusRef.current.focus) {
                    previousFocusRef.current.focus();
                }
            };
        }

        return () => {
            document.body.style.overflow = originalOverflow;
            document.body.style.paddingRight = originalPaddingRight;
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('keydown', handleKeyDown);

            if (previousFocusRef.current && previousFocusRef.current.focus) {
                previousFocusRef.current.focus();
            }
        };
    }, [localIsOpen, onClose, closeOnEscape, initialFocus, preventClose, loading, trapFocus]);

    const handleBackdropClick = useCallback((e) => {
        if (e.target === e.currentTarget && closeOnBackdropClick && onClose && !preventClose && !loading) {
            onClose();
        }
    }, [closeOnBackdropClick, onClose, preventClose, loading]);

    const handleCloseClick = useCallback(() => {
        if (onClose && !preventClose && !loading) {
            onClose();
        }
    }, [onClose, preventClose, loading]);

    // Variant-specific styling
    const getVariantClasses = () => {
        switch (variant) {
            case 'danger':
                return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
            case 'warning':
                return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20';
            case 'success':
                return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20';
            case 'info':
                return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20';
            default:
                return 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800';
        }
    };

    if (!localIsOpen || !portalTarget) return null;

    return createPortal(
        <>
            {/* Enhanced backdrop with blur and animation */}
            {showBackdrop && (
                <div
                    className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300 z-[100] ${localIsOpen ? 'opacity-100' : 'opacity-0'
                        }`}
                    aria-hidden="true"
                    onClick={handleBackdropClick}
                />
            )}

            {/* Modal container with improved positioning */}
            <div
                className={`fixed inset-0 z-[110] overflow-y-auto min-h-screen px-4 py-6 sm:py-8 flex items-start justify-center ${localIsOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                    } transition-all duration-300`}
            >
                <div
                    ref={modalRef}
                    className={`w-full ${SIZE_CONFIGS[size] || SIZE_CONFIGS.md} rounded-2xl shadow-2xl focus:outline-none transition-all duration-300 transform ${localIsOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'
                        } ${getVariantClasses()} ${animationClass} ${className}`}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={title ? 'modal-title' : undefined}
                    aria-describedby={subtitle ? 'modal-subtitle' : undefined}
                    aria-busy={loading}
                    tabIndex={-1}
                >
                    {/* Enhanced header section */}
                    {(title || subtitle || showCloseButton) && (
                        <div className={`flex items-start justify-between gap-4 p-6 border-b ${getVariantClasses().includes('border-')
                            ? getVariantClasses()
                            : 'border-gray-200 dark:border-gray-700'
                            }`}>
                            <div className="flex-1 min-w-0">
                                {title && (
                                    <h2
                                        id="modal-title"
                                        className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate"
                                    >
                                        {title}
                                    </h2>
                                )}
                                {subtitle && (
                                    <p
                                        id="modal-subtitle"
                                        className="text-sm text-gray-600 dark:text-gray-400 mt-1"
                                    >
                                        {subtitle}
                                    </p>
                                )}
                            </div>

                            {showCloseButton && (
                                <button
                                    type="button"
                                    onClick={handleCloseClick}
                                    disabled={preventClose || loading}
                                    className="rounded-full p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label="Жабуу"
                                    title="Жабуу (ESC)"
                                >
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            )}
                        </div>
                    )}

                    {/* Enhanced content area */}
                    <div className="p-6 max-h-[70vh] overflow-y-auto">
                        <div className="modal-content">
                            {loading && (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    <span className="ml-3 text-gray-600 dark:text-gray-400">Жүктөлүүдө...</span>
                                </div>
                            )}
                            {!loading && children}
                        </div>
                    </div>

                    {/* Enhanced footer section */}
                    {(footer || actions) && (
                        <div className={`flex items-center justify-between gap-4 p-6 border-t ${getVariantClasses().includes('border-')
                            ? getVariantClasses()
                            : 'border-gray-200 dark:border-gray-700'
                            }`}>
                            {footer && (
                                <div className="flex-1">
                                    {footer}
                                </div>
                            )}

                            {actions && (
                                <div className="flex items-center gap-3 flex-wrap">
                                    {actions.map((action, index) => (
                                        <button
                                            key={action.id || index}
                                            type={action.type || 'button'}
                                            onClick={action.onClick}
                                            disabled={action.disabled || loading}
                                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${action.variant === 'primary'
                                                ? 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
                                                : action.variant === 'danger'
                                                    ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
                                                    : action.variant === 'success'
                                                        ? 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'
                                                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 focus:ring-gray-500'
                                                } ${action.className || ''}`}
                                            aria-label={action.ariaLabel}
                                        >
                                            {action.loading ? (
                                                <div className="flex items-center">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                                                    {action.label}
                                                </div>
                                            ) : (
                                                action.label
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>,
        portalTarget
    );
};

AdvancedModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func,
    title: PropTypes.string,
    subtitle: PropTypes.string,
    size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl', 'full']),
    showCloseButton: PropTypes.bool,
    showBackdrop: PropTypes.bool,
    closeOnBackdropClick: PropTypes.bool,
    closeOnEscape: PropTypes.bool,
    initialFocus: PropTypes.bool,
    animation: PropTypes.oneOf(['fade', 'slideUp', 'scale', 'bounce']),
    preventClose: PropTypes.bool,
    children: PropTypes.node,
    footer: PropTypes.node,
    actions: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        label: PropTypes.string.isRequired,
        onClick: PropTypes.func.isRequired,
        variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'success']),
        disabled: PropTypes.bool,
        loading: PropTypes.bool,
        className: PropTypes.string,
        ariaLabel: PropTypes.string,
        type: PropTypes.string,
    })),
    variant: PropTypes.oneOf(['default', 'danger', 'warning', 'success', 'info']),
    loading: PropTypes.bool,
    className: PropTypes.string,
};

export default AdvancedModal;
