import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient, getErrorMessage } from '@/lib/api-client';
import {
  AdminUser,
  getStoredToken,
  getStoredUser,
  saveAuthTokens,
  clearAuthSession,
} from '@/lib/auth-storage';

interface AuthContextValue {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, pass: string) => Promise<AdminUser>;
  logout: () => void;
  updateUser: (updated: Partial<AdminUser>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(() => getStoredUser());
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const activeToken = getStoredToken();
      if (!activeToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await apiClient.get<{ user?: AdminUser; _id?: string; username?: string; role?: string; name?: string; email?: string }>('/auth/me');
        const raw = res.data;
        const normalized: AdminUser = {
          id: raw?.user?.id || raw?._id || '',
          name: raw?.user?.name || raw?.name || raw?.username || 'Quản trị viên',
          email: raw?.user?.email || raw?.email || '',
          role: raw?.user?.role || raw?.role || 'ADMIN',
          avatar: raw?.user?.avatar,
        };
        setUser(normalized);
      } catch {
        // If /auth/me fails, keep stored session or clear if 401
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (username: string, pass: string): Promise<AdminUser> => {
    try {
      const res = await apiClient.post<{
        access_token: string;
        refresh_token: string;
        user: { _id: string; username: string; role: string; name?: string; email?: string };
      }>('/auth/login', {
        username,
        password: pass,
      });

      const resData = res.data;
      const accessToken = resData.access_token;
      const refreshToken = resData.refresh_token;
      const u = resData.user;

      const normalized: AdminUser = {
        id: u._id,
        name: u.name || u.username,
        email: u.email || '',
        role: u.role,
      };

      setToken(accessToken);
      setUser(normalized);
      saveAuthTokens(accessToken, refreshToken, normalized);

      return normalized;
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err));
    }
  };

  const logout = () => {
    clearAuthSession();
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  const updateUser = (updated: Partial<AdminUser>) => {
    setUser((prev) => {
      if (!prev) return null;
      const next = { ...prev, ...updated };
      saveAuthTokens(token || '', undefined, next);
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
