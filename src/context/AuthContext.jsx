/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { fetchUserProfile, logoutUser } from '@services/api';
import { normalizeUserAvatar } from '@shared/utils/avatar';
import {
    clearStoredSession,
    getStoredAuthToken,
    hasCachedUser,
    loadCachedUser,
    saveCachedUser,
} from '@shared/auth/sessionStorage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = loadCachedUser();
        return storedUser ? normalizeUserAvatar(storedUser) : null;
    });

    const logout = useCallback(async (redirect = true) => {
        try {
            await logoutUser();
        } catch {
            // Clear local session even if backend cookie was already missing or expired.
        }

        setUser(null);
        clearStoredSession();
        if (redirect) {
            window.location.href = '/login';
        }
    }, []);

    const loadUserProfile = useCallback(async () => {
        try {
            const profile = await fetchUserProfile({ skipAuthRedirect: true });
            const normalizedProfile = normalizeUserAvatar(profile);
            setUser(normalizedProfile);
            saveCachedUser(normalizedProfile);
        } catch (error) {
            // Silently handle 401 errors and suppressed errors (user not logged in)
            if (error?.response?.status !== 401 && !error?.suppressed) {
                console.error('Failed to fetch user profile', error);
            }
            logout(false); // just clear session; don't force redirect on initial load
        }
    }, [logout]);

    useEffect(() => {
        // Only try to fetch profile if we have a cached user, session cookie, or stored token.
        const hasSessionCookie =
            document.cookie.includes('edubot_access_token=') ||
            document.cookie.includes('edubot_session=');

        if (hasCachedUser() || hasSessionCookie || getStoredAuthToken()) {
            loadUserProfile();
        }
    }, [loadUserProfile]);

    const login = useCallback((userData) => {
        const normalizedUser = normalizeUserAvatar(userData);
        setUser(normalizedUser);
        saveCachedUser(normalizedUser);
    }, []);

    const value = useMemo(
        () => ({ user, login, logout, setUser }),
        [user, login, logout]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
