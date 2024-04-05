import type { UserSettings } from '@repo/types';

import { StravaSummaryAthlete } from './athlete';

export type StravaAuthResponse = {
  token_type: 'Bearer';
  expires_at: number;
  expires_in: number;
  refresh_token: string;
  access_token: string;
  athlete: StravaSummaryAthlete;
};

export type StravaAuthentication = UserSettings['strava_authentication'];
