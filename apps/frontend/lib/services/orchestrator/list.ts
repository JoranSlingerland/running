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
  return useFetch<undefined, ListOrchestratorQuery, ListOrchestratorData[]>({
    url: '/api/orchestrator/list',
    method: 'GET',
    query,
    enabled,
    background,
  });
}

export { useListOrchestrator };

export type { ListOrchestratorData };
