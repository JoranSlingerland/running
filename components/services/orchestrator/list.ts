import { useFetch } from '@hooks/useFetch';

interface ListOrchestratorQuery {
  days: number | 'all';
}

interface ListOrchestratorData {
  instanceId: string;
  createdTime: string;
  lastUpdatedTime: string;
  runtimeStatus: string;
}

function useListOrchestrator({
  query,
  enabled = true,
  background = false,
}: {
  query: ListOrchestratorQuery;
  enabled?: boolean;
  background?: boolean;
}) {
  const fetchResult = useFetch<
    undefined,
    ListOrchestratorQuery,
    ListOrchestratorData[]
  >({
    url: '/api/orchestrator/list',
    method: 'GET',
    query,
    enabled,
    background,
  });

  return fetchResult;
}

export { useListOrchestrator };

export type { ListOrchestratorData };
