import { getNonFullDataActivitiesFromCosmos } from '@repo/cosmosdb';
import { addActivitiesToQueue } from '@repo/queue-helpers';
import type { NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

import { NextApiRequestUnknown } from '@pages/api/types';

export default async function handler(
  req: NextApiRequestUnknown,
  res: NextApiResponse,
) {
  const token = await getToken({ req });
  if (!token) {
    res.status(401).end();
    return;
  }

  switch (req.method) {
    case 'GET':
      await handleGet(res, token.id as string);
      break;
    default:
      res.setHeader('Allow', 'GET');
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

async function handleGet(res: NextApiResponse, id: string) {
  const activities = await getNonFullDataActivitiesFromCosmos(id);
  let result = {
    status: 'No content',
    message: 'No activities to process.',
    activitiesAdded: 0,
    activitiesTotal: 0,
  };
  let status = 204;
  if (activities) {
    result = await addActivitiesToQueue('enrichment-queue', activities);
    status = 200;
  }

  return res.status(status).json(result);
}
