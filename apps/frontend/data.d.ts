type UserSettings = import('@repo/types').UserSettings;
type Units = import('@repo/types').Units;

interface UserInfo {
  clientPrincipal: {
    userId: string;
    userRoles: string[];
    claims: string[];
    identityProvider: string;
    userDetails: string;
  };
}

type StorageType = 'sessionStorage' | 'localStorage';
