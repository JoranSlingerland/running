import type { Activity } from '@repo/types';
import { Dayjs } from 'dayjs';

function getPreferredTss(
  preferredTss: 'hr' | 'pace' | undefined,
  activity: Activity,
): { tss: number | undefined; type: 'hr' | 'pace' | undefined } {
  const hr_tss = activity.hr_trimp;
  const pace_tss = activity.pace_trimp;

  if (preferredTss === 'hr' && hr_tss) {
    return {
      tss: hr_tss,
      type: 'hr',
    };
  }
  if ((preferredTss === 'pace' && pace_tss) || pace_tss) {
    return {
      tss: pace_tss,
      type: 'pace',
    };
  }
  if (hr_tss) {
    return {
      tss: hr_tss,
      type: 'hr',
    };
  }
  return {
    tss: undefined,
    type: preferredTss,
  };
}

function calculateDailyTss(
  startDate: Dayjs,
  endDate: Dayjs,
  activities: Activity[],
  preferredTss: 'hr' | 'pace' | undefined,
): { date: string; tss: number }[] {
  const tssByDate: { [key: string]: number } = {};
  const days = endDate.diff(startDate, 'day') + 2;

  for (let i = 0; i < days; i++) {
    const date = startDate.add(i, 'day').format('YYYY-MM-DD');
    tssByDate[date] = 0;
  }

  activities.forEach((activity) => {
    const { tss } = getPreferredTss(preferredTss, activity);
    if (tss) {
      const date = activity.start_date.split('T')[0];
      if (tssByDate.hasOwnProperty(date)) {
        tssByDate[date] += tss;
      }
    }
  });

  return Object.keys(tssByDate).map((date) => ({
    date,
    tss: tssByDate[date],
  }));
}

export { getPreferredTss, calculateDailyTss };
