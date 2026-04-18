import api from './axios';
import type { PaginatedResponse, ApiResponse, ApiMessage, User } from '@/types';

export interface UsersParams {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
}

export interface CreateUserPayload {
  username: string;
  password: string;
  fullName?: string;
  role: string;
  regionId?: number;
  districtId?: number;
  position?: string;
}

export interface UpdateUserPayload {
  fullName?: string;
  role?: string;
  regionId?: number | null;
  districtId?: number | null;
  isActive?: boolean;
  isBlocked?: boolean;
}

export interface CategoryPayload {
  code: string;
  nameUz: string;
  nameKrill?: string;
}
export interface TypePayload {
  nameUz: string;
  nameKrill?: string;
  categoryId: number;
}

export const adminApi = {
  getUsers: (params?: UsersParams) =>
    api.get<PaginatedResponse<User>>('/admin/users', { params }),

  getUserById: (id: number) => api.get<ApiResponse<User>>(`/admin/users/${id}`),

  createUser: (data: CreateUserPayload) =>
    api.post<ApiResponse<User>>('/admin/users', data),

  updateUser: (id: number, data: UpdateUserPayload) =>
    api.patch<ApiResponse<User>>(`/admin/users/${id}`, data),

  resetPassword: (id: number, newPassword: string) =>
    api.patch<ApiMessage>(`/admin/users/${id}/reset-password`, { newPassword }),

  deleteUser: (id: number) => api.delete<ApiMessage>(`/admin/users/${id}`),

  // Categories
  getCategories: () =>
    api.get<ApiResponse<import('@/types').ObjectCategory[]>>(
      '/admin/object-categories',
    ),
  createCategory: (data: CategoryPayload) =>
    api.post<ApiResponse<import('@/types').ObjectCategory>>(
      '/admin/object-categories',
      data,
    ),
  updateCategory: (id: number, data: CategoryPayload) =>
    api.patch<ApiResponse<import('@/types').ObjectCategory>>(
      `/admin/object-categories/${id}`,
      data,
    ),
  deleteCategory: (id: number) =>
    api.delete<ApiMessage>(`/admin/object-categories/${id}`),

  // Types
  getTypes: (categoryId?: number) =>
    api.get<ApiResponse<import('@/types').ObjectType[]>>(
      '/admin/object-types',
      { params: categoryId ? { categoryId } : undefined },
    ),
  createType: (data: TypePayload) =>
    api.post<ApiResponse<import('@/types').ObjectType>>(
      '/admin/object-types',
      data,
    ),
  updateType: (id: number, data: Partial<TypePayload>) =>
    api.patch<ApiResponse<import('@/types').ObjectType>>(
      `/admin/object-types/${id}`,
      data,
    ),
  deleteType: (id: number) =>
    api.delete<ApiMessage>(`/admin/object-types/${id}`),
};
