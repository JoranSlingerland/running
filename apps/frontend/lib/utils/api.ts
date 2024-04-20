import { WretchError, createWretchInstance } from '@repo/api';
import hash from 'object-hash';
import { toast } from 'sonner';

import { NextApiRequestUnknown } from '@pages/api/types';

const MILLISECONDS_IN_HOUR = 1000 * 60 * 60;

// Types
type CachedResponse<Response> = {
  value: Response;
  expiry: number;
  start_end_dates?: [string, string][];
};

type CacheSettings = {
  enabled: boolean;
  hours: number;
  overwrite: boolean;
  storageType: StorageType;
  customKey?: string;
  useStartEndDates?: boolean;
  deDupeKey?: string;
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

function getWithExpiry<Response>(
  key: string,
  storageType: StorageType,
): null | CachedResponse<Response> {
  const storage = window[storageType];
  const itemStr = storage.getItem(key);
  if (!itemStr) {
    return null;
  }
  const item: CachedResponse<Response> = JSON.parse(itemStr);
  const now = new Date();
  if (now.getTime() > item.expiry) {
    storage.removeItem(key);
    return null;
  }
  return item;
}

function removeItem(key: string, storageType: StorageType) {
  const storage = window[storageType];
  storage.removeItem(key);
}

function removeExpiredItems(storageType: StorageType) {
  const now = new Date().getTime();
  const storage = window[storageType];
  Object.keys(storage).forEach((key) => {
    const itemStr = storage.getItem(key);
    if (itemStr) {
      const item: CachedResponse<Response> = JSON.parse(itemStr);
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

function deDupeData<T>(data: T[], deDupeKey: keyof T): T[] {
  const seen = new Set<T[keyof T]>();
  return data.filter((item) => {
    const duplicate = seen.has(item[deDupeKey]);
    seen.add(item[deDupeKey]);
    return !duplicate;
  }) as T[];
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

function handleCacheSet<Query, Response>({
  cache,
  cachedResponse,
  query,
  key,
  response,
  hours,
  storageType,
}: {
  cache?: CacheSettings;
  cachedResponse: CachedResponse<Response> | null;
  query?: Query;
  key: string;
  response: Response;
  hours: number;
  storageType: StorageType;
}) {
  let data: Response[] | Response;
  let start_end_dates: [string, string][] | undefined = undefined;

  if (cache?.useStartEndDates) {
    if (
      !query ||
      typeof query !== 'object' ||
      !('startDate' in query) ||
      !('endDate' in query) ||
      typeof query.startDate !== 'string' ||
      typeof query.endDate !== 'string'
    ) {
      console.warn(
        'Invalid query. Query must be an object with startDate and endDate as strings for useStartEndDates',
      );
      return;
    }

    const { startDate, endDate } = query;
    const cachedData = cachedResponse?.value || [];
    const newData = (cachedData as Response[]).concat(response);
    const deDupedData = deDupeData(
      newData,
      (cache.deDupeKey as keyof Response) || ('_id' as keyof Response),
    );

    if (!cachedResponse?.start_end_dates) {
      start_end_dates = [[startDate, endDate]];
    } else {
      start_end_dates = cachedResponse.start_end_dates.concat([
        [startDate, endDate],
      ]);
      start_end_dates = mergeStartEndDates(start_end_dates);
    }
    data = deDupedData;
  } else {
    data = response;
  }

  setWithExpiry(
    key,
    data,
    hours * MILLISECONDS_IN_HOUR,
    storageType,
    cache?.useStartEndDates ? start_end_dates : undefined,
  );
}

function processCachedResponse<Query, Response>(
  cachedResponse: CachedResponse<Response> | null,
  messageEnabled: boolean,
  sendSuccessMessage: () => void,
  cache: CacheSettings | undefined,
  query: Query,
  isError: boolean,
  error: WretchError | undefined,
) {
  if (!cachedResponse) {
    return null;
  }

  if (messageEnabled) sendSuccessMessage();

  if (!cache?.useStartEndDates) {
    return { response: cachedResponse.value, isError, error };
  }

  if (
    !query ||
    typeof query !== 'object' ||
    !('startDate' in query) ||
    !('endDate' in query) ||
    typeof query.startDate !== 'string' ||
    typeof query.endDate !== 'string'
  ) {
    console.warn(
      'Invalid query. Query must be an object with startDate and endDate as strings for useStartEndDates',
    );
    return;
  }
  const { startDate, endDate } = query;
  let fallsWithin = false;

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
}

function showMessage(
  errorMessage: string | undefined,
  successMessage: string | undefined,
) {
  // Define message functions
  const sendErrorMessage = () => {
    toast.dismiss();
    toast.error(errorMessage);
  };

  const sendSuccessMessage = () => {
    toast.dismiss();
    toast.success(successMessage);
  };

  // Return the message functions so they can be used outside this function
  return { sendErrorMessage, sendSuccessMessage };
}

// main functions
// eslint-disable-next-line sonarjs/cognitive-complexity
async function regularFetch<
  Query extends object | string | undefined,
  Body,
  Response,
>({
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
  fallback_data?: Response;
  method: 'GET' | 'POST' | 'DELETE';
  query?: Query;
  body?: Body;
  controller?: AbortController;
  cache?: CacheSettings;
  message?: {
    enabled: boolean;
    success: string;
    error: string;
    loading: string;
  };
}): Promise<{
  response: Response;
  isError: boolean;
  error: WretchError | undefined;
}> {
  // Variables
  controller = controller || new AbortController();
  let isError = false;
  let error: WretchError | undefined = undefined;
  let cachedResponse: CachedResponse<Response> | null = null;
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
  const { sendErrorMessage, sendSuccessMessage } = showMessage(
    errorMessage,
    successMessage,
  );

  // Start main logic
  if (messageEnabled) {
    toast.loading(loadingMessage);
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

  // Clear cache
  if (overwrite && cacheEnabled) {
    removeItem(key, storageType);
  }

  // Fetch data
  const wretchInstance = createWretchInstance({
    url,
    method,
    query,
    body,
    controller,
  });
  const response = (await wretchInstance
    .onAbort(() => {
      isError = true;
    })
    .json()
    .catch((err: WretchError) => {
      isError = true;
      error = err;
    })) as Response;

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

function getQueryParam(query: NextApiRequestUnknown['query'], param: string) {
  const value = query[param];
  return Array.isArray(value) ? undefined : value;
}

export { regularFetch, getQueryParam };
