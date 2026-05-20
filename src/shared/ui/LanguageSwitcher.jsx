import { useEffect, useRef, useState } from 'react';
import { FiGlobe } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { LOCALE_OPTIONS, normalizeLocale, setStoredLocale } from '../../i18n/locale';

const LanguageSwitcher = ({ placement = 'bottom' }) => {
    const { i18n, t } = useTranslation();
    const [selectedLocale, setSelectedLocale] = useState(() => normalizeLocale(i18n.language));
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);
    const triggerRef = useRef(null);
    const optionRefs = useRef([]);
    const menuPositionClass = placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2';

    useEffect(() => {
        setSelectedLocale(normalizeLocale(i18n.resolvedLanguage || i18n.language));
    }, [i18n.language, i18n.resolvedLanguage]);

    useEffect(() => {
        if (!open) return undefined;

        const selectedIndex = LOCALE_OPTIONS.findIndex(
            (locale) => locale.value === selectedLocale
        );
        window.requestAnimationFrame(() => {
            optionRefs.current[selectedIndex >= 0 ? selectedIndex : 0]?.focus();
        });

        const handlePointerDown = (event) => {
            if (!rootRef.current?.contains(event.target)) {
                setOpen(false);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setOpen(false);
                triggerRef.current?.focus();
            }
        };

        document.addEventListener('pointerdown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [open, selectedLocale]);

    const handleSelect = async (value) => {
        const nextLocale = setStoredLocale(value);
        setSelectedLocale(nextLocale);
        setOpen(false);
        await i18n.changeLanguage(nextLocale);
    };

    const handleOptionKeyDown = (event, index) => {
        const lastIndex = LOCALE_OPTIONS.length - 1;
        let nextIndex;

        if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
            nextIndex = index === lastIndex ? 0 : index + 1;
        } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
            nextIndex = index === 0 ? lastIndex : index - 1;
        } else if (event.key === 'Home') {
            nextIndex = 0;
        } else if (event.key === 'End') {
            nextIndex = lastIndex;
        } else {
            return;
        }

        event.preventDefault();
        optionRefs.current[nextIndex]?.focus();
    };

    return (
        <div ref={rootRef} className="relative inline-flex">
            <button
                ref={triggerRef}
                type="button"
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label={t('common.language')}
                onClick={() => setOpen((value) => !value)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-800 shadow-sm transition-colors hover:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-[#1A1A1A] dark:text-[#E8ECF3] dark:focus:ring-offset-[#1A1A1A]"
            >
                <FiGlobe className="h-4 w-4 text-orange-500" aria-hidden="true" />
            </button>

            {open && (
                <div
                    className={`absolute right-0 z-50 w-14 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 text-sm font-semibold uppercase text-gray-800 shadow-lg dark:border-gray-700 dark:bg-[#1A1A1A] dark:text-[#E8ECF3] ${menuPositionClass}`}
                >
                    <div role="menu" aria-label={t('common.language')}>
                        {LOCALE_OPTIONS.map((locale, index) => (
                            <button
                                ref={(node) => {
                                    optionRefs.current[index] = node;
                                }}
                                key={locale.value}
                                type="button"
                                role="menuitemradio"
                                aria-checked={selectedLocale === locale.value}
                                onClick={() => handleSelect(locale.value)}
                                onKeyDown={(event) => handleOptionKeyDown(event, index)}
                                className={`block w-full px-2 py-2 text-center transition-colors hover:bg-orange-50 hover:text-orange-700 dark:hover:bg-orange-500/10 dark:hover:text-orange-200 ${
                                    selectedLocale === locale.value
                                        ? 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-200'
                                        : ''
                                }`}
                            >
                                {locale.value.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LanguageSwitcher;
