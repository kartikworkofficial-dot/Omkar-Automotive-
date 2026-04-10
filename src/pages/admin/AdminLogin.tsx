import { useAuth } from '@/src/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/src/components/ui/button';

export function AdminLogin() {
  const { user, isAdmin, loading, login } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (user && isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="pt-32 pb-24 min-h-screen bg-light flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-steel/20 max-w-md w-full text-center">
        <h1 className="text-3xl font-display font-bold text-darker mb-4">Admin Login</h1>
        <p className="text-dark mb-8">Sign in with your authorized Google account to access the blog management system.</p>
        
        {user && !isAdmin && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm">
            You do not have admin permissions. Please contact the site owner.
          </div>
        )}

        <Button onClick={login} className="w-full py-6 text-lg">
          Sign In with Google
        </Button>
      </div>
    </main>
  );
}
