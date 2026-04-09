import { useQuery } from '@tanstack/react-query';
import { locationsApi } from '@/api/locations.api';

export function useRegions() {
  return useQuery({
    queryKey: ['regions'],
    queryFn: () => locationsApi.getRegions().then((r) => r.data.data),
    staleTime: Infinity,
  });
}

export function useDistricts(regionId?: number) {
  return useQuery({
    queryKey: ['districts', regionId],
    queryFn: () => locationsApi.getDistricts(regionId).then((r) => r.data.data),
    enabled: !!regionId,
    staleTime: Infinity,
  });
}

export function useAllDistricts() {
  return useQuery({
    queryKey: ['districts', 'all'],
    queryFn: () => locationsApi.getDistricts().then((r) => r.data.data),
    staleTime: Infinity,
  });
}
