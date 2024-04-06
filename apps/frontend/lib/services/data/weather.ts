import { Weather } from '@repo/weather';

import { useFetch } from '@hooks/useFetch';

type Query = {
  days?: number;
  longitude: number | string;
  latitude: number | string;
};

function useWeather({
  query,
  enabled = true,
  background = false,
}: {
  query?: Query;
  enabled?: boolean;
  background?: boolean;
}) {
  return useFetch<undefined, Query, Weather>({
    url: '/api/data/weather',
    method: 'GET',
    query,
    enabled,
    background,
    cache: {
      enabled: true,
      hours: 4,
      storageType: 'localStorage',
      customKey: 'weather',
      useStartEndDates: false,
    },
  });
}

export { useWeather };
