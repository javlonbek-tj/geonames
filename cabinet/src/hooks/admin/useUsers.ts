import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import { adminApi, type UsersParams, type CreateUserPayload, type UpdateUserPayload } from '@/api/admin.api';

type ApiError = { response?: { data?: { message?: string } } };

export function useUsers(params?: UsersParams) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => adminApi.getUsers(params).then((r) => r.data),
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: (data: CreateUserPayload) => adminApi.createUser(data).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
    onError: (error: ApiError) => {
      void message.error(error.response?.data?.message ?? 'Xatolik yuz berdi');
    },
  });
}

export function useUpdateUser(id: number) {
  const qc = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: (data: UpdateUserPayload) => adminApi.updateUser(id, data).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
    onError: (error: ApiError) => {
      void message.error(error.response?.data?.message ?? 'Xatolik yuz berdi');
    },
  });
}

export function useResetPassword(id: number) {
  const { message } = App.useApp();
  return useMutation({
    mutationFn: (newPassword: string) => adminApi.resetPassword(id, newPassword),
    onError: (error: ApiError) => {
      void message.error(error.response?.data?.message ?? 'Xatolik yuz berdi');
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: (id: number) => adminApi.deleteUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
    onError: (error: ApiError) => {
      void message.error(error.response?.data?.message ?? 'Xatolik yuz berdi');
    },
  });
}
