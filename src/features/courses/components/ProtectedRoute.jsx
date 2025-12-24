// components/ProtectedRoute.js
import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '@app/providers';

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (!user) {
    sessionStorage.setItem('redirectAfterAuth', location.pathname);
    return <Navigate to="/register" state={{ from: location.pathname }} replace />;
  }

  return children;
};

export default ProtectedRoute;