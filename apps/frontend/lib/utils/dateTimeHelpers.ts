import dayjs from 'dayjs';

function getFirstMondayBeforeMonth(date: dayjs.Dayjs) {
  const firstDayOfMonth = dayjs(date).startOf('month');
  return firstDayOfMonth.subtract(
    firstDayOfMonth.day() === 1 ? 0 : firstDayOfMonth.day() - 1,
    'day',
  );
}

function getFirstSundayAfterMonth(date: dayjs.Dayjs) {
  const lastDayOfMonth = dayjs(date).endOf('month');
  return lastDayOfMonth.add(
    lastDayOfMonth.day() === 0 ? 0 : 7 - lastDayOfMonth.day(),
    'day',
  );
}

export { getFirstMondayBeforeMonth, getFirstSundayAfterMonth };
