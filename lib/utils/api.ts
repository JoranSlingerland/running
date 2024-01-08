import { message as antdMessage } from 'antd';
import wretch from 'wretch';
import QueryStringAddon from 'wretch/addons/queryString';
import AbortAddon from 'wretch/addons/abort';
import hash from 'object-hash';
import { WretchError } from 'wretch/resolver';

const MILLISECONDS_IN_HOUR = 1000 * 60 * 60;

// Types
type cachedResponse = {
  value: any;
  expiry: number;
  start_end_dates?: [string, string][];
};

// Helper functions
function setWithExpiry<T>(
  key: string,
  value: T,
  ttl: number,
  storageType: StorageType,
  start_end_dates?: [string, string][],
) {
  const now = new Date();
  const item = {
    value: value,
    expiry: now.getTime() + ttl,
    ...(start_end_dates && { start_end_dates: start_end_dates }),
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

function getWithExpiry(
  key: string,
  storageType: StorageType,
): null | cachedResponse {
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
  return item;
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

function deDupeData<T>(data: T[], deDupeKey: string) {
  const seen = new Set();
  return data.filter((item: any) => {
    const duplicate = seen.has(item[deDupeKey]);
    seen.add(item[deDupeKey]);
    return !duplicate;
  });
}

function mergeStartEndDates(
  start_end_dates: [string, string][],
): [string, string][] {
  if (start_end_dates.length === 1) {
    return start_end_dates;
  } else {
    const sorted = start_end_dates.sort((a, b) => {
      return new Date(a[0]).getTime() - new Date(b[0]).getTime();
    });

    const merged: [string, string][] = [];
    let current = sorted[0];
    for (let i = 1; i < sorted.length; i++) {
      const [current_start, current_end] = current;
      const [next_start, next_end] = sorted[i];
      if (new Date(current_end) >= new Date(next_start)) {
        current = [
          current_start,
          new Date(current_end) > new Date(next_end) ? current_end : next_end,
        ];
      } else {
        merged.push(current);
        current = sorted[i];
      }
    }
    merged.push(current);
    return merged;
  }
}

function handleCacheSet<Query>({
  cache,
  cachedResponse,
  query,
  key,
  response,
  hours,
  storageType,
}: {
  cache?: {
    useStartEndDates?: boolean;
    deDupeKey?: string;
  };
  cachedResponse: cachedResponse | null;
  query?: Query;
  key: string;
  response: any;
  hours: number;
  storageType: StorageType;
}) {
  if (cache?.useStartEndDates) {
    const { startDate, endDate } = query as any;
    const cachedData = cachedResponse?.value || [];
    const newData = cachedData.concat(response);
    const deDupedData = deDupeData(newData, cache.deDupeKey || 'id');
    let start_end_dates: [string, string][] = [];
    if (!cachedResponse?.start_end_dates) {
      start_end_dates = [[startDate, endDate]];
    } else {
      start_end_dates = cachedResponse.start_end_dates.concat([
        [startDate, endDate],
      ]);
      start_end_dates = mergeStartEndDates(start_end_dates);
    }

    setWithExpiry(
      key,
      deDupedData,
      hours * MILLISECONDS_IN_HOUR,
      storageType,
      start_end_dates,
    );
  } else {
    setWithExpiry(key, response, hours * MILLISECONDS_IN_HOUR, storageType);
  }
}

function createWretchInstance<Query, Body>({
  url,
  method,
  query,
  body,
  controller,
}: {
  url: string;
  method: 'GET' | 'POST' | 'DELETE';
  controller: AbortController;
  query?: Query;
  body?: Body;
}) {
  let wretchInstance;
  wretchInstance = wretch()
    .url(url)
    .addon(AbortAddon())
    .addon(QueryStringAddon)
    .signal(controller)
    .query(query || {});

  switch (method) {
    case 'GET':
      wretchInstance = wretchInstance.get();
      break;
    case 'POST':
      wretchInstance = wretchInstance.json(body || {}).post();
      break;
    case 'DELETE':
      wretchInstance = wretchInstance.json(body || {}).delete();
      break;
    default:
      throw new Error('Invalid method');
  }
  return wretchInstance;
}

function processCachedResponse<Query>(
  cachedResponse: any,
  messageEnabled: boolean,
  sendSuccessMessage: Function,
  cache: any,
  query: Query,
  isError: boolean,
  error: any,
) {
  if (cachedResponse) {
    if (messageEnabled) sendSuccessMessage();
    if (cache?.useStartEndDates) {
      const { startDate, endDate } = query as any;
      var fallsWithin = false;

      if (Array.isArray(cachedResponse.start_end_dates)) {
        for (const [
          cache_start_date,
          cache_end_date,
        ] of cachedResponse.start_end_dates) {
          if (
            new Date(startDate) >= new Date(cache_start_date) &&
            new Date(endDate) <= new Date(cache_end_date)
          ) {
            fallsWithin = true;
            break;
          }
        }
      }
      if (fallsWithin) {
        return { response: cachedResponse.value, isError, error };
      }
    } else {
      return { response: cachedResponse.value, isError, error };
    }
  }
  return null;
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
    customKey?: string;
    useStartEndDates?: boolean;
    deDupeKey?: string;
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
  let cachedResponse: cachedResponse | null = null;
  const key = cache?.customKey || newKey(url, method, body, query);
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

  // Define message functions
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

  // Start main logic
  if (messageEnabled) {
    sendLoadingMessage();
  }

  // Check cache
  if (cacheEnabled && !overwrite) {
    cachedResponse = getWithExpiry(key, storageType);
    const processedResponse = processCachedResponse(
      cachedResponse,
      messageEnabled,
      sendSuccessMessage,
      cache,
      query,
      isError,
      error,
    );
    if (processedResponse) {
      return processedResponse;
    }
  }

  // Fetch data
  const wretchInstance = createWretchInstance({
    url,
    method,
    query,
    body,
    controller,
  });
  const response = await wretchInstance
    .onAbort(() => {
      isError = true;
    })
    .json()
    .catch((err: WretchError) => {
      isError = true;
      error = err;
    });

  // Handle errors
  if (isError) {
    if (messageEnabled) sendErrorMessage();
    return {
      response: fallback_data || response,
      isError,
      error,
    };
  }

  // Handle cache
  if (cacheEnabled) {
    handleCacheSet({
      cache,
      cachedResponse,
      query,
      key,
      response,
      hours,
      storageType,
    });
  }

  // Handle success
  if (messageEnabled) sendSuccessMessage();
  return { response, isError, error };
}

export { regularFetch };
