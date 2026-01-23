import React from 'react';
import { AuthProvider, AuthContext } from '../../context/AuthContext';

const AppProviders = ({ children }) => {
    return <AuthProvider>{children}</AuthProvider>;
};

export default AppProviders;

export { AuthContext };
