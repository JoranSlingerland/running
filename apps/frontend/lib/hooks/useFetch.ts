import { WretchError } from '@repo/api';
import { useState } from 'react';
import { useDeepCompareEffect } from 'rooks';

import { regularFetch } from '@utils/api';

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
  refetchData: (params?: { setLoading?: boolean; overwrite?: boolean }) => void;
  overwriteData: (data: Response) => void;
}

function useFetch<Body, Query, Response>({
  url,
  method,
  body,
  query,
  enabled = true,
  background = false,
  overwrite: initialOverwrite = false,
  initialData,
  cache,
  message,
}: UseFetchOptions<Body, Query, Response>): UseFetchResult<Response> {
  // Constants
  const [isError, setIsError] = useState(false);
  const [refetch, setRefetch] = useState(false);
  const [data, setData] = useState<Response | undefined>(initialData);
  const [error, setError] = useState<WretchError | undefined>(undefined);
  const [overwrite, setOverwrite] = useState(initialOverwrite);
  const [isLoading, setIsLoading] = useState(
    background || overwrite ? false : true,
  );

  // Functions
  const refetchData = ({
    setLoading = false,
    overwrite = false,
  }: {
    query?: Query;
    setLoading?: boolean;
    overwrite?: boolean;
  } = {}) => {
    setRefetch(true);
    setIsLoading(setLoading);
    setOverwrite(overwrite);
  };
  const overwriteData = (data: Response) => {
    setData(data);
  };

  const fetchDataAsync = async (abortController: AbortController) => {
    await regularFetch<Query, Body, Response>({
      url,
      method,
      query,
      body,
      fallback_data: initialData,
      cache: {
        enabled: cache?.enabled || false,
        hours: cache?.hours || 24,
        overwrite: overwrite,
        storageType: cache?.storageType || 'sessionStorage',
        customKey: cache?.customKey || undefined,
        useStartEndDates: cache?.useStartEndDates || false,
      },
      controller: abortController,
      message,
    }).then((data) => {
      setData(data.response);
      setIsError(data.isError);
      setIsLoading(false);
      setRefetch(false);
      setError(data.error);
    });
  };

  // Effects
  useDeepCompareEffect(() => {
    const abortController = new AbortController();

    if (enabled) {
      setIsError(false);
      setError(undefined);

      // Refetch will set loading in the refetchData function
      if (!refetch) {
        setIsLoading(true);
      }

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
