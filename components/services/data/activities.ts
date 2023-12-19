import { cachedFetch } from '../../utils/api';
import { useFetch } from '../../hooks/useFetch';
import type { Query, Activity } from './data.d.ts';

async function getActivities({
  query,
  abortController,
}: {
  query?: Query;
  abortController: AbortController;
}) {
  const response = await cachedFetch({
    url: `/api/data/activities`,
    method: 'GET',
    query,
    controller: abortController,
  });
  return response;
}

function useActivities({
  query,
  enabled = true,
  background = false,
}: {
  query?: Query;
  enabled?: boolean;
  background?: boolean;
}) {
  const fetchResult = useFetch<undefined, Query, Activity[]>({
    query,
    fetchData: getActivities,
    enabled,
    background,
  });

  return fetchResult;
}

export { useActivities };
