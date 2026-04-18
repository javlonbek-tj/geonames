import api from './axios';
import type { ApiResponse, ApiMessage, AuthResponse } from '@/types';
import type { LoginSchema } from '@/lib/schemas/auth.schema';

export const authApi = {
  login: async (data: LoginSchema) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', data),

  logout: () => api.post<ApiMessage>('/auth/logout'),

  me: () => api.get<ApiResponse<AuthResponse>>('/auth/me'),
};
