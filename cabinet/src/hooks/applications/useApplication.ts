import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import { applicationsApi } from '@/api/applications.api';
import { applicationKeys } from './useApplications';

export function useApplication(id: number) {
  return useQuery({
    queryKey: applicationKeys.detail(id),
    queryFn: () => applicationsApi.getById(id).then((res) => res.data.data),
    enabled: !!id,
  });
}

export function useAvailableActions(id: number) {
  return useQuery({
    queryKey: applicationKeys.actions(id),
    queryFn: () => applicationsApi.getAvailableActions(id).then((res) => res.data.data),
    enabled: !!id,
  });
}

export function usePerformAction(id: number) {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: (data: { action: string; comment?: string }) =>
      applicationsApi.performAction(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: applicationKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: applicationKeys.actions(id) });
      void queryClient.invalidateQueries({ queryKey: applicationKeys.all });
      void message.success("Harakat muvaffaqiyatli bajarildi");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      void message.error(error.response?.data?.message ?? 'Xatolik yuz berdi');
    },
  });
}
