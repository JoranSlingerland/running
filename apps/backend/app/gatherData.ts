import { OrchestrationContext, OrchestrationHandler } from 'durable-functions';

export const gatherData: OrchestrationHandler = function* (
  context: OrchestrationContext,
) {
  const userId = (context.df.getInput() as { id: string }).id;
  console.log(userId);
  return 'test';
};
