import api from './axios';
import type { ApiResponse, PaginatedResponse, GeographicObject, Application } from '@/types';
import type { CreateGeographicObjectSchema } from '@/lib/schemas/geographic-object.schema';

export const geographicObjectsApi = {
  getMyObjects: (params?: { page?: number; limit?: number }) =>
    api.get<PaginatedResponse<GeographicObject>>('/geographic-objects', { params }),

  getById: (id: number) =>
    api.get<ApiResponse<GeographicObject>>(`/geographic-objects/${id}`),

  create: (data: CreateGeographicObjectSchema) =>
    api.post<ApiResponse<{ application: Application; geographicObjects: GeographicObject[] }>>(
      '/geographic-objects',
      data,
    ),
};
