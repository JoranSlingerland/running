import type { NextApiResponse } from 'next';
import { NextApiRequestUnknown } from '@pages/api/types';
import { getToken } from 'next-auth/jwt';
import { removeKeys } from '@utils/database/helpers';
import {
  userSettingsFromCosmos,
  upsertUserSettingsToCosmos,
} from '@utils/database/user';
import strava from '@utils/strava';
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
      res.setHeader('Allow', 'GET, POST');
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

async function handleGet(
  res: NextApiResponse,
  req: NextApiRequestUnknown,
  id: string,
) {
  const code = getQueryParam(req.query, 'code');
  const scope = getQueryParam(req.query, 'scope');
  const expectedScope = ['read', 'activity:read_all', 'profile:read_all'];

  if (!code || !scope) {
    res.status(400).json({ message: 'Missing required query parameters' });
    return;
  }

  if (scope.split(',').sort().join(',') !== expectedScope.sort().join(',')) {
    res.status(400).json({ message: 'Invalid scope' });
    return;
  }

  const userSettings = await userSettingsFromCosmos(id);

  if (!userSettings) {
    res.status(400).json({ message: 'User not found' });
    return;
  }

  const authResponse = await strava.initialAuth(code);

  if (!authResponse) {
    res.status(500).json({ message: 'Failed to authenticate with Strava' });
    return;
  }

  const userSettingsWithAuth: UserSettings = {
    ...userSettings,
    strava_authentication: {
      access_token: authResponse.access_token,
      refresh_token: authResponse.refresh_token,
      expires_at: authResponse.expires_at,
    },
  };

  const result = await upsertUserSettingsToCosmos(id, userSettingsWithAuth);

  if (!result.isError && result.result) {
    return res
      .status(200)
      .json(
        removeKeys(result.result.resource || {}, [
          '_rid',
          '_self',
          '_etag',
          '_attachments',
          '_ts',
          'id',
        ]),
      );
  }

  return res
    .status(result.result?.statusCode || 500)
    .json({ message: 'Something went wrong' });
}
