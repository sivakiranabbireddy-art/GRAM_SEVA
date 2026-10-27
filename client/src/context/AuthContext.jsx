import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('gramseva_token'));
  const [loading, setLoading] = useState(true);

  // Fetch current user details on mount if token exists
  const fetchCurrentUser = useCallback(async () => {
    const savedToken = localStorage.getItem('gramseva_token');
    if (!savedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await api.get('/auth/me');
      if (data.success && data.user) {
        setUser(data.user);
      } else {
        logout();
      }
    } catch (err) {
      console.warn('Authentication token expired or invalid:', err.message);
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const saveAuthSession = (newToken, newUser) => {
    localStorage.setItem('gramseva_token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const login = async (email, password, requestedRole) => {
    const data = await api.post('/auth/login', { email, password, requestedRole });
    if (data.success) {
      saveAuthSession(data.token, data.user);
    }
    return data;
  };

  const adminLogin = async (email, password) => {
    const data = await api.post('/auth/admin-login', { email, password });
    if (data.success) {
      saveAuthSession(data.token, data.user);
    }
    return data;
  };

  const registerCustomer = async (formData) => {
    const data = await api.post('/auth/register-customer', formData);
    if (data.success && data.token) {
      saveAuthSession(data.token, data.user);
    }
    return data;
  };

  const registerWorker = async (formData) => {
    const data = await api.post('/auth/register-worker', formData);
    if (data.success && data.token) {
      saveAuthSession(data.token, data.user);
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('gramseva_token');
    setToken(null);
    setUser(null);
  };

  const refreshProfile = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user ? user.role : null,
        loading,
        login,
        adminLogin,
        registerCustomer,
        registerWorker,
        logout,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
