import { message } from 'antd';
import wretch from 'wretch';
import QueryStringAddon from 'wretch/addons/queryString';
import AbortAddon from 'wretch/addons/abort';
import hash from 'object-hash';
import { WretchError } from 'wretch/resolver';

// Helper functions
function setWithExpiry<T>(key: string, value: T, ttl: number) {
  const now = new Date();
  const item = {
    value: value,
    expiry: now.getTime() + ttl,
  };
  try {
    sessionStorage.setItem(key, JSON.stringify(item));
  } catch (err) {
    console.error('Failed to set item in sessionStorage:', err);
    removeExpiredItems();
    try {
      sessionStorage.setItem(key, JSON.stringify(item));
    } catch (err) {
      console.error(
        'Failed to set item in sessionStorage after removing expired items:',
        err,
      );
    }
  }
}

function getWithExpiry(key: string) {
  const itemStr = sessionStorage.getItem(key);
  if (!itemStr) {
    return null;
  }
  const item = JSON.parse(itemStr);
  const now = new Date();
  if (now.getTime() > item.expiry) {
    sessionStorage.removeItem(key);
    return null;
  }
  return item.value;
}

function newKey<Query, Body>(
  url: string,
  method: string,
  body?: Body,
  query?: Query,
) {
  const body_string = body ? JSON.stringify(body) : '';
  const query_string = query ? JSON.stringify(query) : '';

  return hash(url + body_string + query_string + method);
}

function removeExpiredItems() {
  const now = new Date().getTime();
  Object.keys(sessionStorage).forEach((key) => {
    const itemStr = sessionStorage.getItem(key);
    if (itemStr) {
      const item = JSON.parse(itemStr);
      if (now > item.expiry) {
        sessionStorage.removeItem(key);
      }
    }
  });
}

// main functions
async function regularFetch<Query, Body>({
  url,
  method,
  query,
  body,
  fallback_data,
  cache,
  controller,
}: {
  url: string;
  fallback_data?: any;
  method: 'GET' | 'POST' | 'DELETE';
  query?: Query;
  body?: Body;
  controller?: AbortController;
  cache?: {
    enabled: boolean;
    hours: number;
    overwrite: boolean;
  };
}): Promise<{
  response: any;
  isError: boolean;
  error: WretchError | undefined;
}> {
  controller = controller || new AbortController();
  let isError = false;
  let error: WretchError | undefined = undefined;
  const key = newKey(url, method, body, query);

  if (cache && cache.enabled && !cache.overwrite) {
    const response = getWithExpiry(key);
    if (response) {
      return { response, isError, error };
    }
  }

  const w = wretch()
    .url(url)
    .addon(AbortAddon())
    .addon(QueryStringAddon)
    .signal(controller);

  if (method === 'GET') {
    response = await w
      .query(query || {})
      .get()
      .onAbort(() => {
        isError = true;
      })
      .json()
      .catch((err: WretchError) => {
        isError = true;
        error = err;
      });
  } else if (method === 'POST') {
    var response = await w
      .query(query || {})
      .json(body || {})
      .post()
      .onAbort(() => {
        isError = true;
      })
      .json()
      .catch((err: WretchError) => {
        isError = true;
        error = err;
      });
  } else if (method === 'DELETE') {
    var response = await w
      .query(query || {})
      .json(body || {})
      .delete()
      .onAbort(() => {
        isError = true;
      })
      .json()
      .catch((err: WretchError) => {
        isError = true;
        error = err;
      });
  } else {
    isError = true;
  }

  if (cache && cache.enabled && !isError) {
    setWithExpiry(key, response, cache.hours * 1000 * 60 * 60);
  }

  if (isError && fallback_data) {
    return { response: fallback_data, isError: isError, error: error };
  }
  return { response, isError, error };
}

async function ApiWithMessage({
  url,
  runningMessage,
  successMessage,
  method,
  body,
  query,
}: {
  url: string;
  runningMessage: string;
  successMessage: string;
  method: 'GET' | 'POST' | 'DELETE';
  body?: object;
  query?: object;
}): Promise<void> {
  const hide = message.loading(runningMessage, 10);

  const response = await regularFetch({
    url,
    method,
    body,
    query,
  });

  if (response.isError) {
    hide();
    message.error('Something went wrong :(');
  } else {
    hide();
    message.success(successMessage);
  }
}

export { ApiWithMessage, regularFetch };
