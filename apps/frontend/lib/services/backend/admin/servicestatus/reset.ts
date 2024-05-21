import { regularFetch } from '@utils/api';

type Query = {
  serviceName: 'StravaDataEnhancementService';
};

function resetServiceStatus({ query }: { query: Query }) {
  regularFetch({
    url: '/api/admin/serviceStatus/reset/',
    message: {
      enabled: true,
      success: 'Reset service status',
      error: 'Failed to reset service status',
      loading: 'Resetting service status',
    },
    method: 'GET',
    query,
  });
}

export { resetServiceStatus };
