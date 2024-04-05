import { regularFetch } from '@utils/api';

function queueNonFullData() {
  regularFetch({
    url: '/api/queue/nonFullData',
    message: {
      enabled: true,
      success: 'Activities queued successfully',
      error: 'Failed to queue activities',
      loading: 'Queueing activities',
    },
    method: 'GET',
  });
}

export { queueNonFullData };
