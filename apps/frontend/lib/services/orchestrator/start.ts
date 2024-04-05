import { regularFetch } from '@utils/api';

interface StartOrchestratorQuery {
  functionName: 'gatherData';
}

function startOrchestrator({ query }: { query: StartOrchestratorQuery }) {
  regularFetch({
    url: '/api/orchestrator/start',
    message: {
      enabled: true,
      success: 'Orchestration called, This will take a while',
      error: 'Failed to call orchestrator',
      loading: 'Calling Orchestrator',
    },
    method: 'POST',
    query,
  });
}

export { startOrchestrator };
