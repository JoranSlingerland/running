import { regularFetch } from '@utils/api';

function gatherStravaData() {
  regularFetch({
    url: '/api/strava/gather',
    message: {
      enabled: true,
      success: 'Refreshed activities',
      error: 'Failed to refresh activities',
      loading: 'Refreshing activities',
    },
    method: 'GET',
  });
}

export { gatherStravaData };
