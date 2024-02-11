import { initialAuth, refreshAuth } from './src/authentication';
import { authUrl, baseUrl } from './src/config';

const strava = {
  initialAuth,
  refreshAuth,
};

const stravaConfig = {
  authUrl,
  baseUrl,
};

export default strava;
export { initialAuth, refreshAuth };
export { stravaConfig };
