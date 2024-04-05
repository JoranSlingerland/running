import { Activity } from '@repo/types';

import { useFetch } from '@hooks/useFetch';

interface GetActivitiesQuery {
  startDate?: string;
  endDate?: string;
}

function useActivities({
  query,
  enabled = true,
  background = false,
}: {
  query?: GetActivitiesQuery;
  enabled?: boolean;
  background?: boolean;
}) {
  return useFetch<undefined, GetActivitiesQuery, Activity[]>({
    url: '/api/data/activities',
    method: 'GET',
    query,
    enabled,
    background,
    cache: {
      enabled: true,
      hours: 1,
      storageType: 'sessionStorage',
      customKey: query ? 'activities' : undefined,
      useStartEndDates: query ? true : false,
      deDupeKey: 'id',
    },
  });
}

export { useActivities };

export type { GetActivitiesQuery };
