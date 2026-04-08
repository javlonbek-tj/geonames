import api from './axios';
import type { ApiResponse, ObjectCategory, ObjectType } from '@/types';

export const objectTypesApi = {
  getCategories: () =>
    api.get<ApiResponse<ObjectCategory[]>>('/admin/object-categories'),

  getTypes: (categoryId?: number) =>
    api.get<ApiResponse<ObjectType[]>>('/admin/object-types', {
      params: categoryId ? { categoryId } : undefined,
    }),
};
