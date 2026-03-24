// Utility to detect if we're in cross-domain development mode
export const isCrossDomainDevelopment = () => {
    // Check if we're accessing staging API from localhost
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const isStagingApi = window.location.hostname.includes('staging.learning.edubot.it.com') || 
                        import.meta.env?.VITE_API_BASE_URL?.includes('staging.learning.edubot.it.com');
    
    return isLocalhost && isStagingApi;
};

export const shouldUseTokenFallback = () => {
    return isCrossDomainDevelopment();
};

export const getAuthDebugInfo = () => {
    return {
        hostname: window.location.hostname,
        isLocalhost: window.location.hostname === 'localhost',
        isCrossDomain: isCrossDomainDevelopment(),
        hasCookie: document.cookie.includes('edubot_access_token'),
        hasStoredToken: localStorage.getItem('auth_token'),
        apiBaseUrl: import.meta.env?.VITE_API_BASE_URL
    };
};
