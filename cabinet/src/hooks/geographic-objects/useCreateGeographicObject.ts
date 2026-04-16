import { useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import { useNavigate } from 'react-router';
import { geographicObjectsApi } from '@/api/geographic-objects.api';
import { applicationKeys } from '@/hooks/applications/useApplications';

export function useCreateGeographicObject() {
  const queryClient = useQueryClient();
  const { message } = App.useApp();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: geographicObjectsApi.create,
    onSuccess: ({ data }) => {
      void queryClient.invalidateQueries({ queryKey: applicationKeys.all });
      void message.success('Geografik obyekt yaratildi');
      void navigate('/applications');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      void message.error(error.response?.data?.message ?? 'Xatolik yuz berdi');
    },
  });
}
