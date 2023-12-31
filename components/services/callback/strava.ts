import { useFetch } from '../../hooks/useFetch';

interface StravaCallbackQuery {
  code: string;
  scope: string;
}

interface StravaCallbackData {
  result: string;
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
    url: '/api/callback/strava',
    method: 'GET',
    query,
    enabled,
  });

  return fetchResult;
}

export { useStravaCallback };
