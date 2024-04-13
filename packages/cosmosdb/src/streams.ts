import { Streams } from '@repo/strava';

import { cosmosContainer, removeKeys } from './helpers';

async function getLastStreamFromCosmos(
  userId: string,
): Promise<Streams | undefined> {
  const container = cosmosContainer('streams');

  const response = await container.items
    .query({
      query:
        'SELECT top 1 * from c where c.userId = @id ORDER BY c.start_date DESC',
      parameters: [{ name: '@id', value: userId }],
    })
    .fetchAll();
  if (!response.resources || response.resources.length === 0) {
    return undefined;
  }

  return response.resources[0] as Streams;
}

async function getStreamFromCosmos({
  id,
}: {
  id: string;
}): Promise<Streams | undefined> {
  const container = cosmosContainer('streams');

  const response = await container.items
    .query({
      query: 'SELECT * FROM c WHERE c.id = @id',
      parameters: [{ name: '@id', value: id }],
    })
    .fetchAll();

  if (!response.resources || response.resources.length === 0) {
    return undefined;
  }

  return removeKeys<Streams>(response.resources[0]);
}

export { getLastStreamFromCosmos, getStreamFromCosmos };
