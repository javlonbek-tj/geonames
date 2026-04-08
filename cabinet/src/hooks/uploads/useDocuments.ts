import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import { uploadsApi } from '@/api/uploads.api';

const documentKeys = {
  list: (applicationId: number) => ['documents', applicationId] as const,
};

export function useDocuments(applicationId: number) {
  return useQuery({
    queryKey: documentKeys.list(applicationId),
    queryFn: () => uploadsApi.getDocuments(applicationId).then((res) => res.data.data),
    enabled: !!applicationId,
  });
}

export function useUploadDocument(applicationId: number) {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: ({ file, documentType }: { file: File; documentType?: string }) =>
      uploadsApi.uploadDocument(applicationId, file, documentType),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: documentKeys.list(applicationId) });
      void message.success('Fayl yuklandi');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      void message.error(error.response?.data?.message ?? 'Yuklashda xatolik');
    },
  });
}

export function useDeleteDocument(applicationId: number) {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: (documentId: number) => uploadsApi.deleteDocument(documentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: documentKeys.list(applicationId) });
      void message.success("Fayl o'chirildi");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      void message.error(error.response?.data?.message ?? 'Xatolik yuz berdi');
    },
  });
}
