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
};
