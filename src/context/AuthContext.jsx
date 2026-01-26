import React, { createContext, useState, useEffect } from 'react';
import { fetchUserProfile } from '@services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        return JSON.parse(localStorage.getItem('user')) || null;
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token && !user) {
            loadUserProfile();
        }
    }, []);

    const loadUserProfile = async () => {
        try {
            const response = await fetchUserProfile();
            setUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
        } catch (error) {
            console.error('Failed to fetch user profile', error);
            logout(false); // just clear session; don't force redirect on initial load
        }
    };

    const login = (userData, token) => {
        setUser(userData);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = (redirect = true) => {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('pendingAction'); // Добавляем очистку pendingAction при выходе
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
