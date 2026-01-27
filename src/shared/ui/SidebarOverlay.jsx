import { useEffect, useRef } from 'react';

const SidebarOverlay = ({ 
    isOpen, 
    onClose, 
    position = 'left', 
    children,
    disableScroll = true,
    overlayClickClose = true,
    escKeyClose = true
}) => {
    const sidebarRef = useRef(null);

    // Обработка нажатия ESC
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

    // Блокировка скролла на body
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

    // Клик вне сайдбара
    const handleOverlayClick = (e) => {
        if (overlayClickClose && e.target === e.currentTarget) {
            onClose();
        }
    };

    // Отключение клика на сайдбар при закрытии
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
            {/* Overlay */}
            <div
                className={`flex-1 transition-opacity duration-300 
                    ${isOpen ? 'opacity-100' : 'opacity-0'}
                    bg-black/50 dark:bg-black/70`}
            ></div>

            {/* Sidebar */}
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
                aria-label="Sidebar"
            >
                <div className="p-4">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default SidebarOverlay;