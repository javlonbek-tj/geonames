import { useQuery } from '@tanstack/react-query';
import { geographicObjectsApi } from '@/api/geographic-objects.api';

export function useGeographicObject(id: number) {
  return useQuery({
    queryKey: ['geographic-object', id],
    queryFn: () => geographicObjectsApi.getById(id).then((r) => r.data.data),
    enabled: !!id,
  });
}
