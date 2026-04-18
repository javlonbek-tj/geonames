import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import {
  adminApi,
  type CategoryPayload,
  type TypePayload,
} from '@/api/admin.api';

type ApiError = { response?: { data?: { message?: string } } };

const KEY = ['admin', 'object-types'];

export function useAdminCategories() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => adminApi.getCategories().then((r) => r.data.data),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: (data: CategoryPayload) =>
      adminApi.createCategory(data).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    onError: (error: ApiError) => {
      void message.error(error.response?.data?.message ?? 'Xatolik yuz berdi');
    },
  });
}

export function useUpdateCategory(id: number) {
  const qc = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: (data: CategoryPayload) =>
      adminApi.updateCategory(id, data).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    onError: (error: ApiError) => {
      void message.error(error.response?.data?.message ?? 'Xatolik yuz berdi');
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: (id: number) => adminApi.deleteCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    onError: (error: ApiError) => {
      void message.error(error.response?.data?.message ?? 'Xatolik yuz berdi');
    },
  });
}

export function useCreateType() {
  const qc = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: (data: TypePayload) =>
      adminApi.createType(data).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    onError: (error: ApiError) => {
      void message.error(error.response?.data?.message ?? 'Xatolik yuz berdi');
    },
  });
}

export function useUpdateType(id: number) {
  const qc = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: (data: Partial<TypePayload>) =>
      adminApi.updateType(id, data).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    onError: (error: ApiError) => {
      void message.error(error.response?.data?.message ?? 'Xatolik yuz berdi');
    },
  });
}

export function useDeleteType() {
  const qc = useQueryClient();
  const { message } = App.useApp();
  return useMutation({
    mutationFn: (id: number) => adminApi.deleteType(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    onError: (error: ApiError) => {
      void message.error(error.response?.data?.message ?? 'Xatolik yuz berdi');
    },
  });
}
