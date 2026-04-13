import { useQuery } from '@tanstack/react-query';
import { mapApi } from '@/api/map.api';

export function useMapRegions() {
  return useQuery({
    queryKey: ['map', 'regions'],
    queryFn: () => mapApi.getRegions().then((r) => r.data.data),
    staleTime: Infinity,
  });
}

export function useMapDistricts(regionId: number | null) {
  return useQuery({
    queryKey: ['map', 'districts', regionId],
    queryFn: () => mapApi.getDistricts(regionId!).then((r) => r.data.data),
    enabled: regionId !== null,
    staleTime: 10 * 60 * 1000,
  });
}

export function useMapDistrictObjects(districtId: number | null) {
  return useQuery({
    queryKey: ['map', 'district-objects', districtId],
    queryFn: () => mapApi.getDistrictObjects(districtId!).then((r) => r.data.data),
    enabled: districtId !== null,
    staleTime: 5 * 60 * 1000,
  });
}
