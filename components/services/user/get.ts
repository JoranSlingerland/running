import { cachedFetch } from '../../utils/api';
import { useFetch } from '../../hooks/useFetch';

interface UseUserSettings {
  data: UserSettings;
  isLoading: boolean;
  isError: boolean;
  refetchData: (params?: { cacheOnly?: boolean }) => void;
  overwriteData: (data: UserSettings) => void;
}

const initialData: UserSettings = {
  dark_mode: 'system',
  strava_authentication: {
    access_token: '',
    refresh_token: '',
    expires_at: 0,
  },
  heart_rate: {
    max: 0,
    resting: 0,
    threshold: 0,
    zones: [],
  },
  pace: {
    threshold: 0,
  },
};

async function getUserSettings({ overwrite }: { overwrite?: boolean }) {
  const response = await cachedFetch({
    url: `/api/user`,
    method: 'GET',
    fallback_data: initialData,
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
    initialData: initialData,
  });
  return fetchResult as UseUserSettings;
}

export { useUserSettings };

export type { UseUserSettings };
