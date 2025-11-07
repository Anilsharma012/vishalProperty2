import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { useNavigate } from 'react-router-dom';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'blocked';
  phone?: string;
  createdAt: string;
}

export const useAuthApi = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      api.setToken(token);
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const response = await api.getCurrentUser();
      setUser(response.user);
      setError(null);
    } catch (err) {
      localStorage.removeItem('auth_token');
      api.clearToken();
      setUser(null);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.userLogin(email, password);
      api.setToken(response.token);
      setUser(response.user);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const adminLogin = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.adminLogin(email, password);
      api.setToken(response.token);
      setUser(response.user);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, phone: string, password: string, confirmPassword: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.userSignup(name, email, phone, password, confirmPassword);
      api.setToken(response.token);
      setUser(response.user);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
      setUser(null);
      setError(null);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    user,
    loading,
    error,
    login,
    adminLogin,
    signup,
    logout,
    isAuthenticated: !!user
  };
};
