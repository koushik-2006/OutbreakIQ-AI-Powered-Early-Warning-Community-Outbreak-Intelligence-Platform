import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types/auth';
import { LoadingState } from '../components/common/LoadingState';
import { ShieldAlert } from 'lucide-react';
import { Button } from '../components/common/Button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <LoadingState message="Authenticating Session..." subMessage="Verifying credentials and security role" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center p-8 text-center glass-card rounded-3xl border-rose-500/20 max-w-lg mx-auto my-12">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 shadow-sm shadow-rose-950">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Access Restricted</h2>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          Your current role (<span className="text-brand-cyan font-mono capitalize">{user.role.replace('_', ' ')}</span>) does not have authorization to modify or view this module.
        </p>
        <Button variant="outline" onClick={() => window.history.back()}>
          Return to Previous Page
        </Button>
      </div>
    );
  }

  return <>{children}</>;
};

export const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
