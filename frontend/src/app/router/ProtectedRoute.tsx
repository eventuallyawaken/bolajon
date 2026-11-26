import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/shared/store/useAuthStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  superadminOnly?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, superadminOnly = false }) => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (superadminOnly && user.role !== 'superadmin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
