import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, profile, loading, isSuperAdmin, isAdmin, isCouncil, isMinistryLeader, isMediaTeam } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-maroon"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (profile) {
    // If user is pending, they can only access the pending-approval page
    if (profile.status === 'pending') {
      return <Navigate to="/pending-approval" replace />;
    }

    // Super Admin and Admins have access to everything protected
    if (isSuperAdmin || isAdmin) {
      return <Outlet />;
    }

    // Check specific role permissions if provided
    if (allowedRoles) {
      const hasRoleAccess = allowedRoles.some(role => {
        if (role === 'council' && (isCouncil || isAdmin)) return true;
        if (role === 'ministry_leader' && (isMinistryLeader || isAdmin)) return true;
        if (role === 'media' && (isMediaTeam || isAdmin)) return true;
        const userRoles = Array.isArray(profile.role) ? profile.role : [profile.role];
        return userRoles.includes(role as any);
      });

      if (!hasRoleAccess) {
        return <Navigate to="/member/dashboard" replace />;
      }
    }
    
    return <Outlet />;
  }

  // If we're here, user is logged in but profile hasn't loaded yet
  // We should wait for profile or redirect if it's missing for too long
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-maroon"></div>
    </div>
  );
}
