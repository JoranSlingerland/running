import wretch from 'wretch';
import AbortAddon from 'wretch/addons/abort';
// import QueryStringAddon from 'wretch/addons/queryString';

function createWretchInstance<Query, Body>({
  url,
  method,
  query,
  body,
  controller,
  bearerToken,
}: {
  url: string;
  method: 'GET' | 'POST' | 'DELETE' | string;
  controller: AbortController;
  query?: Query;
  body?: Body;
  bearerToken?: string;
}) {
  if (query) {
    url = queryString(url, query);
  }

  const wretchInstance = wretch()
    .url(url)
    .addon(AbortAddon())
    .signal(controller);

  if (bearerToken) {
    wretchInstance.auth(`Bearer ${bearerToken}`);
  }

  switch (method) {
    case 'GET':
      return wretchInstance.get();
    case 'POST':
      return wretchInstance.json(body || {}).post();
    case 'DELETE':
      return wretchInstance.json(body || {}).delete();
    default:
      throw new Error('Invalid method');
  }
}

function queryString(url: string, query: Record<string, string>) {
  return `${url}?${new URLSearchParams(query).toString()}`;
}

function createBasicWretchInstance({
  url,
  controller,
  bearerToken,
}: {
  url: string;
  controller: AbortController;
  bearerToken?: string;
}) {
  const wretchInstance = wretch()
    .url(url)
    .addon(AbortAddon())
    .signal(controller);

  if (bearerToken) {
    wretchInstance.auth(`Bearer ${bearerToken}`);
  }

  return wretchInstance;
}

export { createWretchInstance, createBasicWretchInstance };
