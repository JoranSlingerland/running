import { WretchError, createBasicWretchInstance } from '@repo/api';

import { baseUrl } from './config';
import { DetailedActivity, StravaAuthentication } from './types';

async function getActivity({
  auth,
  id,
}: {
  auth: StravaAuthentication;
  id: number | string;
}): Promise<DetailedActivity> {
  if (!auth) {
    throw new Error('Invalid authentication');
  }

  const wretchInstance = createBasicWretchInstance({
    url: `${baseUrl}/activities/${id}`,
    bearerToken: auth.access_token,
    controller: new AbortController(),
  });

  return (
    (await wretchInstance
      .get()
      // TODO: Throw different error for overall rate limit
      .error(429, () => {
        console.error('Rate limited');
        throw new Error('Rate limited');
      })
      .json()
      .catch((error: WretchError) => {
        console.error('Error fetching activity', error);
        throw new Error('Error fetching activity');
      })) as DetailedActivity
  );
}

export { getActivity };
