import { Activity } from '@repo/types';

import { cosmosContainer, removeKeys } from './helpers';

async function getLastActivityFromCosmos(userId: string) {
  const container = cosmosContainer('activities');

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

  return response.resources[0] as Activity;
}

async function getActivityFromCosmos({
  id,
}: {
  id: string;
}): Promise<Activity | undefined> {
  const container = cosmosContainer('activities');

  const response = await container.items
    .query({
      query: 'SELECT * FROM c WHERE c.id = @id',
      parameters: [{ name: '@id', value: id }],
    })
    .fetchAll();

  if (!response.resources || response.resources.length === 0) {
    return undefined;
  }

  return removeKeys<Activity>(response.resources[0]);
}

export { getLastActivityFromCosmos, getActivityFromCosmos };
