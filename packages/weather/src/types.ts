export type Weather = {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  daily_units: {
    time: string;
    weather_code: string;
    temperature_2m_max: string;
    temperature_2m_min: string;
    apparent_temperature_max: string;
    apparent_temperature_min: string;
    sunrise: string;
    sunset: string;
    daylight_duration: string;
    sunshine_duration: string;
    precipitation_sum: string;
    precipitation_probability_max: string;
    wind_speed_10m_max: string;
    wind_gusts_10m_max: string;
    wind_direction_10m_dominant: string;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    apparent_temperature_max: number[];
    apparent_temperature_min: number[];
    sunrise: string[];
    sunset: string[];
    daylight_duration: number[];
    sunshine_duration: number[];
    precipitation_sum: number[];
    precipitation_probability_max: number[];
    wind_speed_10m_max: number[];
    wind_gusts_10m_max: number[];
    wind_direction_10m_dominant: number[];
  };
};

export type WeatherQuery = {
  forecast_days: number;
  longitude: string | number;
  latitude: string | number;
  dataFields: string[];
  timezone?: string;
};
