import { useFetch } from '@hooks/useFetch';

const initialData: UserSettings = {
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
  preferences: {
    preferred_tss_type: 'pace',
    units: 'metric',
    dark_mode: 'system',
  },
};

function useUserSettings({ enabled = true }: { enabled?: boolean } = {}) {
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
      customKey: 'userSettings',
    },
  });
  return fetchResult;
}

export { useUserSettings };
