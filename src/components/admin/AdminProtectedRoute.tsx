import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

export default function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900" />
      </div>
    );
  }

  // `user` is only set once the session has been matched against the 'admins'
  // whitelist, so a signed-in customer lands here too and gets sent to login.
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
