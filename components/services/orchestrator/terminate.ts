import { regularFetch } from '@utils/api';

interface TerminateOrchestratorQuery {
  instanceId: string;
}

function terminateOrchestrator({
  query,
}: {
  query: TerminateOrchestratorQuery;
}) {
  regularFetch({
    url: '/api/orchestrator/terminate',
    message: {
      enabled: true,
      success: 'Orchestrator terminated',
      error: 'Failed to terminate orchestrator',
      loading: 'Terminating orchestrator',
    },
    method: 'POST',
    query,
  });
}

export { terminateOrchestrator };
