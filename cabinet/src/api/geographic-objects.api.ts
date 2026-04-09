import api from './axios';
import type { ApiResponse, PaginatedResponse, GeographicObject, Application } from '@/types';
import type { CreateGeographicObjectSchema } from '@/lib/schemas/geographic-object.schema';

export interface RegistryParams {
  page?: number;
  limit?: number;
  search?: string;
  regionId?: number;
  districtId?: number;
  objectTypeId?: number;
  categoryId?: number;
}

export const geographicObjectsApi = {
  getMyObjects: (params?: { page?: number; limit?: number }) =>
    api.get<PaginatedResponse<GeographicObject>>('/geographic-objects', { params }),

  getRegistry: (params?: RegistryParams) =>
    api.get<PaginatedResponse<GeographicObject>>('/geographic-objects/registry', { params }),

  getById: (id: number) =>
    api.get<ApiResponse<GeographicObject>>(`/geographic-objects/${id}`),

  create: (data: CreateGeographicObjectSchema) =>
    api.post<ApiResponse<{ application: Application; geographicObjects: GeographicObject[] }>>(
      '/geographic-objects',
      data,
    ),

  updateRegistryObject: (id: number, data: Partial<GeographicObject>) =>
    api.patch<ApiResponse<GeographicObject>>(`/geographic-objects/${id}`, data),

  deleteRegistryObject: (id: number) =>
    api.delete(`/geographic-objects/${id}`),

  updateNames: (
    applicationId: number,
    objects: Array<{ id: number; nameUz: string; nameKrill?: string; objectTypeId: number }>,
  ) =>
    api.patch<ApiResponse<{ message: string }>>(
      `/geographic-objects/by-application/${applicationId}/names`,
      { objects },
    ),
};
