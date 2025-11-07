import { Link } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Button } from '@/components/ui/button';
import { LogOut, Home, Settings } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useSupabaseAuth();

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      window.location.href = '/';
    }
  };

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-blue-600 flex items-center gap-2">
          <Home size={24} />
          Vishal Properties
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/connect-supabase" className="text-gray-700 hover:text-blue-600 text-sm font-medium">
            Supabase Test
          </Link>
          <Link to="/properties" className="text-gray-700 hover:text-blue-600 text-sm font-medium">
            Browse Properties
          </Link>

          {user ? (
            <>
              <Link to="/admin/properties" className="text-gray-700 hover:text-blue-600 text-sm font-medium flex items-center gap-1">
                <Settings size={16} />
                Admin
              </Link>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="gap-2"
              >
                <LogOut size={16} />
                Logout
              </Button>
            </>
          ) : (
            <Link to="/admin/login">
              <Button size="sm">Admin Login</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
