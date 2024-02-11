import { Activity } from '@repo/types';

import { cosmosContainer, removeKeys } from './helpers';

async function activitiesFromCosmos({
  id,
  startDate = '',
  endDate = '',
}: {
  id: string;
  startDate?: string;
  endDate?: string;
}): Promise<Activity[] | undefined> {
  let queryStr = 'SELECT * FROM c WHERE c.userId = @id';

  const container = cosmosContainer('activities');

  if (startDate) {
    queryStr += ' AND c.start_date >= @startDate';
  }
  if (endDate) {
    queryStr += ' AND c.start_date <= @endDate';
  }

  const response = await container.items
    .query({
      query: queryStr,
      parameters: [
        { name: '@id', value: id },
        { name: '@startDate', value: startDate },
        { name: '@endDate', value: endDate },
      ],
    })
    .fetchAll();

  if (!response.resources || response.resources.length === 0) {
    return undefined;
  }

  return response.resources.map((activity: Record<string, unknown>) => {
    return removeKeys<Activity>(activity);
  });
}

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

export { activitiesFromCosmos, getLastActivityFromCosmos };
