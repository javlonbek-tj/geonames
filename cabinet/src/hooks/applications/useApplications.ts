import { useQuery } from '@tanstack/react-query';
import { applicationsApi, type ApplicationsParams } from '@/api/applications.api';

export const applicationKeys = {
  all: ['applications'] as const,
  list: (params: ApplicationsParams) => [...applicationKeys.all, 'list', params] as const,
  detail: (id: number) => [...applicationKeys.all, 'detail', id] as const,
  actions: (id: number) => [...applicationKeys.all, 'actions', id] as const,
};

export function useApplications(params: ApplicationsParams = {}) {
  return useQuery({
    queryKey: applicationKeys.list(params),
    queryFn: () => applicationsApi.getAll(params).then((res) => res.data),
  });
}
