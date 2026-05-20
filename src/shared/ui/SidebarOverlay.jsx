import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const SidebarOverlay = ({ 
    isOpen, 
    onClose, 
    position = 'left', 
    children,
    disableScroll = true,
    overlayClickClose = true,
    escKeyClose = true
}) => {
    const { t } = useTranslation();
    const sidebarRef = useRef(null);

    useEffect(() => {
        if (!escKeyClose || !isOpen) return;

        const handleEscKey = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscKey);
        return () => document.removeEventListener('keydown', handleEscKey);
    }, [isOpen, onClose, escKeyClose]);

    useEffect(() => {
        if (!disableScroll) return;

        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen, disableScroll]);

    const handleOverlayClick = (e) => {
        if (overlayClickClose && e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleSidebarClick = (e) => {
        if (!isOpen) {
            e.stopPropagation();
        }
    };

    return (
        <div
            className={`fixed inset-0 z-50 w-full flex transition-opacity duration-300 ${
                position === 'right' ? '' : 'flex-row-reverse'
            } ${isOpen ? 'pointer-events-auto visible' : 'pointer-events-none invisible'}`}
            onClick={handleOverlayClick}
            aria-hidden={!isOpen}
        >
            <div
                className={`flex-1 transition-opacity duration-300 
                    ${isOpen ? 'opacity-100' : 'opacity-0'}
                    bg-black/50 dark:bg-black/70`}
            ></div>

            <div
                ref={sidebarRef}
                className={`w-2/3 md:max-w-[393px] h-full shadow-lg fixed
                    ${position === 'right' ? 'right-0' : 'left-0'}
                    transition-transform duration-300 ease-out overflow-y-auto
                    bg-white dark:bg-gray-900
                    border-r border-gray-200 dark:border-gray-700
                    ${
                        isOpen
                            ? 'translate-x-0'
                            : position === 'right'
                            ? 'translate-x-full'
                            : '-translate-x-full'
                    }`}
                onClick={handleSidebarClick}
                role="dialog"
                aria-modal="true"
                aria-label={t('sidebarOverlay.label')}
            >
                <div className="p-4">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default SidebarOverlay;
