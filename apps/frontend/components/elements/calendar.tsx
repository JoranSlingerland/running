import 'dayjs/locale/en';

import dayjs from 'dayjs';
import dayLocaleData from 'dayjs/plugin/localeData';
import updateLocale from 'dayjs/plugin/updateLocale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';

import { Button } from '@ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@ui/card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ui/select';
import { Skeleton } from '@ui/skeleton';
import { Title } from '@ui/typography';
import {
  getFirstMondayBeforeMonth,
  getFirstSundayAfterMonth,
} from '@utils/dateTimeHelpers';

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
    'Statistics',
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
  const Loading = <Skeleton className="h-36" />;

  const Header = (
    <div className="mt-4 flex flex-row space-x-2">
      <Select
        value={currentDay.year().toString()}
        onValueChange={(newYear) => {
          handleSetYear(Number(newYear));
        }}
      >
        <SelectTrigger className="w-32">
          <SelectValue>{currentDay.year().toString()}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {years.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Select
        value={currentDay.format('MMMM')}
        onValueChange={(value) => {
          handleSetMonth(Number(value) - 1);
        }}
      >
        <SelectTrigger className="w-32">
          <SelectValue>{currentDay.format('MMMM')}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {months.map((month) => (
              <SelectItem key={month.format('M')} value={month.format('M')}>
                {month.format('MMMM')}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Button
        onClick={() => {
          handleToday();
        }}
      >
        Today
      </Button>
      <Button
        onClick={() => {
          handlePreviousMonth();
        }}
        size="icon"
        variant="secondary"
      >
        <ChevronLeft />
      </Button>

      <Button
        onClick={() => {
          handleNextMonth();
        }}
        size="icon"
        variant="secondary"
      >
        <ChevronRight />
      </Button>
    </div>
  );

  const CalendarHeader = (
    <div className="grid grid-cols-8">
      {daysOfWeek.map((day, index) => (
        <Title
          className={`my-2 text-center ${
            index === daysOfWeek.length - 1 ? 'ml-4' : ''
          }`}
          key={index}
          variant="h4"
        >
          {day}
        </Title>
      ))}
    </div>
  );

  const CalendarDays = (
    <div className="grid grid-cols-8">
      {daysInMonth.map((day, index) => {
        const isToday = dayjs().startOf('day').isSame(day.startOf('day'));
        const inThePast = dayjs().startOf('day').isAfter(day.startOf('day'));
        return (
          <React.Fragment key={index}>
            <Card
              className={`h-full rounded-none hover:bg-gray-100 dark:hover:bg-gray-800 ${
                inThePast ? 'brightness-95 dark:brightness-75' : ''
              }`}
            >
              <CardHeader>
                <CardTitle
                  className={`rounded-full p-1 ${
                    isToday ? 'border-2 font-bold ' : ''
                  }`}
                >
                  {titlePrefix && titlePrefix(day)}
                  {day.date() === 1 ? ` ${day.format('MMMM')} ` : ''}
                  {day.format('D')}
                  {titleAffix && titleAffix(day)}
                </CardTitle>
              </CardHeader>
              <CardContent className="min-h-[10rem]">
                {isLoading && Loading}
                {!isLoading && dateCellRenderer && dateCellRenderer(day)}
              </CardContent>
            </Card>
            {day.day() === 0 && (
              <div className="pl-4">
                <Card className="h-full rounded-none pt-2">
                  <CardContent className="min-h-[10rem]">
                    {isLoading && Loading}
                    {!isLoading && metaCellRenderer && metaCellRenderer(day)}
                  </CardContent>
                </Card>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  return (
    <div className="min-w-[1280px]">
      {Header}
      <div>
        {CalendarHeader}
        {CalendarDays}
      </div>
    </div>
  );
}
