import { getActivities } from './src/activities';
import { checkAuth, initialAuth, refreshAuth } from './src/authentication';
import { StravaClient } from './src/client';
import { authUrl, baseUrl } from './src/config';

// TODO: Remove default export
const strava = {
  initialAuth,
  refreshAuth,
  checkAuth,
  getActivities,
  StravaClient,
};

const stravaConfig = {
  authUrl,
  baseUrl,
};

export default strava;
export {
  initialAuth,
  refreshAuth,
  checkAuth,
  getActivities,
  stravaConfig,
  StravaClient,
};
export * from './src/types';
