import { regularFetch } from '@utils/api';

type Response = {
  maptilerToken: string;
};

export async function getMapTilerToken(): Promise<string> {
  const response = await regularFetch<undefined, undefined, Response>({
    url: '/api/data/env/maptilertoken/',
    method: 'GET',
  });
  return response.response.maptilerToken;
}
