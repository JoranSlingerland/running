import { Activity, MinimalActivity } from '@repo/types';

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
    url: '/api/data/activities/full/',
    method: 'GET',
    query,
    enabled,
    background,
    cache: {
      enabled: true,
      storageType: 'sessionStorage',
      customKey: query ? 'full-activities' : undefined,
      useStartEndDates: query ? true : false,
      deDupeKey: '_id',
    },
  });
}

function useMinActivities({
  query,
  enabled = true,
  background = false,
}: {
  query?: GetActivitiesQuery;
  enabled?: boolean;
  background?: boolean;
}) {
  return useFetch<undefined, GetActivitiesQuery, MinimalActivity[]>({
    url: '/api/data/activities/minimal/',
    method: 'GET',
    query,
    enabled,
    background,
    cache: {
      enabled: false,
      storageType: 'sessionStorage',
      customKey: query ? 'min-activities' : undefined,
      useStartEndDates: query ? true : false,
    },
  });
}

export { useActivities, useMinActivities };

export type { GetActivitiesQuery };
