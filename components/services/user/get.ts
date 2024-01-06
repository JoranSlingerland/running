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
    zones: [],
  },
  gender: undefined,
};

function useUserSettings({
  enabled = true,
}: { enabled?: boolean } = {}): UseUserSettings {
  const fetchResult = useFetch<undefined, undefined, UserSettings>({
    url: '/api/user',
    method: 'GET',
    body: undefined,
    enabled,
    initialData: initialData,
    cache: {
      enabled: true,
      hours: 24,
      storageType: 'sessionStorage',
    },
  });
  return fetchResult as UseUserSettings;
}

export { useUserSettings };

export type { UseUserSettings };
