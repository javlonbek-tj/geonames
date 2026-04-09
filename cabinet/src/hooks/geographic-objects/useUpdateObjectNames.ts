import { useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import { geographicObjectsApi } from '@/api/geographic-objects.api';
import { applicationKeys } from '@/hooks/applications/useApplications';

export function useUpdateObjectNames(applicationId: number) {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: (objects: Array<{ id: number; nameUz: string; nameKrill?: string; objectTypeId: number }>) =>
      geographicObjectsApi.updateNames(applicationId, objects),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: applicationKeys.detail(applicationId) });
      void message.success('Nomlar saqlandi');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      void message.error(error.response?.data?.message ?? 'Xatolik yuz berdi');
    },
  });
}
