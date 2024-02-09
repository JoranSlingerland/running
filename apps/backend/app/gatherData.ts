import { OrchestrationContext, OrchestrationHandler } from 'durable-functions';

export const gatherData: OrchestrationHandler = function* (
  context: OrchestrationContext,
) {
  return 'test';
};
