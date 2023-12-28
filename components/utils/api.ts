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
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      sessionStorage.setItem(key, JSON.stringify(item));
      break;
    } catch (err) {
      if (attempt === 0) {
        removeExpiredItems();
        continue;
      }
      console.error('Failed to set item in sessionStorage:', err);
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

function newKey(url: string, method: string, body?: object, query?: object) {
  let body_string = '';
  let query_string = '';
  if (body) {
    body_string = JSON.stringify(body);
  }
  if (query) {
    query_string = JSON.stringify(query);
  }

  return hash(url + body_string + query_string + method);
}

function removeExpiredItems() {
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key) {
      const itemStr = sessionStorage.getItem(key);
      if (itemStr) {
        const item = JSON.parse(itemStr);
        const now = new Date();
        if (now.getTime() > item.expiry) {
          sessionStorage.removeItem(key);
        }
      }
    }
  }
}

// main functions
async function regularFetch({
  url,
  fallback_data,
  method,
  query,
  body,
  controller,
}: {
  url: string;
  fallback_data?: any;
  method: 'GET' | 'POST' | 'DELETE';
  query?: object;
  body?: object;
  controller?: AbortController;
}): Promise<{
  response: any;
  isError: boolean;
  error: WretchError | undefined;
}> {
  controller = controller || new AbortController();
  let isError = false;
  let error: WretchError | undefined = undefined;

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
  if (isError && fallback_data) {
    return { response: fallback_data, isError: isError, error: error };
  }
  return { response, isError, error };
}

async function cachedFetch({
  url,
  fallback_data,
  method,
  query,
  body,
  hours = 24,
  controller,
  overwrite = false,
}: {
  url: string;
  fallback_data?: any;
  method: 'GET' | 'POST' | 'DELETE';
  query?: any;
  body?: any;
  hours?: number;
  controller?: AbortController;
  overwrite?: boolean;
}): Promise<{
  response: any;
  isError: boolean;
  error: WretchError | undefined;
}> {
  const key = newKey(url, method, body, query);
  let response = getWithExpiry(key);
  let isError = false;
  let error: WretchError | undefined = undefined;
  if (response && !overwrite) {
    return { response, isError, error };
  } else {
    const { response, isError, error } = await regularFetch({
      url,
      fallback_data,
      method,
      body,
      controller,
      query,
    });
    if (isError && fallback_data) {
      return { response: fallback_data, isError, error };
    }
    setWithExpiry(key, response, hours * 1000 * 60 * 60);
    return { response, isError, error };
  }
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

export { ApiWithMessage, regularFetch, cachedFetch };
