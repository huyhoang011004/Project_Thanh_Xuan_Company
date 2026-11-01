const TOKEN_KEY = 'tx_admin_token';
const REFRESH_TOKEN_KEY = 'tx_admin_refresh_token';
const USER_KEY = 'tx_admin_user';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  permissions?: string[];
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getStoredUser(): AdminUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveAuthTokens(token: string, refreshToken?: string, user?: AdminUser): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function clearAuthSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
