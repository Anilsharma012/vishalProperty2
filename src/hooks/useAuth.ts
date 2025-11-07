import { useAuthApi } from './useAuthApi';

// Re-export the API-based auth hook as useAuth for backward compatibility
export const useAuth = () => {
  const { user, loading, error, login, logout, isAuthenticated } = useAuthApi();

  return {
    user,
    isLoading: loading,
    error,
    login,
    logout,
    isAuthenticated
  };
};
