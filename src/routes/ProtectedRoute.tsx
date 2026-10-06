import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { Role } from '../types/domain';

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="grid min-h-screen place-items-center bg-slate-50 text-slate-500">A validar sessão...</div>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

export function RoleRoute({ roles }: { roles: Role[] }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return roles.includes(user.role) ? <Outlet /> : <Navigate to={user.role === 'CLIENTE' ? '/portal' : '/dashboard'} replace />;
}

export function StaffRoute() { return <RoleRoute roles={['ADMIN_GLOBAL', 'MINI_ADMIN', 'GESTOR']} />; }
export function CustomerRoute() { return <RoleRoute roles={['CLIENTE']} />; }
