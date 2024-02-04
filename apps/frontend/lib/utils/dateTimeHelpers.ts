import dayjs from 'dayjs';

function getFirstMondayBeforeMonth(date: dayjs.Dayjs) {
  const firstDayOfMonth = dayjs(date).startOf('month');
  const firstMondayBeforeMonth = firstDayOfMonth.subtract(
    firstDayOfMonth.day() === 1 ? 0 : firstDayOfMonth.day() - 1,
    'day',
  );
  return firstMondayBeforeMonth;
}

function getFirstSundayAfterMonth(date: dayjs.Dayjs) {
  const lastDayOfMonth = dayjs(date).endOf('month');
  const firstSundayAfterMonth = lastDayOfMonth.add(
    lastDayOfMonth.day() === 0 ? 0 : 7 - lastDayOfMonth.day(),
    'day',
  );
  return firstSundayAfterMonth;
}

export { getFirstMondayBeforeMonth, getFirstSundayAfterMonth };
