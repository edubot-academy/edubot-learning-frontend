import { useEffect, useId, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

export const AiGenerationDrawer = ({
    isOpen,
    title,
    description,
    onClose,
    children,
    footer,
}) => {
    const { t } = useTranslation();
    const titleId = useId();
    const descriptionId = useId();
    const [portalTarget, setPortalTarget] = useState(null);
    const drawerRef = useRef(null);
    const previousFocusRef = useRef(null);
    const onCloseRef = useRef(onClose);

    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        setPortalTarget(document.body);
    }, []);

    useEffect(() => {
        if (!isOpen) return undefined;
        previousFocusRef.current = document.activeElement;
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onCloseRef.current?.();
                return;
            }

            if (event.key !== 'Tab') return;
            const focusable = drawerRef.current?.querySelectorAll(
                'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            );
            if (!focusable?.length) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        const focusTimer = setTimeout(() => {
            const firstFocusable = drawerRef.current?.querySelector(
                'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            );
            firstFocusable?.focus?.();
        }, 50);

        return () => {
            clearTimeout(focusTimer);
            document.body.style.overflow = originalOverflow;
            document.removeEventListener('keydown', handleKeyDown);
            previousFocusRef.current?.focus?.();
        };
    }, [isOpen]);

    if (!isOpen || !portalTarget) return null;

    return createPortal(
        <div className="fixed inset-0 z-[110]">
            <button
                type="button"
                className="absolute inset-0 h-full w-full cursor-default bg-black/50 backdrop-blur-sm"
                aria-label={t('common.close')}
                onClick={() => onCloseRef.current?.()}
            />
            <aside
                ref={drawerRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? titleId : undefined}
                aria-describedby={description ? descriptionId : undefined}
                className="absolute inset-y-0 right-0 flex h-full w-full flex-col bg-white shadow-2xl outline-none dark:bg-slate-950 sm:max-w-[720px]"
                tabIndex={-1}
            >
                <header className="border-b border-edubot-line px-5 py-4 dark:border-slate-800">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-edubot-orange">
                                {t('ai.panelEyebrow')}
                            </div>
                            {title ? (
                                <h2 id={titleId} className="mt-1 text-xl font-semibold text-edubot-ink dark:text-white">
                                    {title}
                                </h2>
                            ) : null}
                            {description ? (
                                <p id={descriptionId} className="mt-2 text-sm text-edubot-muted dark:text-slate-400">
                                    {description}
                                </p>
                            ) : null}
                        </div>
                        <button
                            type="button"
                            onClick={() => onCloseRef.current?.()}
                            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-edubot-line bg-white text-edubot-muted transition hover:border-edubot-orange/40 hover:text-edubot-orange dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                            aria-label={t('common.close')}
                        >
                            <FiX className="h-5 w-5" />
                        </button>
                    </div>
                </header>
                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                    {children}
                </div>
                {footer ? (
                    <footer className="border-t border-edubot-line bg-edubot-surface/70 px-5 py-4 dark:border-slate-800 dark:bg-slate-900/70">
                        {footer}
                    </footer>
                ) : null}
            </aside>
        </div>,
        portalTarget
    );
};

AiGenerationDrawer.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    title: PropTypes.string,
    description: PropTypes.string,
    onClose: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
    footer: PropTypes.node,
};

AiGenerationDrawer.defaultProps = {
    title: '',
    description: '',
    footer: null,
};

export default AiGenerationDrawer;
