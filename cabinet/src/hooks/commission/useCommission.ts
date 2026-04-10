import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import { commissionApi } from '@/api/commission.api';

const keys = {
  approvals: (appId: number) => ['commission-approvals', appId] as const,
};

export function useCommissionApprovals(applicationId: number) {
  return useQuery({
    queryKey: keys.approvals(applicationId),
    queryFn: () => commissionApi.getApprovals(applicationId).then((r) => r.data.data),
    enabled: applicationId > 0,
  });
}

export function useApproveAsCommission(applicationId: number) {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: () => commissionApi.approve(applicationId),
    onSuccess: (res) => {
      void queryClient.invalidateQueries({ queryKey: keys.approvals(applicationId) });
      const { approvedCount, total } = res.data.data;
      void message.success(`Kelishuv qabul qilindi (${approvedCount}/${total})`);
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      void message.error(err.response?.data?.message ?? 'Xatolik yuz berdi');
    },
  });
}

export function useRejectCommission(applicationId: number) {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: (comment: string) => commissionApi.reject(applicationId, comment),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.approvals(applicationId) });
      void message.warning('Rad etildi');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      void message.error(err.response?.data?.message ?? 'Xatolik yuz berdi');
    },
  });
}

export function useRevokeCommissionApproval(applicationId: number) {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: () => commissionApi.revoke(applicationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.approvals(applicationId) });
      void message.success('Kelishuv bekor qilindi');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      void message.error(err.response?.data?.message ?? 'Xatolik yuz berdi');
    },
  });
}
