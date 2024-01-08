import { useFetch } from '@hooks/useFetch';

interface UserInfo {
  clientPrincipal: {
    userId: string;
    userRoles: string[];
    claims: string[];
    identityProvider: string;
    userDetails: string;
  };
}

function useUserInfo({ enabled = true }: { enabled?: boolean } = {}) {
  const fetchResult = useFetch<undefined, undefined, UserInfo>({
    url: '/.auth/me',
    method: 'GET',
    enabled,
    initialData: {
      clientPrincipal: {
        userId: '',
        userRoles: ['anonymous'],
        claims: [],
        identityProvider: '',
        userDetails: '',
      },
    },
  });
  return fetchResult;
}

export { useUserInfo };
