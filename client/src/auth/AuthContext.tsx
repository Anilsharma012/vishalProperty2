import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

type User = { id: string; name: string; email: string; role: 'admin'|'user'; status: 'active'|'blocked' } | null;

type Ctx = {
  user: User;
  token: string | null;
  setAuth: (u: User, t: string | null) => void;
  logout: () => Promise<void>;
};

const AuthCtx = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      api.get('/auth/me', { withCredentials: true, headers: token ? { Authorization: `Bearer ${token}` } : {} })
        .then(r => setUser(r.data.user))
        .catch(() => {});
    }
  }, []);

  const setAuth = (u: User, t: string | null) => {
    setUser(u);
    setToken(t);
    if (t) localStorage.setItem('token', t); else localStorage.removeItem('token');
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setAuth(null, null);
    navigate('/');
  };

  return <AuthCtx.Provider value={{ user, token, setAuth, logout }}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('AuthContext missing');
  return ctx;
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <div className="p-6">Please log in.</div>;
  return <>{children}</>;
}

export function RequireRole({ children, role }: { children: React.ReactNode; role: 'admin'|'user' }) {
  const { user } = useAuth();
  if (!user || user.role !== role) return <div className="p-6">Access denied.</div>;
  return <>{children}</>;
}
