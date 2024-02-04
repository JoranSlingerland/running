import type { NextApiResponse } from 'next';
import { NextApiRequestUnknown } from '@pages/api/types';
import { getToken } from 'next-auth/jwt';
import { cosmosContainer, removeKeys } from '@utils/database/helpers';
import { Container } from '@azure/cosmos';
import { getQueryParam } from '@utils/api';

export default async function handler(
  req: NextApiRequestUnknown,
  res: NextApiResponse,
) {
  const token = await getToken({ req });
  if (!token) {
    res.status(401).end();
    return;
  }

  const container = cosmosContainer('activities');

  switch (req.method) {
    case 'GET':
      await handleGet(res, req, container, token.id as string);
      break;
    default:
      res.setHeader('Allow', 'GET');
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

async function handleGet(
  res: NextApiResponse,
  req: NextApiRequestUnknown,
  container: Container,
  id: string,
) {
  let queryStr = 'SELECT * FROM c WHERE c.userId = @id';
  const startDate = getQueryParam(req.query, 'startDate') || '';
  const endDate = getQueryParam(req.query, 'endDate') || '';

  if (startDate) {
    queryStr += ' AND c.start_date >= @startDate';
  }
  if (endDate) {
    queryStr += ' AND c.start_date <= @endDate';
  }

  const { resources: activities } = await container.items
    .query({
      query: queryStr,
      parameters: [
        { name: '@id', value: id },
        { name: '@startDate', value: startDate },
        { name: '@endDate', value: endDate },
      ],
    })
    .fetchAll();

  const cleanActivities = activities.map(
    (activity: Record<string, unknown>) => {
      return removeKeys(activity);
    },
  );

  return res.status(200).json(cleanActivities);
}
