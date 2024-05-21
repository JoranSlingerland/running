import { Statistics } from '@repo/types';
import { AbsoluteTimes, RelativeTimes } from '@repo/types';

import { useFetch } from '@hooks/useFetch';

interface GetDistanceStatsQuery {
  timeFrames: (AbsoluteTimes | RelativeTimes)[];
}

interface GetDistanceStatsQuerySerialized {
  timeFrames: string;
}

function useStats({
  query,
  enabled = true,
  background = false,
}: {
  query: GetDistanceStatsQuery;
  enabled?: boolean;
  background?: boolean;
}) {
  return useFetch<undefined, GetDistanceStatsQuerySerialized, Statistics>({
    url: '/api/data/stats/',
    method: 'GET',
    query: {
      ...query,
      timeFrames: query.timeFrames.toString(),
    },
    enabled,
    background,
    cache: {
      enabled: true,
      ttl: 5 * 60 * 1000,
      storageType: 'sessionStorage',
    },
  });
}

export { useStats };

export type { GetDistanceStatsQuery };
