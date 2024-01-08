import { regularFetch } from '@utils/api';

interface PurgeOrchestratorQuery {
  instanceId: string;
}

function purgeOrchestrator({ query }: { query: PurgeOrchestratorQuery }) {
  regularFetch({
    url: '/api/orchestrator/purge',
    message: {
      enabled: true,
      success: 'Orchestrator purged',
      error: 'Failed to purge orchestrator',
      loading: 'Purging orchestrator',
    },
    method: 'DELETE',
    query,
  });
}

export { purgeOrchestrator };
