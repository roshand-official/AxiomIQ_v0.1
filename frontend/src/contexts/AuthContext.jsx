// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

const DEMO_CREDENTIALS = {
  admin: { email: 'admin@axiomiq.io', password: 'Password@123' },
  staff: { email: 'rahul.verma@axiomiq.io', password: 'Password@123' },
  customer: { email: 'rajesh@apexsolutions.in', password: 'Password@123' },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check existing token on initial load
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('axiomiq_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.auth.getMe();
        if (response?.data) {
          setUser({
            ...response.data,
            name: `${response.data.firstName || ''} ${response.data.lastName || ''}`.trim() || response.data.email,
            role: response.data.role?.toLowerCase(),
          });
        }
      } catch (err) {
        console.warn('Session expired or backend unavailable:', err.message);
        localStorage.removeItem('axiomiq_token');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      const res = await api.auth.login(email, password);
      if (res?.data?.token) {
        localStorage.setItem('axiomiq_token', res.data.token);
        const profile = {
          ...res.data.user,
          name: `${res.data.user.firstName || ''} ${res.data.user.lastName || ''}`.trim() || res.data.user.email,
          role: res.data.user.role?.toLowerCase(),
        };
        setUser(profile);
        window.dispatchEvent(new Event('axiomiq_auth_change'));
        return { success: true, user: profile };
      }
      return { success: false, error: 'Authentication failed' };
    } catch (err) {
      // Fallback for mock demo entry if backend is not reachable
      const fallbackUser = {
        id: 'USR-001',
        name: 'Vikram Aditya',
        email,
        role: email.includes('admin') ? 'admin' : email.includes('staff') ? 'staff' : 'customer',
      };
      setUser(fallbackUser);
      return { success: true, user: fallbackUser, isFallback: true };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginAsRole = useCallback(async (role) => {
    const creds = DEMO_CREDENTIALS[role.toLowerCase()] || DEMO_CREDENTIALS.admin;
    return login(creds.email, creds.password);
  }, [login]);

  const logout = useCallback(() => {
    localStorage.removeItem('axiomiq_token');
    setUser(null);
    window.dispatchEvent(new Event('axiomiq_auth_change'));
  }, []);

  const switchRole = useCallback(async (role) => {
    return loginAsRole(role);
  }, [loginAsRole]);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    loginAsRole,
    logout,
    switchRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
