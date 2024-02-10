import wretch from 'wretch';

import { createWretchInstance } from '@utils/api';

import { baseUrl } from './config';
import { StravaAuthResponse } from './types';

async function initialAuth(
  code: string,
): Promise<StravaAuthResponse | undefined> {
  const query = {
    client_id: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID,
    client_secret: process.env.STRAVA_CLIENT_SECRET,
    code: code,
    grant_type: 'authorization_code',
  };
  const wretchInstance = createWretchInstance({
    url: `${baseUrl}/oauth/token`,
    method: 'POST',
    query,
    controller: new AbortController(),
  });
  return await wretchInstance.json();
}

function refreshAuth(
  refresh_token: string,
): Promise<StravaAuthResponse | undefined> {
  return wretch(`${baseUrl}/oauth/token`)
    .post({
      client_id: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      refresh_token,
      grant_type: 'refresh_token',
    })
    .json();
}

export { initialAuth, refreshAuth };
