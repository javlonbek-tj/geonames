import api from './axios';

export interface DiscussionResults {
  id: number;
  endsAt: string;
  supportCount: number;
  opposeCount: number;
  total: number;
}

export const publicDiscussionApi = {
  getResults: (applicationId: number) =>
    api.get<{ data: DiscussionResults | null }>(`/public/discussions/results/${applicationId}`),
};
