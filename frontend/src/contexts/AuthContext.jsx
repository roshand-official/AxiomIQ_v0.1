// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useCallback } from 'react';
import { mockUsers } from '../data/mockData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    // Simulate network delay
    await new Promise(r => setTimeout(r, 800));
    const found = mockUsers.find(u => u.email === email && u.password === password);
    setIsLoading(false);
    if (found) {
      const sessionUser = { ...found };
      delete sessionUser.password;
      setUser(sessionUser);
      return { success: true, user: sessionUser };
    }
    return { success: false, error: 'Invalid email or password' };
  }, []);

  const loginAsRole = useCallback(async (role) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const found = mockUsers.find(u => u.role === role);
    setIsLoading(false);
    if (found) {
      const sessionUser = { ...found };
      delete sessionUser.password;
      setUser(sessionUser);
      return { success: true, user: sessionUser };
    }
    return { success: false, error: 'Role not found' };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
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
