import { WretchError, createBasicWretchInstance } from '@repo/api';

import { baseUrl } from './config';
import { StravaStreams, StreamQuery } from './types';

async function getStream({
  auth,
  id,
  keys,
}: StreamQuery): Promise<StravaStreams | undefined> {
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
    .notFound(() => {
      console.error('Activity not found');
      throw new Error('Activity not found');
    })
    .json()
    .catch((error: WretchError) => {
      console.error('Error fetching activity', error);
      if (error.message === 'Activity not found') {
        return undefined;
      } else {
        throw new Error('Error fetching activity');
      }
    })) as StravaStreams | undefined;
}

export { getStream };
