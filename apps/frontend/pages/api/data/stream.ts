import { getLastStreamFromCosmos, getStreamFromCosmos } from '@repo/cosmosdb';
import type { NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

import { NextApiRequestUnknown } from '@pages/api/types';
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

  switch (req.method) {
    case 'GET':
      await handleGet(res, req, token.id as string);
      break;
    default:
      res.setHeader('Allow', 'GET');
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

async function handleGet(
  res: NextApiResponse,
  req: NextApiRequestUnknown,
  id: string,
) {
  const activityId = getQueryParam(req.query, 'id') || 'latest';

  if (activityId === 'latest') {
    const activity = await getLastStreamFromCosmos(id);

    return res.status(200).json(activity);
  }

  const activity = await getStreamFromCosmos({
    id: activityId,
  });

  return res.status(200).json(activity);
}
