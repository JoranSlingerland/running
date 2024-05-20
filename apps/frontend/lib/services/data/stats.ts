import { Statistics } from '@repo/types';

import { useFetch } from '@hooks/useFetch';

interface GetDistanceStatsQuery {
  timeFrames: string;
}

function useAbsoluteStats({
  query,
  enabled = true,
  background = false,
}: {
  query?: GetDistanceStatsQuery;
  enabled?: boolean;
  background?: boolean;
}) {
  return useFetch<undefined, GetDistanceStatsQuery, Statistics>({
    url: '/api/data/stats/absolute',
    method: 'GET',
    query,
    enabled,
    background,
  });
}

export { useAbsoluteStats };

export type { GetDistanceStatsQuery };
