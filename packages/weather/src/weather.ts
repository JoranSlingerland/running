import { createWretchInstance } from '@repo/api';

import { baseUrl } from './config';
import {
  DailyWeather,
  DailyWeatherQuery,
  HourlyWeather,
  HourlyWeatherQuery,
} from './types';

export async function getDailyWeather({
  forecast_days,
  longitude,
  latitude,
}: DailyWeatherQuery) {
  const dataFields = [
    'weather_code',
    'temperature_2m_max',
    'temperature_2m_min',
    'apparent_temperature_max',
    'apparent_temperature_min',
    'sunrise',
    'sunset',
    'daylight_duration',
    'sunshine_duration',
    'precipitation_sum',
    'precipitation_probability_max',
    'wind_speed_10m_max',
    'wind_gusts_10m_max',
    'wind_direction_10m_dominant',
  ];

  const wretch = createWretchInstance({
    url: baseUrl,
    query: {
      latitude,
      longitude,
      forecast_days,
      daily: dataFields.join(','),
      wind_speed_unit: 'ms',
      timezone: 'auto',
    },
    controller: new AbortController(),
    method: 'GET',
  });

  return (await wretch.json()) as DailyWeather;
}

export async function getHourlyWeather({
  latitude,
  longitude,
  date,
}: HourlyWeatherQuery) {
  const dataFields = [
    'temperature_2m',
    'precipitation_probability',
    'precipitation',
    'weather_code',
    'wind_speed_10m',
    'wind_gusts_10m',
    'wind_direction_10m',
  ];

  const wretch = createWretchInstance({
    url: baseUrl,
    query: {
      latitude,
      longitude,
      start_date: date,
      end_date: date,
      hourly: dataFields.join(','),
      wind_speed_unit: 'ms',
      timezone: 'auto',
    },
    controller: new AbortController(),
    method: 'GET',
  });

  return (await wretch.json()) as HourlyWeather;
}
