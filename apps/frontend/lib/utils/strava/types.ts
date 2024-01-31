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

export type StravaAuthConfig = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
};
