import { HourlyWeather } from '@repo/weather';
import { wmoCodes } from '@repo/weather';
import dayjs, { Dayjs } from 'dayjs';
import React, { useState } from 'react';
import { useGeolocation } from 'rooks';

import { useProps } from '@hooks/useProps';
import useSessionStorageState from '@hooks/useSessionStorageState';
import { useDailyWeather, useHourlyWeather } from '@services/data/weather';
import { Chart } from '@ui/chart';
import { ImageWithSkeleton } from '@ui/image';
import { Skeleton } from '@ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ui/tabs';
import { Text } from '@ui/typography';
import { selectedClassName } from '@utils/cssPresets';
import { formatNumber } from '@utils/formatting';
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

const formatters = (units: Units) => [
  {
    formatter(value: number) {
      return `${value}°C`;
    },
    dataKeys: ['Temperature'],
  },
  {
    formatter(value: number) {
      return `${value}:00`;
    },
    dataKeys: ['Time'],
  },
  {
    formatter(value: number) {
      return `${value} mm`;
    },
    dataKeys: ['Precipitation'],
  },
  {
    formatter(value: number) {
      return formatSpeed({
        metersPerSecond: value,
        units: units,
        decimals: 0,
      });
    },
    dataKeys: ['Wind Speed', 'Wind Gusts'],
  },
];

function HourlyWeatherBlock({ date }: { date: Dayjs }) {
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
          <div className="flex flex-row items-baseline space-x-1"></div>
          <div className="h-48">
            <Chart
              data={tableData}
              composedChartProps={{
                margin: {
                  right: 10,
                },
              }}
              areas={[
                {
                  dataKey: 'Temperature',
                  animationDuration: 200,
                  useGradient: true,
                  label: {
                    position: 'top',
                    minLabelGap: 2,
                    skipFirst: true,
                  },
                },
              ]}
              formatters={formatters(
                userSettings?.data?.preferences.units || 'metric',
              )}
              xAxis={[
                {
                  dataKey: 'Time',
                },
              ]}
              yAxis={[
                {
                  orientation: 'right',
                  dataKey: 'Temperature',
                  domain([dataMin, dataMax]) {
                    return [
                      Math.ceil(dataMin < 0 ? 1.1 * dataMin : 0.9 * dataMin),
                      Math.ceil(dataMax < 0 ? 0.9 * dataMax : 1.1 * dataMax),
                    ];
                  },
                  allowDataOverflow: true,
                },
              ]}
              toolTip={{
                enabled: true,
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
              data={tableData}
              composedChartProps={{
                margin: {
                  right: 10,
                },
              }}
              areas={[
                {
                  dataKey: 'Precipitation',
                  animationDuration: 200,
                  useGradient: true,
                  label: {
                    position: 'top',
                    minLabelGap: 2,
                    skipFirst: true,
                  },
                },
              ]}
              formatters={formatters(
                userSettings?.data?.preferences.units || 'metric',
              )}
              xAxis={[
                {
                  dataKey: 'Time',
                },
              ]}
              yAxis={[
                {
                  orientation: 'right',
                  dataKey: 'Precipitation',
                  domain([dataMin, dataMax]) {
                    return [
                      dataMin,
                      Math.ceil(
                        Math.max(
                          dataMax < 0 ? 0.9 * dataMax : 1.1 * dataMax,
                          1,
                        ),
                      ),
                    ];
                  },
                },
              ]}
              toolTip={{
                enabled: true,
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
              data={tableData}
              composedChartProps={{
                margin: {
                  right: 10,
                },
              }}
              areas={[
                {
                  dataKey: 'Wind Speed',
                  animationDuration: 200,
                  useGradient: true,
                  label: {
                    position: 'top',
                    minLabelGap: 2,
                    skipFirst: true,
                  },
                },
              ]}
              formatters={formatters(
                userSettings?.data?.preferences.units || 'metric',
              )}
              lines={[
                {
                  dataKey: 'Wind Gusts',
                  animationDuration: 200,
                },
              ]}
              xAxis={[
                {
                  dataKey: 'Time',
                },
              ]}
              colors={['blue', 'teal']}
              yAxis={[
                {
                  orientation: 'right',
                  dataKey: 'Wind Gusts',
                },
              ]}
              toolTip={{
                enabled: true,
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

function DailyWeatherBlock() {
  const { userSettings } = useProps();
  const geoLocation = useGeolocation({
    when: userSettings?.data?.preferences.enable_weather,
  });
  const { data: weatherData, isLoading: weatherIsLoading } = useDailyWeather({
    query: {
      forecast_days: 14,
      latitude: geoLocation?.lat || 0,
      longitude: geoLocation?.lng || 0,
    },
    enabled: geoLocation?.isError === false,
  });
  const daily = weatherData?.daily;
  const [activeIndex, setActiveIndex] = useState<number>(0);
  console.log(weatherIsLoading);

  if (geoLocation?.isError) {
    return (
      <div className="flex h-full items-center justify-center text-center">
        <Text size={'large'}>Enable weather in user settings</Text>
      </div>
    );
  }

  const next7Days = Array.from({ length: 7 }, (_, i) =>
    dayjs().add(i + 1, 'day'),
  );

  return (
    <>
      <HourlyWeatherBlock date={dayjs(daily?.time[activeIndex])} />
      <div className="flex flex-row justify-between p-1 md:p-2">
        {next7Days?.map((day, index) => {
          const formattedTime = dayjs(day).format('ddd');
          return (
            <div
              key={index}
              className={selectedClassName(
                index,
                activeIndex,
                'flex flex-col items-center justify-center rounded-md p-1 md:p-2 cursor-pointer',
              )}
              onClick={() => setActiveIndex(index)}
            >
              {formattedTime}
              <ImageWithSkeleton
                src={wmoCodes[`${daily?.weather_code[index]}`]?.day.image}
                alt={wmoCodes[`${daily?.weather_code[index]}`]?.day.description}
                width={32}
                height={32}
                isLoading={weatherIsLoading}
              />
              {weatherIsLoading ? (
                <div className="pt-1">
                  <Skeleton className="h-4 w-12" />
                </div>
              ) : (
                <Text className="text-xs sm:text-base">
                  {formatNumber({
                    number: daily?.temperature_2m_max[index],
                    decimals: 0,
                  })}
                  ° /{' '}
                  {formatNumber({
                    number: daily?.temperature_2m_min[index],
                    decimals: 0,
                  })}
                </Text>
              )}
            </div>
          );
        })}
      </div>
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

export { HourlyWeatherBlock, DailyWeatherBlock };
