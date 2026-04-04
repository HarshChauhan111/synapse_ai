import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/backend';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (authAPI.isAuthenticated()) {
        try {
          const data = await authAPI.me();
          setUser(data.user);
        } catch (err) {
          console.error('Auth check failed:', err);
          authAPI.logout();
        }
      }
      setLoading(false);
    };

    checkAuth();

    // Listen for logout events
    const handleLogout = () => {
      setUser(null);
    };

    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const register = useCallback(async (email, password, name) => {
    setError(null);
    try {
      const data = await authAPI.register(email, password, name);
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const data = await authAPI.login(email, password);
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    authAPI.logout();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (updates) => {
    try {
      const data = await authAPI.updateProfile(updates);
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    updateProfile,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
