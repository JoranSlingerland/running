import { getWeather } from '@repo/weather';
import type { NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

import { NextApiRequestUnknown } from '@pages/api/types';
import { getQueryParam } from '@utils/api';

export default async function handler(
  req: NextApiRequestUnknown,
  res: NextApiResponse,
) {
  const token = await getToken({ req });
  if (!token) {
    res.status(401).end();
    return;
  }

  switch (req.method) {
    case 'GET':
      await handleGet(res, req);
      break;
    default:
      res.setHeader('Allow', 'GET');
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

async function handleGet(res: NextApiResponse, req: NextApiRequestUnknown) {
  const forecast_days = Number(getQueryParam(req.query, 'days') || '14');
  const longitude = getQueryParam(req.query, 'longitude') || undefined;
  const latitude = getQueryParam(req.query, 'latitude') || undefined;

  if (!longitude || !latitude) {
    res.status(400).json({ message: 'Missing required query parameters' });
    return;
  }

  if (forecast_days < 1 || forecast_days > 16) {
    res.status(400).json({ message: 'Invalid forecast_days parameter' });
    return;
  }

  const daily = [
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

  const response = await getWeather({
    forecast_days,
    longitude,
    latitude,
    dataFields: daily,
  });

  return res.status(200).json(response);
}
