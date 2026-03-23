import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';

const Modal = ({
    isOpen,
    onClose,
    title,
    size = 'md',
    showCloseButton = true,
    showBackdrop = true,
    closeOnBackdropClick = true,
    closeOnEscape = true,
    initialFocus = true,
    children,
}) => {
    const [localIsOpen, setLocalIsOpen] = useState(isOpen);
    const [portalTarget, setPortalTarget] = useState(null);
    const modalRef = useRef(null);

    useEffect(() => {
        setLocalIsOpen(isOpen);
    }, [isOpen]);

    useEffect(() => {
        setPortalTarget(document.body);
    }, []);

    useEffect(() => {
        if (!localIsOpen) return;

        const handleEscape = (e) => {
            if (e.key === 'Escape' && closeOnEscape && onClose) {
                onClose();
            }
        };

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', handleEscape);

        if (initialFocus && modalRef.current) {
            modalRef.current.focus();
        }

        return () => {
            document.body.style.overflow = originalOverflow;
            document.removeEventListener('keydown', handleEscape);
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
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-3xl',
        xl: 'max-w-5xl',
        full: 'max-w-full mx-4',
    };

    if (!localIsOpen || !portalTarget) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] overflow-y-auto min-h-screen px-4 pt-28 pb-10">
            {showBackdrop && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                    aria-hidden="true"
                    onClick={handleBackdropClick}
                />
            )}

            <div className="relative z-10 flex justify-center">
                <div
                    ref={modalRef}
                    className={`w-full ${sizeClasses[size] || sizeClasses.md} rounded-xl bg-white shadow-2xl focus:outline-none dark:bg-gray-800`}
                    role="dialog"
                    aria-modal="true"
                    tabIndex={-1}
                >
                    <div className="p-6">
                        {(title || showCloseButton) && (
                            <div className="mb-6 flex items-start justify-between gap-4">
                                {title && (
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {title}
                                    </h2>
                                )}

                                {showCloseButton && (
                                    <button
                                        type="button"
                                        onClick={handleCloseClick}
                                        className="rounded-full p-1 px-2 text-3xl font-bold leading-none text-gray-500 transition-colors duration-200 hover:bg-gray-100 hover:text-black dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        )}

                        <div className="modal-content">{children}</div>
                    </div>
                </div>
            </div>
        </div>,
        portalTarget
    );
};

Modal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func,
    title: PropTypes.string,
    size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
    showCloseButton: PropTypes.bool,
    showBackdrop: PropTypes.bool,
    closeOnBackdropClick: PropTypes.bool,
    closeOnEscape: PropTypes.bool,
    initialFocus: PropTypes.bool,
    children: PropTypes.node,
};

export default Modal;
