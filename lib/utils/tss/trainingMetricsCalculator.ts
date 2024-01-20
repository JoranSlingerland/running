import { Activity } from '@services/data/activities';
import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { calculateDailyTss } from '@utils/tss/helpers';

function calculateDailyTrainingLoads(
  trainingStressScore: number,
  acuteLoadYesterday: number,
  chronicLoadYesterday: number,
) {
  const acuteTimeConstant = 7;
  const chronicTimeConstant = 42;

  // Calculate decay factors for acute and chronic loads
  const acuteDecayFactor = 2 / (acuteTimeConstant + 1);
  const chronicDecayFactor = 2 / (chronicTimeConstant + 1);

  // Calculate ATL and CTL for today
  const acuteLoadToday =
    trainingStressScore * acuteDecayFactor +
    (1 - acuteDecayFactor) * acuteLoadYesterday;
  const chronicLoadToday =
    trainingStressScore * chronicDecayFactor +
    (1 - chronicDecayFactor) * chronicLoadYesterday;

  // Calculate TSB for today
  const stressBalanceToday = chronicLoadToday - acuteLoadYesterday;

  // Calculate workload ratio
  const workloadRatio = acuteLoadToday / chronicLoadToday;

  return {
    acuteLoadToday,
    chronicLoadToday,
    stressBalanceToday,
    workloadRatio,
  };
}

function calculateMetricsForAllDays(dailyTss: { date: string; tss: number }[]) {
  let acuteLoadYesterday = 0;
  let chronicLoadYesterday = 0;

  const singleDay = dailyTss.map((day) => {
    const {
      acuteLoadToday,
      chronicLoadToday,
      stressBalanceToday,
      workloadRatio,
    } = calculateDailyTrainingLoads(
      day.tss,
      acuteLoadYesterday,
      chronicLoadYesterday,
    );
    acuteLoadYesterday = acuteLoadToday;
    chronicLoadYesterday = chronicLoadToday;
    return {
      date: day.date,
      acuteLoadToday,
      chronicLoadToday,
      stressBalanceToday,
      workloadRatio,
    };
  });

  return singleDay.filter((day) => day.date > singleDay[42].date);
}

function calculateTrainingMetrics({
  activities,
  userSettings,
  startDate,
  endDate,
}: {
  activities: Activity[] | undefined;
  userSettings: UserSettings | undefined;
  startDate?: Dayjs;
  endDate?: Dayjs;
}): { date: Dayjs; atl: number; ctl: number; tsb: number }[] {
  if (!activities || activities.length === 0) {
    console.warn('No activities found');
    return [];
  }

  // Get start and end dates of activities
  activities.sort((a, b) => dayjs(a.start_date).diff(dayjs(b.start_date)));
  if (!startDate) {
    startDate = dayjs(activities[0].start_date);
  }
  if (!endDate) {
    endDate = dayjs(activities[activities.length - 1].start_date);
  }

  // Validate that we have at least 42 days of data
  const days = endDate.diff(startDate, 'day');
  if (days < 42) {
    console.warn('Not enough data to calculate training metrics');
    return [];
  }

  // Calculate daily TSS
  const dailyTssData = calculateDailyTss(
    startDate,
    endDate,
    activities,
    userSettings,
  );

  // Calculate ATL, CTL, and TSB for each day
  const trainingMetrics = calculateMetricsForAllDays(dailyTssData).map(
    (day) => ({
      date: dayjs(day.date),
      atl: day.acuteLoadToday,
      ctl: day.chronicLoadToday,
      tsb: day.stressBalanceToday,
      wlr: day.workloadRatio,
    }),
  );

  return trainingMetrics;
}

export { calculateTrainingMetrics };
