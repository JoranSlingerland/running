import { message as antdMessage } from 'antd';
import wretch from 'wretch';
import QueryStringAddon from 'wretch/addons/queryString';
import AbortAddon from 'wretch/addons/abort';
import hash from 'object-hash';
import { WretchError } from 'wretch/resolver';

// Helper functions
function setWithExpiry<T>(
  key: string,
  value: T,
  ttl: number,
  storageType: StorageType,
) {
  const now = new Date();
  const item = {
    value: value,
    expiry: now.getTime() + ttl,
  };
  const storage = window[storageType];
  try {
    storage.setItem(key, JSON.stringify(item));
  } catch (err) {
    console.error(`Error setting ${storageType} key “${key}”:`, err);
    removeExpiredItems(storageType);
    try {
      storage.setItem(key, JSON.stringify(item));
    } catch (err) {
      console.error(`Error setting ${storageType} key “${key}”:`, err);
    }
  }
}

function getWithExpiry(key: string, storageType: StorageType) {
  const storage = window[storageType];
  const itemStr = storage.getItem(key);
  if (!itemStr) {
    return null;
  }
  const item = JSON.parse(itemStr);
  const now = new Date();
  if (now.getTime() > item.expiry) {
    storage.removeItem(key);
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

function removeExpiredItems(storageType: StorageType) {
  const now = new Date().getTime();
  const storage = window[storageType];
  Object.keys(storage).forEach((key) => {
    const itemStr = storage.getItem(key);
    if (itemStr) {
      const item = JSON.parse(itemStr);
      if (now > item.expiry) {
        storage.removeItem(key);
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
  message,
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
    storageType: StorageType;
  };
  message?: {
    enabled: boolean;
    success: string;
    error: string;
    loading: string;
  };
}): Promise<{
  response: any;
  isError: boolean;
  error: WretchError | undefined;
}> {
  // Variables
  controller = controller || new AbortController();
  let isError = false;
  let error: WretchError | undefined = undefined;
  const key = newKey(url, method, body, query);
  const {
    enabled: messageEnabled,
    success: successMessage,
    error: errorMessage,
    loading: loadingMessage,
  } = message || { enabled: false };
  const {
    enabled: cacheEnabled,
    hours,
    overwrite,
    storageType,
  } = cache || {
    enabled: false,
  };

  // message functions
  const sendErrorMessage = () => {
    antdMessage.error({
      content: errorMessage,
      key: key,
    });
  };

  const sendSuccessMessage = () => {
    antdMessage.success({
      content: successMessage,
      key: key,
    });
  };

  const sendLoadingMessage = () => {
    antdMessage.loading({
      content: loadingMessage,
      key: key,
    });
  };

  if (messageEnabled) {
    sendLoadingMessage();
  }

  // Main logic
  if (cacheEnabled && !overwrite) {
    const response = getWithExpiry(key, storageType);
    if (response) {
      if (messageEnabled) sendSuccessMessage();
      return { response, isError, error };
    }
  }

  const w = wretch()
    .url(url)
    .addon(AbortAddon())
    .addon(QueryStringAddon)
    .signal(controller)
    .query(query || {});

  if (method === 'GET') {
    response = await w
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

  if (isError) {
    if (messageEnabled) sendErrorMessage();
    return {
      response: fallback_data || response,
      isError,
      error,
    };
  }

  if (messageEnabled) sendSuccessMessage();

  if (cacheEnabled) {
    setWithExpiry(key, response, hours * 1000 * 60 * 60, storageType);
  }

  return { response, isError, error };
}

export { regularFetch };
