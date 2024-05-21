import {
  DailyWeather,
  DailyWeatherQuery,
  HourlyWeather,
  HourlyWeatherQuery,
} from '@repo/weather';

import { useFetch } from '@hooks/useFetch';

function useDailyWeather({
  query,
  enabled = true,
  background = false,
}: {
  query: DailyWeatherQuery;
  enabled?: boolean;
  background?: boolean;
}) {
  query = {
    ...query,
    longitude: Math.round(query.longitude * 100) / 100,
    latitude: Math.round(query.latitude * 100) / 100,
  };

  return useFetch<undefined, DailyWeatherQuery, DailyWeather>({
    url: '/api/data/weather/daily/',
    method: 'GET',
    query,
    enabled,
    background,
    cache: {
      enabled: true,
      ttl: 4 * 1000 * 60 * 60,
      storageType: 'localStorage',
    },
  });
}

function useHourlyWeather({
  query,
  enabled = true,
  background = false,
}: {
  query: HourlyWeatherQuery;
  enabled?: boolean;
  background?: boolean;
}) {
  query = {
    ...query,
    longitude: Math.round(query.longitude * 100) / 100,
    latitude: Math.round(query.latitude * 100) / 100,
  };

  return useFetch<undefined, HourlyWeatherQuery, HourlyWeather>({
    url: '/api/data/weather/hourly',
    method: 'GET',
    query,
    enabled,
    background,
    cache: {
      enabled: true,
      ttl: 4 * 1000 * 60 * 60,
      storageType: 'localStorage',
    },
  });
}

export { useDailyWeather, useHourlyWeather };
