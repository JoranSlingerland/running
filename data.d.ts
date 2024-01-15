interface UserInfo {
  clientPrincipal: {
    userId: string;
    userRoles: string[];
    claims: string[];
    identityProvider: string;
    userDetails: string;
  };
}

type UserSettings = {
  dark_mode: 'dark' | 'light' | 'system';
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
  };
  gender: 'male' | 'female' | undefined;
};

type ThemeType = 'light' | 'dark' | 'system';

type Theme = {
  themeType: ThemeType;
  setThemeType: (themeType: ThemeType) => void;
  theme: 'light' | 'dark';
};

type StorageType = 'sessionStorage' | 'localStorage';
