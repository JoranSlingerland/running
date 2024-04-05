import { CosmosClient, ItemDefinition, ItemResponse } from '@azure/cosmos';

function cosmosClient() {
  const endpoint = process.env.COSMOSDB_ENDPOINT;
  const key = process.env.COSMOSDB_KEY;
  const database = process.env.COSMOSDB_DATABASE;

  if (!endpoint || !key || !database) {
    throw new Error('Missing CosmosDB environment variables');
  }

  const cosmosClient = new CosmosClient({ endpoint, key });
  const cosmosDatabase = cosmosClient.database(database);

  return { cosmosClient, cosmosDatabase };
}

function cosmosContainer(containerName: string) {
  const { cosmosDatabase } = cosmosClient();
  return cosmosDatabase.container(containerName);
}

async function containerFunctionWithBackOff(
  functionToExecute: () => Promise<ItemResponse<ItemDefinition>>,
  maxRetries: number = 5,
  maxDelay: number = 5,
): Promise<{
  result: ItemResponse<ItemDefinition> | undefined;
  isError: boolean;
}> {
  let isError = false;
  let delay = Math.random();
  let result: ItemResponse<ItemDefinition> | undefined = undefined;

  const operation = async () => {
    const result = await functionToExecute();

    if (result.statusCode >= 200 && result.statusCode < 300) {
      return result;
    }

    isError = true;

    if (result.statusCode === 404) {
      console.debug('Item not found');
    } else if (result.statusCode === 409) {
      console.debug('Item already exists');
    } else {
      console.error('Something went wrong');
    }

    return result;
  };

  for (let i = 0; i <= maxRetries; i++) {
    try {
      result = await operation();
    } catch (error) {
      if (i === maxRetries) {
        console.error('Max retries reached, See error below:');
        console.error(error);
        isError = true;
        break;
      }

      console.debug(error);
      console.debug(`Retrying in ${delay} seconds`);

      await new Promise((resolve) => setTimeout(resolve, delay * 1000));

      delay = Math.min(delay * 2, maxDelay);
    }
  }

  return { result, isError };
}

async function upsertWithBackOff<T>(
  containerName: string,
  item: T,
): Promise<{
  result: ItemResponse<ItemDefinition> | undefined;
  isError: boolean;
}> {
  const container = cosmosContainer(containerName);
  return await containerFunctionWithBackOff(async () => {
    return await container.items.upsert(item);
  });
}

function removeKeys<T>(
  obj: Record<string, unknown>,
  keys: string[] = ['_rid', '_self', '_etag', '_attachments', '_ts'],
): T {
  const newObj = { ...obj };

  keys.forEach((key) => {
    delete newObj[key];
  });

  return newObj as T;
}

export {
  cosmosClient,
  cosmosContainer,
  containerFunctionWithBackOff,
  removeKeys,
  upsertWithBackOff,
};
