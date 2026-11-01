import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
  getStoredToken,
  getStoredRefreshToken,
  getStoredUser,
  saveAuthTokens,
  clearAuthSession,
} from './auth-storage';
import { getStoredTenant } from './tenant-storage';

const API_BASE = import.meta.env.VITE_API_URL || '';

export const apiClient = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request Interceptor: Đính kèm JWT Bearer Token & Multi-Tenant Header
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Luôn gửi tenant hiện tại qua header x-tenant-id
    const currentTenant = getStoredTenant();
    config.headers['x-tenant-id'] = currentTenant;

    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Tự động unwrapping ApiResponse { success, data }
apiClient.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body && typeof body === 'object' && body.success === true && 'data' in body) {
      response.data = body.data;
    }
    return response;
  },
  async (error: AxiosError<{ message?: string | string[]; error?: string; statusCode?: number }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const reqUrl = originalRequest.url || '';
      if (reqUrl.includes('/auth/login') || reqUrl.includes('/auth/refresh')) {
        clearAuthSession();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      const refreshToken = getStoredRefreshToken();
      const currentUser = getStoredUser();
      const userId = currentUser?.id;

      if (!refreshToken || !userId) {
        clearAuthSession();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      try {
        const refreshResponse = await axios.post<{
          success?: boolean;
          data?: { access_token?: string; refresh_token?: string; accessToken?: string; refreshToken?: string };
          access_token?: string;
          refresh_token?: string;
          accessToken?: string;
          refreshToken?: string;
        }>(`${API_BASE}/api/auth/refresh`, {
          userId,
          refreshToken,
        });

        const resData = refreshResponse.data?.data || refreshResponse.data;
        const newAccessToken = resData?.access_token || resData?.accessToken;
        const newRefreshToken = resData?.refresh_token || resData?.refreshToken || refreshToken;

        if (newAccessToken) {
          saveAuthTokens(newAccessToken, newRefreshToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        }
      } catch {
        clearAuthSession();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as Record<string, unknown> | undefined;
    if (data?.message) {
      if (Array.isArray(data.message)) {
        return data.message.join(', ');
      }
      return String(data.message);
    }
    if (error.response?.status === 401) {
      return 'Tài khoản chưa đăng nhập hoặc phiên làm việc đã hết hạn.';
    }
    if (error.response?.status === 403) {
      return 'Bạn không có quyền thực hiện thao tác này.';
    }
    if (error.response?.status === 404) {
      return 'Không tìm thấy dữ liệu yêu cầu.';
    }
    if (error.response?.status === 500) {
      return 'Máy chủ gặp sự cố nội bộ. Vui lòng thử lại sau.';
    }
    return error.message || 'Lỗi kết nối máy chủ.';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Đã có lỗi không xác định xảy ra.';
}
