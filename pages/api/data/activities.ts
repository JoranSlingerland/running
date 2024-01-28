import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { cosmosContainer, removeKeys } from '@utils/cosmosdb';
import { Container } from '@azure/cosmos';

export default async function handler(
  req: NextApiRequest,
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
      res.setHeader('Allow', 'GET, POST');
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

async function handleGet(
  res: NextApiResponse,
  req: NextApiRequest,
  container: Container,
  id: string,
) {
  let queryStr = 'SELECT * FROM c WHERE c.userId = @id';
  let startDate =
    Array.isArray(req.query.startDate) || req.query.startDate === undefined
      ? ''
      : req.query.startDate;
  let endDate =
    Array.isArray(req.query.endDate) || req.query.endDate === undefined
      ? ''
      : req.query.endDate;

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

  const cleanActivities = activities.map((activity) => {
    return removeKeys(activity);
  });

  return res.status(200).json(cleanActivities);
}
