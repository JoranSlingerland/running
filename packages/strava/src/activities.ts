import { WretchError, createBasicWretchInstance } from '@repo/api';

import { baseUrl } from './config';
import {
  ActivitiesQuery,
  StravaAuthentication,
  SummaryActivity,
} from './types';

async function getActivities({
  auth,
  before,
  after,
  page = 1,
  per_page = 200,
}: {
  auth: StravaAuthentication;
  before?: number | string;
  after?: number | string;
  page?: number;
  per_page?: number;
}): Promise<SummaryActivity[] | undefined> {
  if (!auth) {
    throw new Error('Invalid authentication');
  }

  const wretchInstance = createBasicWretchInstance({
    url: `${baseUrl}/athlete/activities`,
    bearerToken: auth.access_token,
    controller: new AbortController(),
  });
  const query: ActivitiesQuery = { before, after, page, per_page };

  console.log('Fetching activities', query);
  return (await wretchInstance
    .query(query)
    .get()
    .json()
    .catch((error: WretchError) => {
      console.error('Error fetching activities', error);
      throw new Error('Error fetching activities');
    })) as SummaryActivity[];
}

export { getActivities };
