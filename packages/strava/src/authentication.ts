import { createWretchInstance } from '@repo/api';

import { baseUrl } from './config';
import { StravaAuthResponse, StravaAuthentication } from './types';

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
  const query = {
    client_id: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID,
    client_secret: process.env.STRAVA_CLIENT_SECRET,
    refresh_token,
    grant_type: 'refresh_token',
  };
  const wretchInstance = createWretchInstance({
    url: `${baseUrl}/oauth/token`,
    method: 'POST',
    query,
    controller: new AbortController(),
  });
  return wretchInstance.json();
}

async function checkAuth(
  auth: StravaAuthentication,
): Promise<StravaAuthentication> {
  const refreshThreshold = new Date().getTime() + 5 * 60 * 1000;
  if (auth.expires_at < refreshThreshold) {
    const refreshedAuth = await refreshAuth(auth.refresh_token);
    if (!refreshedAuth) {
      throw new Error('Error refreshing authentication');
    }
    return {
      access_token: refreshedAuth.access_token,
      refresh_token: refreshedAuth.refresh_token,
      expires_at: refreshedAuth.expires_at,
    };
  }
  return auth;
}

export { initialAuth, refreshAuth, checkAuth };
