import { regularFetch } from '../../utils/api';
import { useFetch } from '../../hooks/useFetch';

interface StravaCallbackQuery {
  code: string;
  scope: string;
}

interface StravaCallbackData {
  result: string;
}

async function stravaCallback({
  query,
  abortController,
}: {
  query?: StravaCallbackQuery;
  abortController: AbortController;
}) {
  const response = await regularFetch({
    url: '/api/callback/strava',
    method: 'GET',
    query,
    controller: abortController,
  });
  return response;
}

function useStravaCallback({
  query,
  enabled = true,
}: {
  query?: StravaCallbackQuery;
  enabled?: boolean;
}) {
  const fetchResult = useFetch<
    undefined,
    StravaCallbackQuery,
    StravaCallbackData
  >({
    query,
    fetchData: stravaCallback,
    enabled,
  });

  return fetchResult;
}

export { useStravaCallback };
