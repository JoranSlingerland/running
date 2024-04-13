import { Activity } from '@repo/types';

import { useFetch } from '@hooks/useFetch';

interface GetActivityQuery {
  id: string | 'latest';
}

function useActivity({
  query,
  enabled = true,
  background = false,
}: {
  query: GetActivityQuery;
  enabled?: boolean;
  background?: boolean;
}) {
  return useFetch<undefined, GetActivityQuery, Activity>({
    url: '/api/data/activity',
    method: 'GET',
    query,
    enabled,
    background,
  });
}

export { useActivity };

export type { GetActivityQuery };
