import type { UserSettings } from '@repo/types';

export type StravaAuthResponse = {
  token_type: 'Bearer';
  expires_at: number;
  expires_in: number;
  refresh_token: string;
  access_token: string;
  athlete: StravaSummaryAthlete;
};

export type StravaSummaryAthlete = {
  id: string;
  resource_state?: number;
  firstname?: string;
  lastname?: string;
  profile_medium?: string;
  profile?: string;
  city?: string;
  state?: string;
  country?: string;
  sex?: string;
  premium?: boolean;
  summit?: boolean;
  created_at: Date;
  updated_at: Date;
};

export type ActivitiesQuery = {
  before?: number | string;
  after?: number | string;
  page?: number;
  per_page?: number;
};

export type StravaAuthentication = UserSettings['strava_authentication'];
