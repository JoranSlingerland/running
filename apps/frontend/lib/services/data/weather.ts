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
  return useFetch<undefined, DailyWeatherQuery, DailyWeather>({
    url: '/api/data/weather/daily',
    method: 'GET',
    query,
    enabled,
    background,
    cache: {
      enabled: true,
      hours: 4,
      storageType: 'localStorage',
      customKey: 'weather',
    },
  });
}

function useHourlyWeather({
  query,
  enabled = true,
  background = false,
}: {
  query?: HourlyWeatherQuery;
  enabled?: boolean;
  background?: boolean;
}) {
  return useFetch<undefined, HourlyWeatherQuery, HourlyWeather>({
    url: '/api/data/weather/hourly',
    method: 'GET',
    query,
    enabled,
    background,
    cache: {
      enabled: true,
      hours: 4,
      storageType: 'localStorage',
    },
  });
}

export { useDailyWeather, useHourlyWeather };
