import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';

// Animation variants for basic modal types
const ANIMATION_VARIANTS = {
    fade: 'animate-fade-in',
    slideUp: 'animate-slide-up',
    scale: 'animate-scale-in',
};

// Size configurations with responsive breakpoints
const SIZE_CONFIGS = {
    xs: 'max-w-md sm:max-w-sm',
    sm: 'max-w-lg sm:max-w-md',
    md: 'max-w-xl sm:max-w-lg',
    lg: 'max-w-2xl sm:max-w-xl',
    xl: 'max-w-4xl sm:max-w-2xl',
    '2xl': 'max-w-6xl sm:max-w-4xl',
    full: 'max-w-full mx-4 sm:mx-6',
};

const BasicModal = ({
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
    children,
    className = '',
}) => {
    const [localIsOpen, setLocalIsOpen] = useState(isOpen);
    const [portalTarget, setPortalTarget] = useState(null);
    const modalRef = useRef(null);
    const previousFocusRef = useRef(null);
    const focusableElementsRef = useRef([]);

    useEffect(() => {
        setLocalIsOpen(isOpen);
    }, [isOpen]);

    useEffect(() => {
        setPortalTarget(document.body);
    }, []);

    useEffect(() => {
        if (!localIsOpen) return;

        // Store the currently focused element
        previousFocusRef.current = document.activeElement;

        const handleEscape = (e) => {
            if (e.key === 'Escape' && closeOnEscape && onClose) {
                onClose();
            }
        };

        const handleTabKey = (e) => {
            if (e.key !== 'Tab') return;

            const focusableElements = modalRef.current?.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );

            if (!focusableElements || focusableElements.length === 0) return;

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

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
        };

        // Prevent body scroll and calculate scrollbar width
        const originalOverflow = document.body.style.overflow;
        const originalPaddingRight = document.body.style.paddingRight;
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${scrollbarWidth}px`;
        document.addEventListener('keydown', handleEscape);
        document.addEventListener('keydown', handleTabKey);

        // Set initial focus
        if (initialFocus && modalRef.current) {
            const timeoutId = setTimeout(() => {
                const focusableElements = modalRef.current?.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                if (focusableElements && focusableElements.length > 0) {
                    focusableElements[0].focus();
                } else {
                    modalRef.current.focus();
                }
            }, 100);

            return () => {
                clearTimeout(timeoutId);
                document.body.style.overflow = originalOverflow;
                document.body.style.paddingRight = originalPaddingRight;
                document.removeEventListener('keydown', handleEscape);
                document.removeEventListener('keydown', handleTabKey);
                // Restore focus to previous element
                if (previousFocusRef.current && previousFocusRef.current.focus) {
                    previousFocusRef.current.focus();
                }
            };
        }

        return () => {
            document.body.style.overflow = originalOverflow;
            document.body.style.paddingRight = originalPaddingRight;
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('keydown', handleTabKey);
            // Restore focus to previous element
            if (previousFocusRef.current && previousFocusRef.current.focus) {
                previousFocusRef.current.focus();
            }
        };
    }, [localIsOpen, onClose, closeOnEscape, initialFocus]);

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget && closeOnBackdropClick && onClose) {
            onClose();
        }
    };

    const handleCloseClick = () => {
        if (onClose) onClose();
    };

    const sizeClasses = {
        xs: 'max-w-sm sm:max-w-xs',
        sm: 'max-w-md sm:max-w-sm',
        md: 'max-w-lg sm:max-w-md',
        lg: 'max-w-2xl sm:max-w-lg',
        xl: 'max-w-4xl sm:max-w-xl',
        '2xl': 'max-w-6xl sm:max-w-2xl',
        full: 'max-w-full mx-4 sm:mx-6',
    };

    if (!localIsOpen || !portalTarget) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] overflow-y-auto min-h-screen px-4 py-6 sm:py-8">
            {showBackdrop && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
                    aria-hidden="true"
                    onClick={handleBackdropClick}
                />
            )}

            <div className="relative z-10 flex justify-center items-start min-h-screen">
                <div
                    ref={modalRef}
                    className={`w-full ${SIZE_CONFIGS[size] || SIZE_CONFIGS.md} rounded-2xl bg-white shadow-2xl focus:outline-none dark:bg-gray-800 transform transition-all duration-300 ${localIsOpen ? `${ANIMATION_VARIANTS[animation]} scale-100 translate-y-0 opacity-100` : 'scale-95 translate-y-4 opacity-0'
                        }`}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={title ? 'modal-title' : undefined}
                    aria-describedby="modal-description"
                    tabIndex={-1}
                >
                    <div className="p-6">
                        {(title || subtitle || showCloseButton) && (
                            <div className="mb-6 flex items-start justify-between gap-4 p-6 border-b border-gray-200 dark:border-gray-700">
                                <div>
                                    {title && (
                                        <h2
                                            id="modal-title"
                                            className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white"
                                        >
                                            {title}
                                        </h2>
                                    )}
                                    {subtitle && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                            {subtitle}
                                        </p>
                                    )}
                                </div>
                                {showCloseButton && (
                                    <button
                                        type="button"
                                        onClick={handleCloseClick}
                                        className="rounded-full p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-all duration-200"
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

                        <div className="max-h-[70vh] overflow-y-auto modal-content" id="modal-description">{children}</div>
                    </div>
                </div>
            </div>
        </div>,
        portalTarget
    );
};

BasicModal.propTypes = {
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
    animation: PropTypes.oneOf(['fade', 'slideUp', 'scale']),
    children: PropTypes.node,
    className: PropTypes.string,
};

export default BasicModal;
