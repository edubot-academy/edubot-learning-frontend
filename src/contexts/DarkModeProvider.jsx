import { useState, useEffect, useMemo } from 'react';
import { DarkModeContext } from './DarkModeContext';
import { getStorageItem, setStorageItem } from '@shared/utils/storage';

export const DarkModeProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            const stored = getStorageItem('darkMode');
            if (stored) {
                return stored === 'dark';
            }
            return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
        }
        return false;
    });

    useEffect(() => {
        const root = document.documentElement;
        root.classList.toggle('dark', darkMode);

        if (typeof window !== 'undefined') {
            setStorageItem('darkMode', darkMode ? 'dark' : 'light');
        }
    }, [darkMode]);

    const value = useMemo(() => ({ darkMode, setDarkMode }), [darkMode]);

    return <DarkModeContext.Provider value={value}>{children}</DarkModeContext.Provider>;
};
