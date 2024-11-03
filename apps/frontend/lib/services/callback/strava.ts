import { useFetch } from '@hooks/useFetch';

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
  return useFetch<undefined, StravaCallbackQuery, StravaCallbackData>({
    url: '/api/callback/strava/',
    method: 'GET',
    query,
    enabled,
  });
}

export { useStravaCallback };
