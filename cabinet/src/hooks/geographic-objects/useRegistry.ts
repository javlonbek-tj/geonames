import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { geographicObjectsApi, type RegistryParams } from '@/api/geographic-objects.api';
import type { GeographicObject } from '@/types';

export function useRegistry(params: RegistryParams) {
  return useQuery({
    queryKey: ['registry', params],
    queryFn: () => geographicObjectsApi.getRegistry(params).then((r) => r.data),
    placeholderData: (prev) => prev,
  });
}

export function useUpdateRegistryObject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<GeographicObject> }) =>
      geographicObjectsApi.updateRegistryObject(id, data).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['registry'] }),
  });
}

export function useDeleteRegistryObject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => geographicObjectsApi.deleteRegistryObject(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['registry'] }),
  });
}
