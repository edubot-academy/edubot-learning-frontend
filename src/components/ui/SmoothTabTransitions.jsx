import React, { useState, useEffect } from 'react';

/**
 * SmoothTabTransition - Eliminates tab flickering by managing content transitions
 * 
 * This component wraps tab content and prevents the flickering effect by:
 * 1. Showing content immediately if data is already loaded
 * 2. Using overlay loaders instead of replacing content
 * 3. Implementing smooth transitions between tabs
 */
const SmoothTabTransition = ({ 
    children, 
    isLoading = false, 
    isDataLoaded = false,
    loadingDelay = 300 
}) => {
    const [showContent, setShowContent] = useState(true);
    const [showLoader, setShowLoader] = useState(false);
    const [loadingTimer, setLoadingTimer] = useState(null);

    useEffect(() => {
        // Clear any existing timer
        if (loadingTimer) {
            clearTimeout(loadingTimer);
        }

        if (isLoading && isDataLoaded) {
            // Data is loading but already loaded once - show overlay instead of replacing
            setShowContent(true);
            setShowLoader(true);
        } else if (isLoading && !isDataLoaded) {
            // First time loading - show loader after delay to prevent flicker
            const timer = setTimeout(() => {
                setShowContent(false);
                setShowLoader(true);
            }, loadingDelay);
            setLoadingTimer(timer);
        } else {
            // Not loading - show content immediately
            setShowContent(true);
            setShowLoader(false);
        }

        return () => {
            if (loadingTimer) {
                clearTimeout(loadingTimer);
            }
        };
    }, [isLoading, isDataLoaded, loadingDelay, loadingTimer]);

    return (
        <div className="relative">
            {/* Main content */}
            <div 
                className={`transition-opacity duration-300 ${
                    showContent && !showLoader ? 'opacity-100' : 'opacity-30'
                }`}
            >
                {children}
            </div>

            {/* Loading overlay */}
            {showLoader && (
                <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 flex items-center justify-center rounded-2xl backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 w-5 h-5"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Жүктөлүүдө...</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * TabContentWrapper - Wraps individual tab content with smooth transitions
 */
const TabContentWrapper = ({ 
    isActive, 
    children, 
    isLoading = false,
    className = '' 
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        if (isActive) {
            setShouldRender(true);
            // Small delay to ensure smooth transition
            const timer = setTimeout(() => setIsVisible(true), 50);
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
            // Keep rendered for a short time to allow smooth exit animation
            const timer = setTimeout(() => setShouldRender(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isActive]);

    if (!shouldRender) return null;

    return (
        <div
            className={`transition-all duration-300 ease-in-out ${
                isVisible 
                    ? 'opacity-100 translate-x-0' 
                    : 'opacity-0 translate-x-4'
            } ${className}`}
        >
            <SmoothTabTransition isLoading={isLoading}>
                {children}
            </SmoothTabTransition>
        </div>
    );
};

/**
 * AntiFlickerWrapper - Prevents flickering during rapid tab switches
 */
const AntiFlickerWrapper = ({ 
    children, 
    loadingStates = {}, 
    activeTab = null 
}) => {
    const [currentContent, setCurrentContent] = useState(children);
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        if (activeTab && loadingStates[activeTab]) {
            // Tab is loading - keep current content visible with overlay
            setIsTransitioning(true);
        } else {
            // Tab is ready - transition to new content
            setIsTransitioning(false);
            setCurrentContent(children);
        }
    }, [children, loadingStates, activeTab]);

    return (
        <div className="relative">
            {currentContent}
            {isTransitioning && (
                <div className="absolute inset-0 bg-white/40 dark:bg-gray-900/40 flex items-center justify-center rounded-2xl backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg">
                        <div className="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 w-4 h-4"></div>
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * TabSwitchGuard - Prevents rapid tab switching that causes flickering
 */
const TabSwitchGuard = ({ 
    children, 
    onTabChange, 
    debounceMs = 200 
}) => {
    const [lastSwitchTime, setLastSwitchTime] = useState(0);
    const [pendingTab, setPendingTab] = useState(null);

    const handleTabChange = (tabId) => {
        const now = Date.now();
        
        if (now - lastSwitchTime < debounceMs) {
            // Debounce rapid switches
            setPendingTab(tabId);
            const timer = setTimeout(() => {
                onTabChange(tabId);
                setLastSwitchTime(Date.now());
                setPendingTab(null);
            }, debounceMs - (now - lastSwitchTime));
            return;
        }

        // Normal tab change
        onTabChange(tabId);
        setLastSwitchTime(now);
    };

    useEffect(() => {
        return () => {
            // Cleanup any pending tab changes
            if (pendingTab) {
                onTabChange(pendingTab);
            }
        };
    }, [pendingTab, onTabChange]);

    return children({ handleTabChange, isDebouncing: pendingTab !== null });
};

export {
    SmoothTabTransition,
    TabContentWrapper,
    AntiFlickerWrapper,
    TabSwitchGuard
};
