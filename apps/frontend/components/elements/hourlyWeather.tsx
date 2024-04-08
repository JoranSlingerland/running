import { DailyWeather, HourlyWeather } from '@repo/weather';
import dayjs, { Dayjs } from 'dayjs';
import { MoveDown } from 'lucide-react';
import { useGeolocation } from 'rooks';

import { useProps } from '@hooks/useProps';
import useSessionStorageState from '@hooks/useSessionStorageState';
import { useHourlyWeather } from '@services/data/weather';
import { Chart } from '@ui/AreaChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ui/tabs';
import { Text } from '@ui/typography';
import { formatSpeed } from '@utils/formatting';

type WeatherData = {
  Time: string;
  Temperature: number;
  'Precipitation Probability': number;
  Precipitation: number;
  'Weather Code': number;
  'Wind Speed': number;
  'Wind Gusts': number;
  'Wind Direction': number;
};

function HourlyWeatherBlock({
  date,
  weather,
}: {
  date: Dayjs;
  weather: {
    weather?: DailyWeather;
    isLoading: boolean;
    enabled: boolean;
    index: number;
  };
}) {
  const { userSettings } = useProps();
  const geoLocation = useGeolocation({
    when: userSettings?.data?.preferences.enable_weather,
  });
  const [selectedTab, setSelectedTab] = useSessionStorageState<string>(
    'hourlyWeatherBlockSelectedTab',
    'temperature',
  );

  const hourlyWeather = useHourlyWeather({
    query: {
      date: date.format('YYYY-MM-DD'),
      latitude: geoLocation?.lat || 0,
      longitude: geoLocation?.lng || 0,
    },
    enabled: geoLocation?.isError === false,
  });

  const tableData = convertData(hourlyWeather.data);

  return (
    <>
      <Tabs
        onValueChange={(value) => setSelectedTab(value)}
        value={selectedTab}
      >
        {/* Centers tabs */}
        <div className="flex justify-center">
          <TabsList>
            <TabsTrigger value="temperature">Temperature</TabsTrigger>
            <TabsTrigger value="precipitation">Precipitation</TabsTrigger>
            <TabsTrigger value="wind">Wind</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="temperature" className="pt-2">
          <div className="flex flex-row items-baseline space-x-1">
            <Text size="large">
              {weather.weather?.daily.temperature_2m_max[weather.index]}°
            </Text>
            <Text type="muted">
              {weather.weather?.daily.temperature_2m_min[weather.index]}°
            </Text>
          </div>
          <div className="h-48">
            <Chart
              data={tableData}
              areas={[
                {
                  dataKey: 'Temperature',
                  animationDuration: 0,
                  useGradient: true,
                },
              ]}
              xAxis={[
                {
                  dataKey: 'Time',
                  tickFormatter(value) {
                    return `${value}:00`;
                  },
                },
              ]}
              colors={['blue']}
              yAxis={[
                {
                  tickFormatter(value) {
                    return `${value}°C`;
                  },
                  orientation: 'right',
                },
              ]}
              toolTip={{
                enabled: true,
                formatter(value) {
                  return `${value}°C`;
                },
                labelFormatter(label) {
                  return `${label}:00`;
                },
              }}
              isLoading={hourlyWeather.isLoading}
            />
          </div>
        </TabsContent>
        <TabsContent value="precipitation">
          <div className="flex flex-row items-baseline space-x-1">
            <Text size="large">
              {weather.weather?.daily.precipitation_sum[weather.index]} mm
            </Text>
            <Text type="muted">
              {
                weather.weather?.daily.precipitation_probability_max[
                  weather.index
                ]
              }
              %
            </Text>
          </div>
          <div className="h-48">
            <Chart
              data={tableData}
              areas={[
                {
                  dataKey: 'Precipitation',
                  animationDuration: 0,
                  useGradient: true,
                },
              ]}
              xAxis={[
                {
                  dataKey: 'Time',
                  tickFormatter(value) {
                    return `${value}:00`;
                  },
                },
              ]}
              colors={['blue']}
              yAxis={[
                {
                  tickFormatter(value) {
                    return `${value}mm`;
                  },
                  orientation: 'right',
                },
              ]}
              toolTip={{
                enabled: true,
                formatter(value) {
                  return `${value}mm`;
                },
                labelFormatter(label) {
                  return `${label}:00`;
                },
              }}
              isLoading={hourlyWeather.isLoading}
            />
          </div>
        </TabsContent>
        <TabsContent value="wind">
          <div className="flex flex-row items-baseline space-x-1">
            <Text size="large">
              {formatSpeed({
                metersPerSecond:
                  weather.weather?.daily.wind_speed_10m_max[weather.index],
                units: userSettings?.data?.preferences.units || 'metric',
                decimals: 1,
              })}
            </Text>
            <Text type="muted">
              {formatSpeed({
                metersPerSecond:
                  weather.weather?.daily.wind_gusts_10m_max[weather.index],
                units: userSettings?.data?.preferences.units || 'metric',
                decimals: 1,
              })}
            </Text>
            <MoveDown
              style={{
                transform: `rotate(${
                  weather.weather?.daily.wind_direction_10m_dominant[
                    weather.index
                  ]
                }deg)`,
              }}
              className="size-4"
            />
          </div>
          <div className="h-48">
            <Chart
              data={tableData}
              areas={[
                {
                  dataKey: 'Wind Speed',
                  animationDuration: 0,
                  useGradient: true,
                },
                {
                  dataKey: 'Wind Gusts',
                  animationDuration: 0,
                  useGradient: true,
                },
              ]}
              xAxis={[
                {
                  dataKey: 'Time',
                  tickFormatter(value) {
                    return `${value}:00`;
                  },
                },
              ]}
              colors={['blue', 'teal']}
              yAxis={[
                {
                  tickFormatter(value) {
                    return formatSpeed({
                      metersPerSecond: value as number,
                      units: userSettings?.data?.preferences.units || 'metric',
                      decimals: 0,
                    });
                  },
                  orientation: 'right',
                },
              ]}
              toolTip={{
                enabled: true,
                formatter(value) {
                  return `${formatSpeed({
                    metersPerSecond: value as number,
                    units: userSettings?.data?.preferences.units || 'metric',
                    decimals: 1,
                  })}`;
                },
                labelFormatter(label) {
                  return `${label}:00`;
                },
              }}
              isLoading={hourlyWeather.isLoading}
            />
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}

const convertData = (data: HourlyWeather | undefined): WeatherData[] => {
  const result: WeatherData[] = [];

  if (!data) {
    return result;
  }

  const hourly = data.hourly;

  for (let i = 0; i < hourly.time.length; i++) {
    const weatherObj: WeatherData = {
      Time: dayjs(hourly.time[i]).format('HH'),
      Temperature: hourly.temperature_2m[i],
      'Precipitation Probability': hourly.precipitation_probability[i],
      Precipitation: hourly.precipitation[i],
      'Weather Code': hourly.weather_code[i],
      'Wind Speed': hourly.wind_speed_10m[i],
      'Wind Gusts': hourly.wind_gusts_10m[i],
      'Wind Direction': hourly.wind_direction_10m[i],
    };

    result.push(weatherObj);
  }

  return result;
};

export { HourlyWeatherBlock };
