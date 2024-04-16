import { DistanceStats, TimeFrame } from '@repo/types';

import { useFetch } from '@hooks/useFetch';

interface GetDistanceStatsQuery {
  timeFrames: TimeFrame[];
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
    cache: {
      enabled: true,
      hours: 1,
      storageType: 'sessionStorage',
      customKey: 'distanceStats',
    },
  });
}

export { useDistanceStats };

export type { GetDistanceStatsQuery };
