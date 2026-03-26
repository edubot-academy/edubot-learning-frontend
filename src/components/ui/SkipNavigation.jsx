import React, { useState, useEffect } from 'react';

const SkipNavigation = () => {
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Tab' && document.activeElement === document.body) {
                setIsFocused(true);
            }
        };

        const handleMouseDown = () => {
            setIsFocused(false);
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('mousedown', handleMouseDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleMouseDown);
        };
    }, []);

    const handleSkipToMain = () => {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.focus();
            mainContent.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleSkipToNavigation = () => {
        const navigation = document.querySelector('nav[role="navigation"], [role="menubar"]');
        if (navigation) {
            navigation.focus();
            navigation.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleSkipToSearch = () => {
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="издөө" i], input[placeholder*="search" i]');
        if (searchInput) {
            searchInput.focus();
            searchInput.scrollIntoView({ behavior: 'smooth' });
        }
    };

    if (!isFocused) {
        return null;
    }

    return (
        <div 
            className="fixed top-0 left-0 z-[9999] bg-gray-900 text-white p-4 shadow-lg"
            role="navigation"
            aria-label="Skip navigation links"
        >
            <div className="flex flex-col space-y-2">
                <button
                    onClick={handleSkipToMain}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    aria-label="Негизги мазмунга өтүү"
                >
                    Негизги мазмунга өтүү (Alt + M)
                </button>
                <button
                    onClick={handleSkipToNavigation}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-400"
                    aria-label="Навигацияга өтүү"
                >
                    Навигацияга өтүү (Alt + N)
                </button>
                <button
                    onClick={handleSkipToSearch}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    aria-label="Издөөгө өтүү"
                >
                    Издөөгө өтүү (Alt + S)
                </button>
            </div>
        </div>
    );
};

export default SkipNavigation;
