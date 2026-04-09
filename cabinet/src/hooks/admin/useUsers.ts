import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, type UsersParams, type CreateUserPayload, type UpdateUserPayload } from '@/api/admin.api';

export function useUsers(params?: UsersParams) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => adminApi.getUsers(params).then((r) => r.data),
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserPayload) => adminApi.createUser(data).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
}

export function useUpdateUser(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateUserPayload) => adminApi.updateUser(id, data).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
}

export function useResetPassword(id: number) {
  return useMutation({
    mutationFn: (newPassword: string) => adminApi.resetPassword(id, newPassword),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.deleteUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
}
