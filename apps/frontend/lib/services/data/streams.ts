import { Streams } from '@repo/types';

import { useFetch } from '@hooks/useFetch';

interface GetStreamsQuery {
  id: string | 'latest';
}

function useStreams({
  query,
  enabled = true,
  background = false,
}: {
  query?: GetStreamsQuery;
  enabled?: boolean;
  background?: boolean;
}) {
  return useFetch<undefined, GetStreamsQuery, Streams>({
    url: '/api/data/stream',
    method: 'GET',
    query,
    enabled,
    background,
  });
}

export { useStreams };

export type { GetStreamsQuery };
