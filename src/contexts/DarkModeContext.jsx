import React, { createContext, useContext, useState, useEffect } from 'react';

const DarkModeContext = createContext();

export const DarkModeProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(() => {
        // Check localStorage first, then system preference
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

export const useDarkMode = () => {
    const context = useContext(DarkModeContext);
    if (!context) {
        throw new Error('useDarkMode must be used within a DarkModeProvider');
    }
    return context;
};
