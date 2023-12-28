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
  const startDate = today.startOf('month').startOf('week').format('YYYY-MM-DD');
  const endDate = today
    .endOf('month')
    .endOf('week')
    .add(7, 'day')
    .format('YYYY-MM-DD');

  return { startDate, endDate };
}

export default function App() {
  const [query, setQuery] = useState<GetActivitiesQuery>({
    ...getMonthBoundaries(),
  });
  const [currentMonth, setCurrentMonth] = useState<dayjs.Dayjs>(dayjs());

  function onPanelChange(value: dayjs.Dayjs, mode: CalendarMode) {
    setQuery(getMonthBoundaries(value));
    setCurrentMonth(value);
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
      currentMonth={currentMonth}
    />
  );
}
