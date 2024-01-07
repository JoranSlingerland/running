import { useState } from 'react';
import { useDeepCompareEffect } from 'rooks';
import { WretchError } from 'wretch/resolver';
import { regularFetch } from '../utils/api';

interface UseFetchOptions<Body, Query, Response> {
  body?: Body;
  query?: Query;
  url: string;
  method: 'GET' | 'POST' | 'DELETE';
  enabled?: boolean;
  background?: boolean;
  overwrite?: boolean;
  initialData?: Response;
  cache?: {
    enabled: boolean;
    hours?: number;
    storageType?: StorageType;
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
}

interface UseFetchResult<Response> {
  data: Response | undefined;
  isLoading: boolean;
  isError: boolean;
  error: WretchError | undefined;
  refetchData: (params?: { cacheOnly?: boolean }) => void;
  overwriteData: (data: Response) => void;
}

function useFetch<Body, Query, Response>({
  url,
  method,
  body,
  query,
  enabled = true,
  background = false,
  overwrite = false,
  initialData,
  cache,
  message,
}: UseFetchOptions<Body, Query, Response>): UseFetchResult<Response> {
  // Constants
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [refetch, setRefetch] = useState(false);
  const [data, setData] = useState<Response | undefined>(initialData);
  const [cacheOnly, setCacheOnly] = useState(false);
  const [error, setError] = useState<WretchError | undefined>(undefined);

  // Functions
  const refetchData = ({ cacheOnly = false }: { cacheOnly?: boolean } = {}) => {
    setRefetch(true);
    setCacheOnly(cacheOnly);
  };
  const overwriteData = (data: Response) => {
    setData(data);
  };
  const fetchDataAsync = async (abortController: AbortController) => {
    await regularFetch({
      url,
      method,
      query,
      body,
      fallback_data: initialData,
      cache: {
        enabled: cache?.enabled || false,
        hours: cache?.hours || 24,
        overwrite: overwrite || refetch,
        storageType: cache?.storageType || 'sessionStorage',
        customKey: cache?.customKey || undefined,
        useStartEndDates: cache?.useStartEndDates || false,
      },
      controller: abortController,
      message,
    }).then((data) => {
      if (cacheOnly) return;

      setData(data.response);
      setIsError(data.isError);
      setIsLoading(false);
      setRefetch(false);
      setError(data.error);
    });
  };

  // Effects
  useDeepCompareEffect(() => {
    let abortController = new AbortController();

    if (enabled) {
      console.log('useFetch: fetching data');
      setIsError(false);
      setError(undefined);
      setIsLoading(background || refetch ? false : true);
      fetchDataAsync(abortController);
    }

    return () => {
      abortController.abort();
    };
  }, [enabled, refetch, url, method, body, query]);

  return {
    data,
    isLoading,
    isError,
    error,
    refetchData,
    overwriteData,
  };
}

export { useFetch };

export type { UseFetchResult, UseFetchOptions };
