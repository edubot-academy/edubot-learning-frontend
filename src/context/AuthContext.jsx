import React, { createContext, useState, useEffect } from 'react';
import { fetchUserProfile, logoutUser } from '@services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem('user');
            if (!stored || stored === 'undefined') return null;
            return JSON.parse(stored);
        } catch (e) {
            // Remove bad data so it does not break subsequent renders
            localStorage.removeItem('user');
            return null;
        }
    });

    useEffect(() => {
        // Only try to fetch profile if we have a user in localStorage, session cookie, or stored token
        const hasStoredUser = localStorage.getItem('user') && localStorage.getItem('user') !== 'undefined';
        const hasSessionCookie = document.cookie.includes('edubot_session=');
        const hasStoredToken = localStorage.getItem('auth_token');

        if (hasStoredUser || hasSessionCookie || hasStoredToken) {
            loadUserProfile();
        }
    }, []);

    const loadUserProfile = async () => {
        try {
            const profile = await fetchUserProfile({ skipAuthRedirect: true });
            setUser(profile);
            localStorage.setItem('user', JSON.stringify(profile));
        } catch (error) {
            // Silently handle 401 errors and suppressed errors (user not logged in)
            if (error?.response?.status !== 401 && !error?.suppressed) {
                console.error('Failed to fetch user profile', error);
            }
            logout(false); // just clear session; don't force redirect on initial load
        }
    };

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = async (redirect = true) => {
        try {
            await logoutUser();
        } catch {
            // Clear local session even if backend cookie was already missing or expired.
        }

        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('pendingAction');
        localStorage.removeItem('auth_token'); // Clear stored token
        if (redirect) {
            window.location.href = '/login';
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};
