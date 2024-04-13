import { HourlyWeather } from '@repo/weather';
import dayjs, { Dayjs } from 'dayjs';
import { MoveDown } from 'lucide-react';
import React, { useState } from 'react';
import { useGeolocation } from 'rooks';

import { useProps } from '@hooks/useProps';
import useSessionStorageState from '@hooks/useSessionStorageState';
import { useHourlyWeather } from '@services/data/weather';
import { Chart } from '@ui/chart';
import { Skeleton } from '@ui/skeleton';
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

type TextLoadingProps = {
  children: React.ReactNode;
  isLoading: boolean;
};

const TextLoading: React.FC<TextLoadingProps> = ({ children, isLoading }) => {
  return isLoading ? <Skeleton className="h-4 w-12" /> : children;
};

function HourlyWeatherBlock({ date }: { date: Dayjs }) {
  const { userSettings } = useProps();
  const geoLocation = useGeolocation({
    when: userSettings?.data?.preferences.enable_weather,
  });
  const [selectedTab, setSelectedTab] = useSessionStorageState<string>(
    'hourlyWeatherBlockSelectedTab',
    'temperature',
  );
  const [dataIndex, setDataIndex] = useState<number>(0);

  const hourlyWeather = useHourlyWeather({
    query: {
      date: date.format('YYYY-MM-DD'),
      latitude: geoLocation?.lat || 0,
      longitude: geoLocation?.lng || 0,
    },
    enabled: geoLocation?.isError === false,
  });

  const hourlyWeatherData = hourlyWeather.data?.hourly;

  const tableData = convertData(hourlyWeather.data);
  return (
    <>
      <div className="grid grid-cols-3 grid-rows-1 items-center justify-center py-2">
        <div className="flex flex-row items-baseline justify-center space-x-1">
          <TextLoading isLoading={hourlyWeather.isLoading}>
            <Text bold size="large">
              {hourlyWeatherData?.temperature_2m[dataIndex]}°
            </Text>
          </TextLoading>
        </div>
        <div className="flex flex-row items-baseline justify-center space-x-1">
          <TextLoading isLoading={hourlyWeather.isLoading}>
            <Text bold size="large">
              {hourlyWeatherData?.precipitation[dataIndex]} mm
            </Text>
          </TextLoading>
          <TextLoading isLoading={hourlyWeather.isLoading}>
            <Text type={'muted'}>
              {hourlyWeatherData?.precipitation_probability[dataIndex]}%
            </Text>
          </TextLoading>
        </div>
        <div className="flex flex-row items-baseline justify-center space-x-1">
          <TextLoading isLoading={hourlyWeather.isLoading}>
            <Text bold size="large">
              {formatSpeed({
                metersPerSecond: hourlyWeatherData?.wind_speed_10m[dataIndex],
                units: userSettings?.data?.preferences.units || 'metric',
                decimals: 1,
              })}
            </Text>
          </TextLoading>
          <TextLoading isLoading={hourlyWeather.isLoading}>
            <Text type={'muted'}>
              {formatSpeed({
                metersPerSecond: hourlyWeatherData?.wind_gusts_10m[dataIndex],
                units: userSettings?.data?.preferences.units || 'metric',
                decimals: 1,
              })}
            </Text>
          </TextLoading>
          <TextLoading isLoading={hourlyWeather.isLoading}>
            <MoveDown
              style={{
                transform: `rotate(${hourlyWeatherData?.wind_direction_10m[dataIndex]}deg)`,
              }}
              className="size-4"
            />
          </TextLoading>
        </div>
      </div>
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
          <div className="flex flex-row items-baseline space-x-1"></div>
          <div className="h-48">
            <Chart
              dataIndexCallback={(index) => setDataIndex(index)}
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
                  tickFormatter(value: string) {
                    return `${value}:00`;
                  },
                },
              ]}
              yAxis={[
                {
                  tickFormatter(value: number) {
                    return `${value}°C`;
                  },
                  orientation: 'right',
                  toolTipFormatDataKeys: ['Temperature'],
                },
              ]}
              toolTip={{
                enabled: true,
                formatter(value: number) {
                  return `${value}°C`;
                },
                labelFormatter(label: string) {
                  return `${label}:00`;
                },
              }}
              isLoading={hourlyWeather.isLoading}
            />
          </div>
        </TabsContent>
        <TabsContent value="precipitation">
          <div className="h-48">
            <Chart
              dataIndexCallback={(index) => setDataIndex(index)}
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
                  tickFormatter(value: string) {
                    return `${value}:00`;
                  },
                },
              ]}
              yAxis={[
                {
                  tickFormatter(value: number) {
                    return `${value} mm`;
                  },
                  orientation: 'right',
                  toolTipFormatDataKeys: ['Precipitation'],
                },
              ]}
              toolTip={{
                enabled: true,
                formatter(value: number) {
                  return `${value} mm`;
                },
                labelFormatter(label: string) {
                  return `${label}:00`;
                },
              }}
              isLoading={hourlyWeather.isLoading}
            />
          </div>
        </TabsContent>
        <TabsContent value="wind">
          <div className="h-48">
            <Chart
              dataIndexCallback={(index) => setDataIndex(index)}
              data={tableData}
              areas={[
                {
                  dataKey: 'Wind Speed',
                  animationDuration: 0,
                  useGradient: true,
                },
              ]}
              lines={[
                {
                  dataKey: 'Wind Gusts',
                  animationDuration: 0,
                },
              ]}
              xAxis={[
                {
                  dataKey: 'Time',
                  tickFormatter(value: string) {
                    return `${value}:00`;
                  },
                },
              ]}
              colors={['blue', 'teal']}
              yAxis={[
                {
                  tickFormatter(value: number) {
                    return formatSpeed({
                      metersPerSecond: value,
                      units: userSettings?.data?.preferences.units || 'metric',
                      decimals: 0,
                    });
                  },
                  orientation: 'right',
                  toolTipFormatDataKeys: ['Wind Speed', 'Wind Gusts'],
                },
              ]}
              toolTip={{
                enabled: true,
                formatter(value: number) {
                  return `${formatSpeed({
                    metersPerSecond: value,
                    units: userSettings?.data?.preferences.units || 'metric',
                    decimals: 1,
                  })}`;
                },
                labelFormatter(label: string) {
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
