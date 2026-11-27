import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import {
  useAuthStore,
  isJwtExpired,
  hasAllowedRole,
  getDefaultRouteForRole,
  normalizeRole,
} from '@/shared/store/useAuthStore';
import { useT } from '@/shared/i18n';

interface ProtectedRouteProps {
  children: React.ReactNode;
  superadminOnly?: boolean;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  superadminOnly = false,
  allowedRoles,
}) => {
  const location = useLocation();
  const { t } = useT();
  const {
    isAuthenticated,
    user,
    accessToken,
    isVerifying,
    hasVerifiedSession,
    verifySession,
  } = useAuthStore();

  useEffect(() => {
    if (!hasVerifiedSession && !isVerifying) {
      void verifySession();
    }
  }, [hasVerifiedSession, isVerifying, verifySession]);

  if (!accessToken || isJwtExpired(accessToken)) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!hasVerifiedSession || isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3 text-slate-600 text-sm font-medium">
          <div className="w-8 h-8 border-2 border-[#0D9488] border-t-transparent rounded-full animate-spin" />
          <span>{t('common.verifying')}</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const normalized = normalizeRole(user.role);

  if (superadminOnly && normalized !== 'superadmin') {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  if (!superadminOnly && normalized === 'superadmin' && !user.tenantId) {
    return <Navigate to="/superadmin" replace />;
  }

  if (!superadminOnly && allowedRoles && !hasAllowedRole(user.role, allowedRoles)) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  return <>{children}</>;
};
