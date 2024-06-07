import {
  AbsoluteStatistics,
  AbsoluteTimes,
  ActivityStats,
  MinimalActivity,
  RelativeStatistics,
  RelativeTimes,
} from '@repo/types';
import { Statistics } from '@repo/types';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import updateLocale from 'dayjs/plugin/updateLocale';

dayjs.extend(isBetween);
dayjs.extend(updateLocale);
dayjs.updateLocale('en', {
  weekStart: 1,
});

export function getStats(activities: MinimalActivity[]): Statistics {
  return {
    ...handleAbsoluteTimeFrame(activities),
    ...handleRelativeTimeFrame(activities),
  };
}

function handleAbsoluteTimeFrame(activities: MinimalActivity[]) {
  const timeFrames: AbsoluteTimes[] = ['week', 'month', 'year'];
  const uniqueSports = [
    ...new Set(activities.map((activity) => activity.type.toLowerCase())),
  ];

  const result: AbsoluteStatistics = {
    week: {},
    month: {},
    year: {},
  };

  timeFrames.forEach((timeFrame) => {
    result[timeFrame] = {};
    const props = {
      previousStartDate: dayjs().subtract(1, timeFrame).startOf(timeFrame),
      previousEndDate: dayjs().subtract(1, timeFrame),
      currentStartDate: dayjs().startOf(timeFrame),
      currentEndDate: dayjs(),
    };

    uniqueSports.forEach((sport) => {
      const sportActivities = activities.filter(
        (activity) => activity.type.toLowerCase() === sport,
      );

      result[timeFrame][sport] = getTimeFrameData({
        ...props,
        activities: sportActivities,
      });
    });

    result[timeFrame]['totals'] = getTimeFrameData({ ...props, activities });
  });

  return result;
}

function handleRelativeTimeFrame(activities: MinimalActivity[]) {
  const timeFrames: RelativeTimes[] = ['7d', '30d', '365d'];
  const timeFramesInDays = timeFrames.map((timeFrame) => {
    return Number(timeFrame.slice(0, -1));
  }) as (7 | 30 | 365)[];

  const uniqueSports = [
    ...new Set(activities.map((activity) => activity.type.toLowerCase())),
  ];

  const result: RelativeStatistics = {
    '7d': {},
    '30d': {},
    '365d': {},
  };

  timeFramesInDays.forEach((timeFrame) => {
    result[`${timeFrame}d`] = {};
    const props = {
      previousStartDate: dayjs().subtract(2 * timeFrame, 'day'),
      previousEndDate: dayjs().subtract(timeFrame, 'day'),
      currentStartDate: dayjs().subtract(timeFrame, 'day'),
      currentEndDate: dayjs(),
    };

    uniqueSports.forEach((sport) => {
      const sportActivities = activities.filter(
        (activity) => activity.type === sport,
      );

      result[`${timeFrame}d`][sport] = getTimeFrameData({
        ...props,
        activities: sportActivities,
      });
    });

    result[`${timeFrame}d`]['totals'] = getTimeFrameData({
      ...props,
      activities,
    });
  });

  return result;
}

function getTimeFrameData({
  previousStartDate,
  previousEndDate,
  currentStartDate,
  currentEndDate,
  activities,
}: {
  previousStartDate: dayjs.Dayjs;
  previousEndDate: dayjs.Dayjs;
  currentStartDate: dayjs.Dayjs;
  currentEndDate: dayjs.Dayjs;
  activities: MinimalActivity[];
}): ActivityStats {
  const distance = {
    previousValue: 0,
    currentValue: 0,
    percentageDifference: 0,
    absoluteDifference: 0,
  };
  const duration = {
    previousValue: 0,
    currentValue: 0,
    percentageDifference: 0,
    absoluteDifference: 0,
  };
  const activityCount = {
    previousValue: 0,
    currentValue: 0,
    percentageDifference: 0,
    absoluteDifference: 0,
  };

  activities.forEach((activity) => {
    const activityDate = dayjs(activity.start_date);
    if (activityDate.isBetween(previousStartDate, previousEndDate)) {
      activityCount.previousValue++;
      duration.previousValue += activity.moving_time;
      distance.previousValue += activity.distance;
    }
    if (activityDate.isBetween(currentStartDate, currentEndDate)) {
      activityCount.currentValue++;
      duration.currentValue += activity.moving_time;
      distance.currentValue += activity.distance;
    }
  });

  [distance, duration, activityCount].forEach((value) => {
    value.percentageDifference =
      value.previousValue > 0
        ? (value.currentValue - value.previousValue) / value.previousValue
        : 0;
    value.absoluteDifference = value.currentValue - value.previousValue;
  });

  return {
    distance,
    duration,
    activityCount,
  };
}
