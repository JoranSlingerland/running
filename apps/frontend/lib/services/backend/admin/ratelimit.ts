import { RateLimitStatus } from '@repo/types';

import { useFetch } from '@hooks/useFetch';

function useRateLimitStatus({ enabled = true }: { enabled?: boolean }) {
  return useFetch<undefined, undefined, RateLimitStatus>({
    url: '/api/admin/strava/rateLimit/',
    method: 'GET',
    enabled,
  });
}

export { useRateLimitStatus };
