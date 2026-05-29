/**
 * src/context/AuthContext.tsx
 *
 * Provides the logged-in user globally via React Context.
 * Components read `user` and call `login` / `logout` through `useAuth()`.
 *
 * On mount the context tries to restore the user from localStorage so
 * a page refresh doesn't log the user out.
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from '../types';
import api from '../api/axios';

// ── Shape of the context value ────────────────────────────────────────────────
interface AuthContextType {
  user: User | null;
  isLoading: boolean;           // true while we restore state from localStorage
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
  isAdmin: boolean;
  resendVerificationEmail: (email: string) => Promise<{ message: string }>;
  verifyEmail: (token: string) => Promise<{ message: string }>;
}

// ── Create context (null default forces components to be inside AuthProvider) ─
const AuthContext = createContext<AuthContextType | null>(null);

// ── Provider component ────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore user from localStorage on first render
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
      }
    } catch {
      // Corrupted data — clear it
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((token: string, userData: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('userRole', userData.role || 'CUSTOMER');
    setUser(userData);
  }, []);

  // ✅ Single logout function - properly defined
  const logout = useCallback(async () => {
    try {
      // Optional: Call backend logout endpoint
      const token = localStorage.getItem('token');
      if (token) {
        await api.post('/auth/logout', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all localStorage items
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('userData');
      localStorage.removeItem('userRole');
      
      // Clear user state
      setUser(null);
      
      // Optional: Redirect to login page
      window.location.href = '/login';
    }
  }, []);

  const resendVerificationEmail = useCallback(async (email: string) => {
    const response = await api.post('/auth/resend-verification', { email });
    return response.data;
  }, []);

  const verifyEmail = useCallback(async (token: string) => {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  }, []);

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      logout, 
      isAdmin,
      resendVerificationEmail, 
      verifyEmail 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Custom hook ───────────────────────────────────────────────────────────────
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

export default AuthContext;