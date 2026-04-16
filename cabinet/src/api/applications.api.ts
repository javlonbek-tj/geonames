import api from './axios';
import type { PaginatedResponse, ApiResponse, Application, AvailableAction } from '@/types';

export interface ApplicationsParams {
  page?: number;
  limit?: number;
  status?: string;
  tab?: 'active' | 'history';
  applicationNumber?: string;
  regionId?: number;
  districtId?: number;
}

export const applicationsApi = {
  getAll: (params?: ApplicationsParams) =>
    api.get<PaginatedResponse<Application>>('/applications', { params }),

  getById: (id: number) =>
    api.get<ApiResponse<Application>>(`/applications/${id}`),

  getAvailableActions: (id: number) =>
    api.get<ApiResponse<AvailableAction[]>>(`/applications/${id}/actions`),

  performAction: (id: number, data: { action: string; comment?: string; attachments?: string[] }) =>
    api.post<ApiResponse<Application>>(`/applications/${id}/action`, data),
};
