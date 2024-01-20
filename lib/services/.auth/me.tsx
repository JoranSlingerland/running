import { useFetch } from '@hooks/useFetch';

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
