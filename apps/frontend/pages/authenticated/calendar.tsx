import 'dayjs/locale/en';

import type { Activity } from '@repo/types';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import dayLocaleData from 'dayjs/plugin/localeData';
import updateLocale from 'dayjs/plugin/updateLocale';
import utc from 'dayjs/plugin/utc';
import { useState } from 'react';
import { useGeolocation } from 'rooks';

import { ActivityCardWithDialog } from '@elements/activityCard';
import Calendar from '@elements/calendar';
import { useProps } from '@hooks/useProps';
import { GetActivitiesQuery, useActivities } from '@services/data/activities';
import { useDailyWeather } from '@services/data/weather';
import { Chart } from '@ui/chart';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ui/tabs';
import { Text } from '@ui/typography';
import {
  getFirstMondayBeforeMonth,
  getFirstSundayAfterMonth,
} from '@utils/dateTimeHelpers';
import { formatDistance, formatNumber, formatTime } from '@utils/formatting';
import { getPreferredTss } from '@utils/tss/helpers';

dayjs.extend(isBetween);
dayjs.extend(dayLocaleData);
dayjs.extend(updateLocale);
dayjs.extend(utc);

type SportData = {
  sport: string;
  distance: number;
  time: number;
  tss: number;
};

type SportTotals = {
  distance: number;
  time: number;
  tss: number;
};

interface ActivityWithTss extends Activity {
  tss?: number;
}

interface ChartTotals {
  start_date: string;
  distance: number;
  moving_time: number;
  tss: number;
}

interface ChartData {
  totals: ChartTotals[];
  [key: string]: ChartTotals[];
}

