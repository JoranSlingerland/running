import { getHourlyWeather } from '@repo/weather';
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
      await handleGet(res, req);
      break;
    default:
      res.setHeader('Allow', 'GET');
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

async function handleGet(res: NextApiResponse, req: NextApiRequestUnknown) {
  const date = getQueryParam(req.query, 'date') || undefined;
  const longitude = Number(getQueryParam(req.query, 'longitude')) || undefined;
  const latitude = Number(getQueryParam(req.query, 'latitude')) || undefined;

  if (!longitude || !latitude || !date) {
    res.status(400).json({ message: 'Missing required query parameters' });
    return;
  }

  const response = await getHourlyWeather({
    longitude,
    latitude,
    date,
  });

  return res.status(200).json(response);
}
