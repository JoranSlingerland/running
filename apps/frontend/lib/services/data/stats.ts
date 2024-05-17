import { DistanceStats } from '@repo/types';

import { useFetch } from '@hooks/useFetch';

interface GetDistanceStatsQuery {
  timeFrames: string;
}

function useDistanceStats({
  query,
  enabled = true,
  background = false,
}: {
  query?: GetDistanceStatsQuery;
  enabled?: boolean;
  background?: boolean;
}) {
  return useFetch<undefined, GetDistanceStatsQuery, DistanceStats>({
    url: '/api/data/stats/distance',
    method: 'GET',
    query,
    enabled,
    background,
  });
}

export { useDistanceStats };

export type { GetDistanceStatsQuery };