function MetaItem({
  sportsData,
  sportTotals,
  sports,
  chartData,
  units,
}: {
  sportsData: SportData[];
  sportTotals: SportTotals[];
  sports: string[];
  chartData: ChartData;
  units: Units;
}): JSX.Element {
  const [selectedSport, setSelectedSport] = useState<string | null>(
    sports.find((sport) => sport === 'run') || sports[0],
  );
  const [chartTab, setChartTab] = useState<'tss' | 'distance' | 'moving_time'>(
    'tss',
  );

  const tabValues = {
    tss: 'TSS',
    distance: 'Distance',
    moving_time: 'Time',
  };

  const chartHasData = Object.values(chartData).some((array) =>
    array.some((obj) =>
      Object.values(obj).some(
        (val: unknown) => typeof val === 'number' && val > 0,
      ),
    ),
  );

  return (
    <div>
      <div>
        <Text>Total</Text>
        {sportTotals.map((item, index) => (
          <div key={index}>
            <Text size="large">
              {formatDistance({
                meters: item.distance,
                units,
              })}
            </Text>
            <Text size="large">
              {formatTime({
                seconds: item.time,
                addSeconds: false,
              })}
            </Text>
            <Text size="large">
              {`${formatNumber({
                number: item.tss,
                decimals: 0,
              })} TSS`}
            </Text>
          </div>
        ))}

        {chartHasData && (
          <Tabs
            onValueChange={(value) =>
              setChartTab(value as 'tss' | 'distance' | 'moving_time')
            }
            value={chartTab}
          >
            <TabsList className="my-2 flex w-full">
              {Object.keys(tabValues).map((value) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="w-full truncate text-xs"
                >
                  {tabValues[value as keyof typeof tabValues]}
                </TabsTrigger>
              ))}
            </TabsList>
            {Object.keys(tabValues).map((value) => (
              <TabsContent key={value} value={value} className="h-16 w-full">
                <Chart
                  data={chartData.totals}
                  bars={[
                    {
                      dataKey: value,
                      useGradient: true,
                    },
                  ]}
                  gradient={{
                    startOpacity: 1,
                    endOpacity: 0.4,
                  }}
                />
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
      <div>
        {sportsData.length > 1 && (
          <>
            <Select
              value={selectedSport || ''}
              onValueChange={(value) => {
                setSelectedSport(value);
              }}
            >
              <SelectTrigger className="my-2">
                <SelectValue>{selectedSport}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {sports.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {sportsData.length > 1 &&
              sportsData
                .filter(
                  (item) => !selectedSport || item.sport === selectedSport,
                )
                .map((item, index) => (
                  <div key={index}>
                    <div key={item.sport}>
                      {item.distance !== 0 && (
                        <Text>
                          {formatDistance({
                            meters: item.distance,
                            units,
                          })}
                        </Text>
                      )}
                      <Text>
                        {formatTime({
                          seconds: item.time,
                          addSeconds: false,
                        })}
                      </Text>
                      <Text>
                        {`${formatNumber({
                          number: item.tss,
                          decimals: 0,
                        })} TSS`}
                      </Text>
                    </div>

                    <Tabs
                      onValueChange={(value) =>
                        setChartTab(value as 'tss' | 'distance' | 'moving_time')
                      }
                      value={chartTab}
                    >
                      {Object.keys(tabValues).map((value) => (
                        <TabsContent
                          key={value}
                          value={value}
                          className="h-16 w-full"
                        >
                          <Chart
                            data={chartData[item.sport]}
                            bars={[
                              {
                                dataKey: value,
                                useGradient: true,
                              },
                            ]}
                            gradient={{
                              startOpacity: 1,
                              endOpacity: 0.4,
                            }}
                          />
                        </TabsContent>
                      ))}
                    </Tabs>
                  </div>
                ))}
          </>
        )}
      </div>
    </div>
  );
}

export default function App() {
  // Dayjs locale
  dayjs.updateLocale('en', {
    weekStart: 1,
  });

  // Constants
  const dateFormat = 'YYYY-MM-DD';
  const [currentDay, setCurrentDay] = useState(dayjs());
  const [query, setQuery] = useState<GetActivitiesQuery>({
    startDate: getFirstMondayBeforeMonth(currentDay).format(dateFormat),
    endDate: getFirstSundayAfterMonth(currentDay).format(dateFormat),
  });
  const { userSettings } = useProps();

  const { data: activitiesData, isLoading: activitiesIsLoading } =
    useActivities({
      query: query,
    });
  const geoLocation = useGeolocation({
    when: userSettings?.data?.preferences.enable_weather,
  });
  const { data: weatherData, isLoading: weatherIsLoading } = useDailyWeather({
    query: {
      forecast_days: 14,
      longitude: geoLocation?.lng || 0,
      latitude: geoLocation?.lat || 0,
    },
    enabled: geoLocation?.isError === false,
  });

  function onDateChange(date: Dayjs) {
    setQuery({
      startDate: getFirstMondayBeforeMonth(date).format(dateFormat),
      endDate: getFirstSundayAfterMonth(date).format(dateFormat),
    });
  }

  const dateCellRenderer = (value: Dayjs) => {
    const date = value.format(dateFormat);
    const filtered = activitiesData
      ? activitiesData
          .filter((item) => {
            const itemStartDate = dayjs
              .utc(item.start_date)
              .utcOffset(value.utcOffset())
              .format(dateFormat);
            return itemStartDate.includes(date);
          })
          .sort(
            (a, b) => dayjs(a.start_date).unix() - dayjs(b.start_date).unix(),
          )
      : [];

    return (
      <>
        {filtered.map((activity, index) => (
          <ActivityCardWithDialog
            activity={activity}
            userSettings={userSettings?.data}
            key={index}
            cardClassName="my-2 brightness-125 transition-transform duration-200 hover:scale-105"
          />
        ))}
      </>
    );
  };

  const MetaCellRenderer = (value: Dayjs) => {
    const firstDay = value.startOf('week');
    const lastDay = value.endOf('week');

    // Filter activities for the week
    const filtered: ActivityWithTss[] = activitiesData
      ? activitiesData.reduce((acc: ActivityWithTss[], item) => {
          const itemStartDate = dayjs
            .utc(item.start_date)
            .utcOffset(value.utcOffset());

          if (itemStartDate.isBetween(firstDay, lastDay, undefined, '[]')) {
            const tss = getPreferredTss(
              userSettings?.data?.preferences.preferred_tss_type,
              item,
            );

            acc.push({
              ...item,
              tss: tss.tss || 0,
            });
          }

          return acc;
        }, [])
      : [];
    const sports = [...new Set(filtered.map((item) => item.type))];

    // Get distance and time for each sport
    const sportsData: SportData[] = sports.map((sport) => {
      const sportData = filtered.filter((item) => item.type === sport);
      const distance = sportData.reduce(
        (prev, curr) => prev + curr.distance,
        0,
      );
      const time = sportData.reduce(
        (prev, curr) => prev + curr.elapsed_time,
        0,
      );
      const tss = sportData.reduce((prev, curr) => prev + (curr.tss || 0), 0);
      return {
        sport: sport,
        distance: distance,
        time: time,
        tss: tss,
      };
    });

    // Get total distance and time
    const totals: SportTotals = sportsData.reduce(
      (prev, curr) => {
        return {
          distance: prev.distance + curr.distance,
          time: prev.time + curr.time,
          tss: prev.tss + curr.tss,
        };
      },
      { distance: 0, time: 0, tss: 0 },
    );

    // Get chart data
    const chartData: ChartData = {
      totals: [],
    };
    sports.forEach((sport) => {
      chartData[sport] = [];
    });

    for (
      let date = firstDay;
      date.isBefore(lastDay) || date.isSame(lastDay);
      date = date.add(1, 'day')
    ) {
      const activitiesForDay = filtered.filter((item) =>
        dayjs(item.start_date).isSame(date, 'day'),
      );
      const totalsForDay = activitiesForDay.reduce(
        (prev, curr) => {
          return {
            distance: prev.distance + curr.distance,
            time: prev.time + curr.elapsed_time,
            tss: prev.tss + (curr.tss || 0),
          };
        },
        { distance: 0, time: 0, tss: 0 },
      );

      chartData.totals.push({
        start_date: date.format(dateFormat),
        distance: totalsForDay.distance,
        moving_time: totalsForDay.time,
        tss: totalsForDay.tss,
      });

      sports.forEach((sport) => {
        const activitiesForSport = activitiesForDay.filter(
          (item) => item.type === sport,
        );

        const totalsForSport = activitiesForSport.reduce(
          (prev, curr) => {
            return {
              distance: prev.distance + curr.distance,
              time: prev.time + curr.elapsed_time,
              tss: prev.tss + (curr.tss || 0),
            };
          },
          { distance: 0, time: 0, tss: 0 },
        );

        chartData[sport].push({
          start_date: date.format(dateFormat),
          distance: totalsForSport.distance,
          moving_time: totalsForSport.time,
          tss: totalsForSport.tss,
        });
      });
    }

    return (
      <>
        {!activitiesIsLoading && (
          <MetaItem
            sportsData={sportsData}
            sportTotals={[totals]}
            sports={sports}
            chartData={chartData}
            units={userSettings?.data?.preferences.units || 'metric'}
          />
        )}
      </>
    );
  };

  // Render
  return (
    <Calendar
      onDateChange={onDateChange}
      currentDay={currentDay}
      setCurrentDay={setCurrentDay}
      dateCellRenderer={dateCellRenderer}
      isLoading={activitiesIsLoading}
      metaCellRenderer={MetaCellRenderer}
      weather={{
        weather: weatherData,
        isLoading: weatherIsLoading,
        enabled: userSettings?.data?.preferences.enable_weather || false,
      }}
    />
  );
}
