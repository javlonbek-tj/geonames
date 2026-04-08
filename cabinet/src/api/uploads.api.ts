import api from './axios';
import type { ApiResponse, ApiMessage, Document } from '@/types';

export const uploadsApi = {
  getDocuments: (applicationId: number) =>
    api.get<ApiResponse<Document[]>>(`/uploads/applications/${applicationId}`),

  uploadDocument: (applicationId: number, file: File, documentType?: string) => {
    const form = new FormData();
    form.append('file', file);
    if (documentType) form.append('documentType', documentType);
    return api.post<ApiResponse<Document>>(
      `/uploads/applications/${applicationId}`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
  },

  deleteDocument: (documentId: number) =>
    api.delete<ApiMessage>(`/uploads/documents/${documentId}`),
};
