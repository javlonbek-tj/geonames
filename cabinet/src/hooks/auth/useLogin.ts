import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { App } from 'antd';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/store/authStore';
import type { LoginSchema } from '@/lib/schemas/auth.schema';

export function useLogin() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { message } = App.useApp();

  return useMutation({
    mutationFn: (data: LoginSchema) => authApi.login(data),
    onSuccess: ({ data }) => {
      setAuth(data.data.accessToken, data.data.user);
      void navigate('/');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      void message.error(error.response?.data?.message ?? 'Xatolik yuz berdi');
    },
  });
}
