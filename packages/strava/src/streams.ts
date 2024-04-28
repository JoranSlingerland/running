import { WretchError, createBasicWretchInstance } from '@repo/api';

import { baseUrl } from './config';
import { StravaStreams, StreamQuery } from './types';

async function getStream({
  auth,
  id,
  keys,
}: StreamQuery): Promise<StravaStreams> {
  if (!auth) {
    throw new Error('Invalid authentication');
  }

  const wretchInstance = createBasicWretchInstance({
    url: `${baseUrl}/activities/${id}/streams`,
    bearerToken: auth.access_token,
    controller: new AbortController(),
  }).query({
    keys: keys.join(','),
    key_by_type: 'true',
  });

  return (await wretchInstance
    .get()
    .error(429, () => {
      console.error('Rate limited');
      throw new Error('Rate limited');
    })
    .json()
    .catch((error: WretchError) => {
      console.error('Error fetching activity', error);
      throw new Error('Error fetching activity');
    })) as StravaStreams;
}

export { getStream };
