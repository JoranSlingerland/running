import { upsertWithBackOff } from '@repo/cosmosdb';
import {
  ActivityHandler,
  OrchestrationContext,
  OrchestrationHandler,
} from 'durable-functions';

type Input = {
  [container_name: string]: unknown[];
};

const subOrchOutputToCosmosDb: OrchestrationHandler = function* (
  context: OrchestrationContext
) {
  const data = context.df.getInput() as Input;

  for (const container_name in data) {
    const items = data[container_name];
    const batches = [];

    if (!Array.isArray(items)) {
      console.warn('Invalid input, expected array. Skipping...');
      continue;
    }

    for (let i = 0; i < items.length; i += 5000) {
      batches.push(items.slice(i, i + 5000));
    }
    for (const batch of batches) {
      yield context.df.callActivity('outputToCosmosDb', [
        container_name,
        batch,
      ]);
    }
  }

  return 'done';
};

const outputToCosmosDb: ActivityHandler = async (input: [string, unknown]) => {
  const container_name = input[0];
  const items = input[1];

  if (!Array.isArray(items)) {
    console.warn('Invalid input, expected array. Skipping...');
    return;
  }

  for (const item of items as Array<Record<string, unknown>>) {
    await upsertWithBackOff(container_name, item);
  }
};

export { subOrchOutputToCosmosDb, outputToCosmosDb };
