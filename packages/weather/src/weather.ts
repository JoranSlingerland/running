import { createWretchInstance } from '@repo/api';

import { Weather, WeatherQuery } from './types';

export async function getWeather({
  forecast_days,
  longitude,
  latitude,
  dataFields,
  timezone = 'auto',
}: WeatherQuery) {
  const url = 'https://api.open-meteo.com/v1/forecast';

  const wretch = createWretchInstance({
    url,
    query: {
      latitude,
      longitude,
      forecast_days,
      timezone,
      daily: dataFields.join(','),
    },
    controller: new AbortController(),
    method: 'GET',
  });

  return (await wretch.json()) as Weather;
}
