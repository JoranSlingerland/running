import { useState } from 'react';
import { useDeepCompareEffect } from 'ahooks';
import { WretchError } from 'wretch/resolver';

interface UseFetchOptions<Body, Query, Response> {
  body?: Body;
  query?: Query;
  fetchData: (params: {
    query?: Query;
    body?: Body;
    abortController: AbortController;
    overwrite?: boolean;
  }) => Promise<{
    response: Response;
    isError: boolean;
    error: WretchError | undefined;
  }>;
  enabled?: boolean;
  background?: boolean;
  overwrite?: boolean;
  initialData?: Response;
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
  body,
  query,
  fetchData,
  enabled = true,
  background = false,
  overwrite = false,
  initialData,
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
    await fetchData({
      body,
      query,
      abortController,
      overwrite: overwrite || refetch,
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
      setIsError(false);
      setError(undefined);
      setIsLoading(background || refetch ? false : true);
      fetchDataAsync(abortController);
    }

    return () => {
      abortController.abort();
    };
  }, [enabled, refetch, body, query]);

  return { data, isLoading, isError, error, refetchData, overwriteData };
}

export { useFetch };

export type { UseFetchResult, UseFetchOptions };
