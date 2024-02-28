import { getActivities } from './src/activities';
import { getActivity } from './src/activity';
import { checkAuth, initialAuth, refreshAuth } from './src/authentication';
import { StravaClient } from './src/client';
import { authUrl, baseUrl } from './src/config';
import { getStream } from './src/streams';

// TODO: Remove default export
const strava = {
  initialAuth,
  refreshAuth,
  checkAuth,
  getActivities,
  getActivity,
  getStream,
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
  getActivity,
  getStream,
  stravaConfig,
  StravaClient,
};
export * from './src/types';
