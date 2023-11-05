import { cachedFetch } from '../../utils/api';
import { useFetch } from '../../hooks/useFetch';

interface UseUserSettings {
  data: UserSettings;
  isLoading: boolean;
  isError: boolean;
  refetchData: (params?: { cacheOnly?: boolean }) => void;
  overwriteData: (data: UserSettings) => void;
}

async function getUserSettings({ overwrite }: { overwrite?: boolean }) {
  const response = await cachedFetch({
    url: `/api/user`,
    method: 'GET',
    fallback_data: {
      dark_mode: 'system',
      strava_client_id: '',
      strava_client_secret: '',
    },
    overwrite,
  });
  return response;
}

function useUserSettings({
  enabled = true,
}: { enabled?: boolean } = {}): UseUserSettings {
  const fetchResult = useFetch<undefined, undefined, UserSettings>({
    body: undefined,
    fetchData: getUserSettings,
    enabled,
    initialData: {
      dark_mode: 'system',
      strava_client_id: '',
      strava_client_secret: '',
    },
  });
  return fetchResult as UseUserSettings;
}

export { useUserSettings };

export type { UseUserSettings };
