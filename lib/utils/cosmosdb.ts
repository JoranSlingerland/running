import { CosmosClient } from '@azure/cosmos';
import { promisify } from 'util';

function cosmosClient() {
  const endpoint = process.env.COSMOSDB_ENDPOINT as string;
  const key = process.env.COSMOSDB_KEY;
  const database = process.env.COSMOSDB_DATABASE as string;

  const cosmosClient = new CosmosClient({ endpoint, key });
  const cosmosDatabase = cosmosClient.database(database);

  return { cosmosClient, cosmosDatabase };
}

function cosmosContainer(containerName: string) {
  const { cosmosDatabase } = cosmosClient();
  return cosmosDatabase.container(containerName);
}

async function containerFunctionWithBackOff(
  functionToExecute: () => Promise<void>,
  maxRetries: number = 10,
  delay: number = Math.random() * 0.2,
  maxDelay: number = 5,
) {
  let retryCount = 0;
  while (true) {
    try {
      await functionToExecute();
      break;
    } catch (error) {
      // TODO: Add retry logic for specific errors
      // if (error.code === 409) {
      //   console.debug('Item already exists');
      //   break;
      // } else if (error.code === 404) {
      //   console.debug('Item not found');
      //   break;
      // }

      if (retryCount >= maxRetries) {
        console.error('Max retries reached, See error below:');
        console.error(error);
      }
      console.debug(error);
      console.debug(`Retrying in ${delay} seconds`);
      await promisify(setTimeout)(delay * 1000);
      delay =
        Math.min(delay * 2, maxDelay) + Math.random() * Math.min(retryCount, 1);
      retryCount += 1;
    }
  }
}

export { cosmosClient, cosmosContainer, containerFunctionWithBackOff };
