import React from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import updateLocale from 'dayjs/plugin/updateLocale';
import dayLocaleData from 'dayjs/plugin/localeData';
import { CaretLeftOutlined, CaretRightOutlined } from '@ant-design/icons';
import { Card, Select, Button, Typography, Skeleton } from 'antd';
import {
  getFirstMondayBeforeMonth,
  getFirstSundayAfterMonth,
} from '../utils/dateTimeHelpers';

const { Text } = Typography;

dayjs.extend(dayLocaleData);
dayjs.extend(updateLocale);

export default function Calendar({
  currentDay,
  setCurrentDay,
  onDateChange,
  isLoading = false,
  startOfWeekDay = 1,
  dateCellRenderer,
  metaCellRenderer,
  titleAffix,
  titlePrefix,
}: {
  currentDay: dayjs.Dayjs;
  setCurrentDay: (month: dayjs.Dayjs) => void;
  onDateChange: (date: dayjs.Dayjs) => void;
  isLoading?: boolean;
  startOfWeekDay?: number;
  dateCellRenderer?: (date: dayjs.Dayjs) => JSX.Element;
  metaCellRenderer?: (date: dayjs.Dayjs) => JSX.Element;
  titleAffix?: (date: dayjs.Dayjs) => JSX.Element;
  titlePrefix?: (date: dayjs.Dayjs) => JSX.Element;
}): JSX.Element {
  // Dayjs locale
  dayjs.updateLocale('en', {
    weekStart: startOfWeekDay,
  });

  // Constants
  const daysOfWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
    'meta',
  ];
  const months = Array.from({ length: 12 }, (_, i) => dayjs().month(i));
  const years = Array.from({ length: 11 }, (_, i) =>
    currentDay.year(dayjs().year() - 5 + i).format('YYYY'),
  );

  // Functions
  const handleNextMonth = () => {
    const newDay = currentDay.add(1, 'month');
    setCurrentDay(newDay);
    onDateChange(newDay);
  };

  const handlePreviousMonth = () => {
    const newDay = currentDay.subtract(1, 'month');
    setCurrentDay(newDay);
    onDateChange(newDay);
  };

  const handleToday = () => {
    const newDay = dayjs();
    setCurrentDay(newDay);
    onDateChange(newDay);
  };

  const handleSetYear = (year: number) => {
    const newDay = currentDay.year(year);
    setCurrentDay(newDay);
    onDateChange(newDay);
  };

  const handleSetMonth = (month: number) => {
    const newDay = currentDay.month(month);
    setCurrentDay(newDay);
    onDateChange(newDay);
  };

  // Days to display
  const firstDay = getFirstMondayBeforeMonth(currentDay);
  const lastDay = getFirstSundayAfterMonth(currentDay);
  const daysInMonth = Array.from(
    { length: lastDay.diff(firstDay, 'day') + 1 },
    (_, i) => dayjs(firstDay).add(i, 'day'),
  );

  // Content
  const Loading = (
    <Skeleton
      paragraph={{
        rows: 2,
        width: ['90%', '90%'],
      }}
      title={false}
      active
      className="mt-2"
    />
  );

  const Header = (
    <div>
      <div className="space-x-2">
        <Select
          value={currentDay.year()}
          onChange={(newYear) => {
            handleSetYear(Number(newYear));
          }}
          options={years.map((year) => ({
            label: year,
            value: year,
          }))}
        />
        <Select
          value={currentDay.format('MMMM')}
          options={months.map((month) => ({
            label: month.format('MMMM'),
            value: month.format('M'),
          }))}
          onChange={(newMonth) => {
            handleSetMonth(Number(newMonth) - 1);
          }}
          className="w-32"
        />
        <Button
          onClick={() => {
            handleToday();
          }}
          type="primary"
        >
          Today
        </Button>
        <Button
          onClick={() => {
            handlePreviousMonth();
          }}
          icon={<CaretLeftOutlined />}
        />
        <Button
          onClick={() => {
            handleNextMonth();
          }}
          icon={<CaretRightOutlined />}
        />
      </div>
    </div>
  );

  const CalendarHeader = (
    <div className="grid grid-cols-8">
      {daysOfWeek.map((day, index) => (
        <Text
          className={`text-center my-2 ${
            index === daysOfWeek.length - 1 ? 'ml-4' : ''
          }`}
          key={index}
        >
          {day}
        </Text>
      ))}
    </div>
  );

  const CalendarDays = (
    <div className="grid grid-cols-8">
      {daysInMonth.map((day, index) => (
        <React.Fragment key={index}>
          <Card
            style={{ height: '100%', minHeight: '9rem' }}
            bodyStyle={{ padding: '2px' }}
            className="rounded-none"
          >
            <div>
              {titlePrefix && titlePrefix(day)}
              <Text className="m-2">
                {day.date() === 1 ? ` ${day.format('MMMM')} ` : ''}
                {day.format('D')}
              </Text>
              {titleAffix && titleAffix(day)}
            </div>
            {isLoading && Loading}
            {dateCellRenderer && dateCellRenderer(day)}
          </Card>
          {day.day() === 0 && (
            <div className="pl-4">
              <Card
                style={{ height: '100%', minHeight: '9rem' }}
                bodyStyle={{ padding: '0px' }}
                className="rounded-none"
              >
                {isLoading && Loading}
                {metaCellRenderer && metaCellRenderer(day)}
              </Card>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="">
      {Header}
      <div>
        {CalendarHeader}
        {CalendarDays}
      </div>
    </div>
  );
}
