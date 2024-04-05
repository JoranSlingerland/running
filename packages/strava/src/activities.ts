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
}: {
  auth: StravaAuthentication;
  before?: number | string;
  after?: number | string;
}): Promise<SummaryActivity[] | undefined> {
  if (!auth) {
    throw new Error('Invalid authentication');
  }

  let page = 1;
  let response: unknown;
  const results = [];
  do {
    const query = constructQuery({ before, after, page, per_page: 200 });

    const wretchInstance = createBasicWretchInstance({
      url: `${baseUrl}/athlete/activities`,
      bearerToken: auth.access_token,
      controller: new AbortController(),
    });

    console.log('Fetching activities', query);

    response = await wretchInstance
      .query(query)
      .get()
      .json()
      .catch((error: WretchError) => {
        console.error('Error fetching activities', error);
        throw new Error('Error fetching activities');
      });

    if (Array.isArray(response)) {
      results.push(...response);
    }

    page++;
  } while (Array.isArray(response) && response.length > 0);

  return results;
}

function constructQuery({ before, after, page, per_page }: ActivitiesQuery) {
  const query: ActivitiesQuery = {};
  if (before) {
    query.before = before;
  }
  if (after) {
    query.after = after;
  }
  query.page = page || 1;
  query.per_page = per_page || 200;
  return query;
}

export { getActivities };
