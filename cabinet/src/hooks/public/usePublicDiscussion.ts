import { useQuery } from '@tanstack/react-query';
import { publicDiscussionApi } from '@/api/public-discussion.api';

export function useDiscussionResults(applicationId: number, enabled: boolean) {
  return useQuery({
    queryKey: ['discussion-results', applicationId],
    queryFn: () => publicDiscussionApi.getResults(applicationId).then((r) => r.data.data),
    enabled: enabled && applicationId > 0,
  });
}
