import { useFetch } from '@hooks/useFetch';

type isAdmin = {
  isAdmin: boolean;
};

function useIsAdmin({ enabled = true }: { enabled?: boolean }) {
  return useFetch<undefined, undefined, isAdmin>({
    url: '/api/auth/isAdmin',
    method: 'GET',
    enabled,
  });
}

export { useIsAdmin };
