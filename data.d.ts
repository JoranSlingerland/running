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
  strava_client_id: string;
  strava_client_secret: string;
};
