import { IsRunningStatus } from '@repo/types';

import { useFetch } from '@hooks/useFetch';

type Query = {
  serviceName: 'StravaDataEnhancementService';
};

function useServiceStatus({
  query,
  enabled = true,
}: {
  query: Query;
  enabled?: boolean;
}) {
  return useFetch<undefined, Query, IsRunningStatus>({
    url: '/api/admin/serviceStatus',
    method: 'GET',
    query,
    enabled,
  });
}

export { useServiceStatus };
