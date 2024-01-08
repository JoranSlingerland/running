import Calendar from '../../components/elements/calendar';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import updateLocale from 'dayjs/plugin/updateLocale';
import dayLocaleData from 'dayjs/plugin/localeData';
import utc from 'dayjs/plugin/utc';
import { useState, useEffect } from 'react';
import {
  getFirstMondayBeforeMonth,
  getFirstSundayAfterMonth,
} from '../../components/utils/dateTimeHelpers';
import { GetActivitiesQuery } from '../../components/services/data/activities';
import { useActivities } from '../../components/services/data/activities';
import { Card, Typography, Statistic, Select, Divider } from 'antd';
import type { Activity } from '../../components/services/data/activities';
import {
  formatDistance,
  formatTime,
  formatPace,
  formatNumber,
  sportIcon,
} from '../../components/utils/formatting';
import isBetween from 'dayjs/plugin/isBetween';
import { convertDistance } from '../../components/utils/convert';
import { isNotNullOrZero } from '../../components/utils/utils';
import { getPreferredTss } from '../../components/utils/tssHelpers';
import { useProps } from '../../components/hooks/useProps';

dayjs.extend(isBetween);
dayjs.extend(dayLocaleData);
dayjs.extend(updateLocale);
dayjs.extend(utc);

const { Text } = Typography;

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

function CalendarItem({
  item,
  userSettings,
}: {
  item: Activity;
  userSettings: UserSettings | undefined;
}): JSX.Element {
  const tss = getPreferredTss(userSettings, item);
  return (
    <Card
      size="small"
      style={{
        height: '100%',
        filter: 'brightness(1.2)',
      }}
      bodyStyle={{ padding: '0px' }}
      title={
        <div className="flex items-center space-x-1">
          {sportIcon(item.type)}{' '}
          <Text>
            {item.type} at {dayjs.utc(item.start_date_local).format('HH:mm')}
          </Text>
        </div>
      }
      className="my-2"
      hoverable
      bordered={false}
    >
      <div className="flex flex-col text-left ml-2">
        {isNotNullOrZero(item.elapsed_time) && (
          <Text>
            {formatTime({
              seconds: item.elapsed_time,
              wrapInText: false,
              addSeconds: false,
            })}
            {' hours'}
          </Text>
        )}
        {isNotNullOrZero(item.distance) && (
          <Text> {formatDistance(item.distance, 'km')}</Text>
        )}
        {isNotNullOrZero(tss.tss) && (
          <Text>
            {formatNumber({ number: tss.tss, wrapInText: false, decimals: 0 })}{' '}
            TSS
          </Text>
        )}

        {isNotNullOrZero(item.average_heartrate) && (
          <Text>{item.average_heartrate} BPM</Text>
        )}
        {isNotNullOrZero(item.average_speed) && (
          <Text>{formatPace(item.average_speed, 'km')}</Text>
        )}
      </div>
    </Card>
  );
}

function MetaItem({
  sportsData,
  sportTotals,
  sports,
  selectedSport,
  setSelectedSport,
}: {
  sportsData: SportData[];
  sportTotals: SportTotals[];
  sports: string[];
  selectedSport: string | null;
  setSelectedSport: (value: string) => void;
}): JSX.Element {
  return (
    <div>
      <div className="ml-2">
        <Text>Total</Text>
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
            <Statistic value={item.tss} suffix="TSS" precision={0} />
          </>
        ))}
      </div>
      {sportsData.length > 1 && <Divider className="m-0 my-2" />}
      <div className="ml-2">
        {sportsData.length > 1 && (
          <>
            <Select
              style={{ width: 200 }}
              onChange={(value: string) => setSelectedSport(value)}
              placeholder="Select a sport"
              value={selectedSport}
              options={sports.map((item) => ({
                label: item,
                value: item,
              }))}
            />
            {sportsData.length > 1 &&
              sportsData
                .filter(
                  (item) => !selectedSport || item.sport === selectedSport,
                )
                .map((item) => (
                  <div key={item.sport}>
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

                    <Statistic value={item.tss} suffix="TSS" precision={0} />
                  </div>
                ))}
          </>
        )}
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
  const { userSettings } = useProps();
  const [selectedSport, setSelectedSport] = useState<string | null>(null);

  function onDateChange(date: Dayjs) {
    setQuery({
      startDate: getFirstMondayBeforeMonth(date).format('YYYY-MM-DD'),
      endDate: getFirstSundayAfterMonth(date).format('YYYY-MM-DD'),
    });
  }

  const dateCellRenderer = (value: Dayjs) => {
    const date = value.format('YYYY-MM-DD');
    const filtered = activitiesData
      ? activitiesData
          .filter((item) => {
            return item.start_date.includes(date);
          })
          .sort(
            (a, b) =>
              dayjs(a.start_date_local).unix() -
              dayjs(b.start_date_local).unix(),
          )
      : [];
    return (
      <>
        {filtered.map((item, index) => (
          <CalendarItem
            key={index}
            item={item}
            userSettings={userSettings?.data}
          />
        ))}
      </>
    );
  };

  const metaCellRenderer = (value: Dayjs) => {
    interface ActivityWithTss extends Activity {
      tss?: number;
    }

    const firstDay = value.startOf('week');
    const lastDay = value.endOf('week');

    if (activitiesData === undefined) {
      return <></>;
    }
    let filtered: ActivityWithTss[] = activitiesData
      ? activitiesData.filter((item) => {
          const date = dayjs(item.start_date);
          return date.isBetween(firstDay, lastDay);
        })
      : [];

    // Add preferred tss to each activity
    filtered = filtered.map((item) => {
      const tss = getPreferredTss(userSettings?.data, item);
      return {
        ...item,
        tss: tss.tss || 0,
      };
    });

    const sports = [...new Set(filtered.map((item) => item.type))];

    useEffect(() => {
      if (selectedSport === null && sports.length > 0) {
        const runSport = sports.find((sport) => sport === 'run');
        setSelectedSport(runSport ? runSport : sports[0]);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

    return (
      <>
        {!activitiesIsLoading && (
          <MetaItem
            sportsData={sportsData}
            sportTotals={[totals]}
            sports={sports}
            selectedSport={selectedSport}
            setSelectedSport={setSelectedSport}
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
      metaCellRenderer={metaCellRenderer}
    />
  );
}
