import { useState, useEffect } from 'react';
import { DarkModeContext } from './DarkModeContext';

export const DarkModeProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('darkMode');
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
            localStorage.setItem('darkMode', darkMode ? 'dark' : 'light');
        }
    }, [darkMode]);

    return (
        <DarkModeContext.Provider value={{ darkMode, setDarkMode }}>
            {children}
        </DarkModeContext.Provider>
    );
};
