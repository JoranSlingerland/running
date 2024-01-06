import Calendar from '../../components/elements/calendar';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import updateLocale from 'dayjs/plugin/updateLocale';
import dayLocaleData from 'dayjs/plugin/localeData';
import { useState } from 'react';
import {
  getFirstMondayBeforeMonth,
  getFirstSundayAfterMonth,
} from '../../components/utils/dateTimeHelpers';
import { GetActivitiesQuery } from '../../components/services/data/activities';
import { useActivities } from '../../components/services/data/activities';
import { Card, Typography, Statistic } from 'antd';
import type { Activity } from '../../components/services/data/activities';
import {
  formatDistance,
  formatTime,
  formatPace,
} from '../../components/utils/formatting';
import isBetween from 'dayjs/plugin/isBetween';
import { convertDistance } from '../../components/utils/convert';

dayjs.extend(isBetween);
dayjs.extend(dayLocaleData);
dayjs.extend(updateLocale);

const { Text } = Typography;

type SportData = {
  sport: string;
  distance: number;
  time: number;
};

type SportTotals = {
  distance: number;
  time: number;
};

function CalendarItem({ item }: { item: Activity }): JSX.Element {
  return (
    <Card
      size="small"
      style={{ height: '100%' }}
      bodyStyle={{ padding: '0px' }}
      title={item.type}
      className="my-2"
      hoverable
      bordered={false}
    >
      <div className="flex flex-col text-left ml-2">
        {item.elapsed_time !== null &&
          item.elapsed_time !== undefined &&
          item.elapsed_time !== 0 && (
            <Text>
              {formatTime({
                seconds: item.elapsed_time,
                wrapInText: false,
                addSeconds: false,
              })}
            </Text>
          )}
        {item.distance !== null &&
          item.distance !== undefined &&
          item.distance !== 0 && (
            <Text> {formatDistance(item.distance, 'km')}</Text>
          )}
        {item.average_heartrate !== null &&
          item.average_heartrate !== undefined &&
          item.average_heartrate !== 0 && (
            <Text>{item.average_heartrate} BPM</Text>
          )}
        {item.average_speed !== null &&
          item.average_speed !== undefined &&
          item.average_speed !== 0 && (
            <Text>{formatPace(item.average_speed, 'km')}</Text>
          )}
      </div>
    </Card>
  );
}

function MetaItem({
  sportsData,
  sportTotals,
}: {
  sportsData: SportData[];
  sportTotals: SportTotals[];
}): JSX.Element {
  return (
    <div className="ml-2">
      <div>
        <Text>Total</Text>
        <div className="flex flex-row space-x-4">
          {sportTotals.map((item) => (
            <>
              <Statistic
                value={convertDistance(item.distance, 'km')}
                suffix="km"
                precision={2}
              />
              <Statistic
                value={item.time}
                formatter={(value) => {
                  return formatTime({
                    seconds: value as number,
                    wrapInText: false,
                    addSeconds: false,
                  });
                }}
              />
            </>
          ))}
        </div>
      </div>
      <div>
        {sportsData &&
          sportsData.length > 0 &&
          sportsData.map((item) => (
            <div key={item.sport}>
              <Text>{item.sport}</Text>
              <div className="flex flex-row space-x-4">
                {item.distance !== 0 && (
                  <Statistic
                    value={convertDistance(item.distance, 'km')}
                    suffix="km"
                    precision={2}
                  />
                )}

                <Statistic
                  value={item.time}
                  formatter={(value) => {
                    return formatTime({
                      seconds: value as number,
                      wrapInText: false,
                      addSeconds: false,
                    });
                  }}
                />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default function app() {
  // Dayjs locale
  dayjs.updateLocale('en', {
    weekStart: 1,
  });

  // Constants
  const [currentDay, setCurrentDay] = useState(dayjs());
  const [query, setQuery] = useState<GetActivitiesQuery>({
    startDate: getFirstMondayBeforeMonth(currentDay).format('YYYY-MM-DD'),
    endDate: getFirstSundayAfterMonth(currentDay).format('YYYY-MM-DD'),
  });
  const { data: activitiesData, isLoading: activitiesIsLoading } =
    useActivities({
      query: query,
    });
  function onDateChange(date: Dayjs) {
    setQuery({
      startDate: getFirstMondayBeforeMonth(date).format('YYYY-MM-DD'),
      endDate: getFirstSundayAfterMonth(date).format('YYYY-MM-DD'),
    });
  }

  const dateCellRenderer = (value: Dayjs) => {
    const date = value.format('YYYY-MM-DD');
    const filtered = activitiesData
      ? activitiesData.filter((item) => {
          return item.start_date.includes(date);
        })
      : [];
    return (
      <>
        {filtered.map((item, index) => (
          <CalendarItem key={index} item={item} />
        ))}
      </>
    );
  };

  const metaCellRenderer = (value: Dayjs) => {
    const firstDay = value.startOf('week');
    const lastDay = value.endOf('week');

    if (activitiesData === undefined) {
      return <></>;
    }
    const filtered = activitiesData
      ? activitiesData.filter((item) => {
          const date = dayjs(item.start_date);
          return date.isBetween(firstDay, lastDay);
        })
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
      return {
        sport: sport,
        distance: distance,
        time: time,
      };
    });

    // Get total distance and time
    const totals: SportTotals = sportsData.reduce(
      (prev, curr) => {
        return {
          distance: prev.distance + curr.distance,
          time: prev.time + curr.time,
        };
      },
      { distance: 0, time: 0 },
    );

    return (
      <>
        {!activitiesIsLoading && (
          <MetaItem sportsData={sportsData} sportTotals={[totals]} />
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
      metaCellRenderer={metaCellRenderer}
    />
  );
}
