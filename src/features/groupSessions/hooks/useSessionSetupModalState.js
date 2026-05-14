import { useEffect, useRef, useState } from 'react';

const MODAL_FOCUSABLE_SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(', ');

export const useSessionSetupModalState = () => {
    const [workspaceMode, setWorkspaceMode] = useState('create');
    const [isSessionSetupOpen, setIsSessionSetupOpen] = useState(false);
    const sessionSetupModalRef = useRef(null);
    const previousModalFocusRef = useRef(null);

    useEffect(() => {
        if (!isSessionSetupOpen || typeof document === 'undefined') return undefined;

        const originalOverflow = document.body.style.overflow;
        const originalPaddingRight = document.body.style.paddingRight;
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${scrollbarWidth}px`;

        return () => {
            document.body.style.overflow = originalOverflow;
            document.body.style.paddingRight = originalPaddingRight;
        };
    }, [isSessionSetupOpen]);

    useEffect(() => {
        if (!isSessionSetupOpen || typeof document === 'undefined') return undefined;

        previousModalFocusRef.current = document.activeElement;

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                setIsSessionSetupOpen(false);
                return;
            }

            if (event.key !== 'Tab' || !sessionSetupModalRef.current) return;

            const focusableElements = sessionSetupModalRef.current.querySelectorAll(
                MODAL_FOCUSABLE_SELECTOR
            );

            if (!focusableElements.length) return;

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (event.shiftKey && document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            } else if (!event.shiftKey && document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        const focusTimer = window.setTimeout(() => {
            const firstFocusable = sessionSetupModalRef.current?.querySelector(
                MODAL_FOCUSABLE_SELECTOR
            );
            firstFocusable?.focus();
        }, 0);

        return () => {
            window.clearTimeout(focusTimer);
            document.removeEventListener('keydown', handleKeyDown);
            previousModalFocusRef.current?.focus?.();
        };
    }, [isSessionSetupOpen]);

    return {
        isSessionSetupOpen,
        sessionSetupModalRef,
        setIsSessionSetupOpen,
        setWorkspaceMode,
        workspaceMode,
    };
};
