import { stravaConfig } from '@repo/strava';
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
  const callbackUrl = getQueryParam(req.query, 'callbackUrl');
  const scope = getQueryParam(req.query, 'scope');
  const clientId = process.env.STRAVA_CLIENT_ID;

  if (!callbackUrl || !scope) {
    res.status(400).json({ message: 'Missing required query parameters' });
    return;
  }

  if (!clientId) {
    res.status(500).json({ message: 'Missing STRAVA_CLIENT_ID env variable' });
    return;
  }

  const url = `${stravaConfig.authUrl}?client_id=${clientId}&redirect_uri=${callbackUrl}&response_type=code&%20response_type=force&scope=${scope}`;

  res.status(200).json({ url });
}
