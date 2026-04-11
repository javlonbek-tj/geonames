import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/api/geo-flags.api';

export function useApplicationFlags(applicationId: number) {
  return useQuery({
    queryKey: ['geo-flags', applicationId],
    queryFn: () => api.getApplicationFlags(applicationId),
    enabled: applicationId > 0,
  });
}

export function useToggleGeoFlag(applicationId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      geoObjectId,
      comment,
    }: {
      geoObjectId: number;
      comment?: string;
    }) => api.toggleGeoFlag(applicationId, geoObjectId, comment),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['geo-flags', applicationId] });
    },
  });
}

export function useNonCompliantList() {
  return useQuery({
    queryKey: ['non-compliant'],
    queryFn: api.listNonCompliant,
  });
}
