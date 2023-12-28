import AntdCalendar from '../../components/elements/calendar';
import { useActivities } from '../../components/services/data/activities';
import { useState } from 'react';
import { GetActivitiesQuery } from '../../components/services/data/activities';
import { CalendarMode } from 'antd/es/calendar/generateCalendar';
import dayjs from 'dayjs';
import dayLocaleData from 'dayjs/plugin/localeData';
import updateLocale from 'dayjs/plugin/updateLocale';

dayjs.extend(dayLocaleData);
dayjs.extend(updateLocale);

function getMonthBoundaries(date?: dayjs.Dayjs) {
  const today = date || dayjs();
  const firstDay = today
    .startOf('month')
    .startOf('week')
    .subtract(7, 'day')
    .format('YYYY-MM-DD');
  const lastDay = today
    .endOf('month')
    .endOf('week')
    .add(7, 'day')
    .format('YYYY-MM-DD');

  return { firstDay, lastDay };
}

export default function App() {
  const { firstDay, lastDay } = getMonthBoundaries();
  const [query, setQuery] = useState<GetActivitiesQuery>({
    startDate: firstDay,
    endDate: lastDay,
  });

  function onPanelChange(value: dayjs.Dayjs, mode: CalendarMode) {
    const { firstDay, lastDay } = getMonthBoundaries(value);
    setQuery({
      startDate: firstDay,
      endDate: lastDay,
    });
  }

  const { data: activitiesData, isLoading: activitiesIsLoading } =
    useActivities({
      query: query,
    });

  return (
    <AntdCalendar
      data={activitiesData}
      isLoading={activitiesIsLoading}
      onPanelChange={onPanelChange}
    />
  );
}
