import { regularFetch } from '@utils/api';

type Query = {
  callbackUrl: string;
  scope: string;
};

type Response = {
  url: string;
};

export async function getStravaUrl(query: Query): Promise<string> {
  const response = await regularFetch<Query, undefined, Response>({
    url: '/api/env/stravaurl',
    query,
    method: 'GET',
  });
  return response.response.url;
}
