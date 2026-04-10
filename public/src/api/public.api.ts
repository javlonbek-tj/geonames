import api from './axios';

export interface DiscussionItem {
  id: number;
  applicationId: number;
  proposedNameUz: string;
  proposedNameKrill: string | null;
  objectType: string;
  category: string | null;
  districtName: string | null;
  endsAt: string;
  voteCount: number;
  myVote: 'support' | 'oppose' | null;
}

export interface VotePayload {
  discussionId: number;
  vote: 'support' | 'oppose';
}

export interface RegistryParams {
  page?: number;
  limit?: number;
  search?: string;
  regionId?: number;
  districtId?: number;
  objectTypeId?: number;
  categoryId?: number;
}

export const publicApi = {
  listDiscussions: () =>
    api.get<{ data: DiscussionItem[] }>('/public/discussions'),

  getDiscussion: (id: number) =>
    api.get<{ data: DiscussionItem }>(`/public/discussions/${id}`),

  submitVote: (payload: VotePayload) =>
    api.post('/public/discussions/vote', payload),

  // Registry & reference data
  getRegistry: (params?: RegistryParams) =>
    api.get<{ data: unknown[]; meta: { total: number; page: number; limit: number } }>(
      '/public/registry',
      { params },
    ),
  getRegions: () =>
    api.get<{ data: { id: number; nameUz: string }[] }>('/public/locations/regions'),
  getDistricts: (regionId?: number) =>
    api.get<{ data: { id: number; nameUz: string; regionId: number }[] }>(
      '/public/locations/districts',
      { params: regionId ? { regionId } : undefined },
    ),
  getCategories: () =>
    api.get<{ data: { id: number; nameUz: string; code: string | null; objectTypes: { id: number; nameUz: string }[] }[] }>(
      '/public/categories',
    ),

  // Telegram OTP auth
  requestOtp: (phone: string) =>
    api.post<{ data: { sessionId: string } }>('/public/auth/otp/request', { phone }),

  verifyOtp: (sessionId: string, code: string) =>
    api.post<{ data: { accessToken: string; citizen: import('../store/citizenStore').Citizen } }>(
      '/public/auth/otp/verify',
      { sessionId, code },
    ),
};
