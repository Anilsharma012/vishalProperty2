import { useEffect, useState } from 'react';
import api from '@/lib/api';

export type AuthUser = { id: string; name: string; email: string; role: 'admin'|'user'; status: 'active'|'blocked' } | null;

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;
    api.get('/auth/me').then(r => {
      if (!mounted) return;
      setUser(r.data.user);
      setIsAdmin(r.data.user?.role === 'admin');
    }).catch(() => {
      if (!mounted) return;
      setUser(null);
      setIsAdmin(false);
    }).finally(() => setLoading(false));
    return () => { mounted = false; };
  }, []);

  const signOut = async () => {
    await api.post('/auth/logout');
    setUser(null);
    setIsAdmin(false);
  };

  return { user, loading, isAdmin, signOut };
};
