import { Units } from './generic';

export type UserSettings = {
  strava_authentication: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
  heart_rate: {
    max: number;
    resting: number;
    threshold: number;
    zones: {
      name: string;
      min: number;
      max: number;
    }[];
  };
  pace: {
    threshold: number;
    zones: {
      name: string;
      min: number;
      max: number;
    }[];
  };
  preferences: {
    preferred_tss_type: 'hr' | 'pace';
    units: Units;
    dark_mode: 'dark' | 'light' | 'system';
    enable_weather: boolean;
  };
  gender: 'male' | 'female' | undefined;
  activity_pages_synced: number | undefined | 'all';
  version: number;
  _id: string;
};
