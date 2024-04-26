import { regularFetch } from '@utils/api';

function enhanceStravaData() {
  regularFetch({
    url: '/api/admin/strava/enhance',
    message: {
      enabled: true,
      success: 'Activity data enhanced successfully',
      error: 'Failed to enhance Strava data',
      loading: 'Enhancing Strava data',
    },
    method: 'GET',
  });
}

export { enhanceStravaData };
