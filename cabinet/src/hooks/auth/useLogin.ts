import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { App } from 'antd';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/store/authStore';
import type { LoginSchema } from '@/lib/schemas/auth.schema';

type ApiError = {
  response?: {
    status?: number;
    data?: { message?: string };
    headers?: Record<string, string>;
  };
};

export function useLogin() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { message } = App.useApp();
  const [retryAfter, setRetryAfter] = useState<number | null>(null);

  const mutation = useMutation({
    mutationFn: (data: LoginSchema) => authApi.login(data),
    onSuccess: ({ data }) => {
      setAuth(data.data.accessToken, data.data.user);
      void navigate('/');
    },
    onError: (error: ApiError) => {
      if (error.response?.status === 429) {
        const seconds = parseInt(error.response.headers?.['retry-after'] ?? '60');
        setRetryAfter(seconds);
      } else {
        void message.error(error.response?.data?.message ?? 'Xatolik yuz berdi');
      }
    },
  });

  return { ...mutation, retryAfter, clearRetryAfter: () => setRetryAfter(null) };
}
