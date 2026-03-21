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
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        try {
            const profile = await fetchUserProfile({ skipAuthRedirect: true });
            setUser(profile);
            localStorage.setItem('user', JSON.stringify(profile));
        } catch (error) {
            if (error?.response?.status !== 401) {
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
