import { activitiesFromMongoDB } from '@repo/mongodb';
import { Activity } from '@repo/types';
import { ActivityStats, Statistics } from '@repo/types';
import { AbsoluteTimes, RelativeTimes } from '@repo/types';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import updateLocale from 'dayjs/plugin/updateLocale';
import type { NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

import { NextApiRequestUnknown } from '@pages/api/types';
import { getQueryParam } from '@utils/api';

dayjs.extend(isBetween);
dayjs.extend(updateLocale);
dayjs.updateLocale('en', {
  weekStart: 1,
});

export default async function handler(
  req: NextApiRequestUnknown,
  res: NextApiResponse,
) {
  const token = await getToken({ req });
  if (!token) {
    res.status(401).end();
    return;
  }

  switch (req.method) {
    case 'GET':
      await handleGet(res, req, token.id as string);
      break;
    default:
      res.setHeader('Allow', 'GET');
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

async function handleGet(
  res: NextApiResponse,
  req: NextApiRequestUnknown,
  id: string,
) {
  const timeFrames = (getQueryParam(req.query, 'timeFrames') || '').split(',');

  const allowedAbsoluteTimeFrames = ['week', 'month', 'year'];
  const allowedRelativeTimeFrames = ['7d', '30d', '365d'];
  const allowedTimeFrames = [
    ...allowedAbsoluteTimeFrames,
    ...allowedRelativeTimeFrames,
  ];

  if (timeFrames.some((timeFrame) => !allowedTimeFrames.includes(timeFrame))) {
    return res.status(400).json({
      message: `Invalid timeFrame. Allowed values are ${allowedAbsoluteTimeFrames.join(', ')} and ${allowedRelativeTimeFrames.join(', ')}.`,
    });
  }

  const absoluteTimeFrames = timeFrames.filter((timeFrame) =>
    allowedAbsoluteTimeFrames.includes(timeFrame),
  ) as AbsoluteTimes[];

  const relativeTimeFrames = timeFrames.filter((timeFrame) =>
    allowedRelativeTimeFrames.includes(timeFrame),
  ) as RelativeTimes[];

  let absoluteResult: Statistics | undefined;
  let relativeResult: Statistics | undefined;

  const startDate = getLargestTimeFrame(absoluteTimeFrames, relativeTimeFrames);
  const endDate = dayjs();
  const activities = (
    await activitiesFromMongoDB({
      id,
      startDate: startDate.format('YYYY-MM-DD'),
      endDate: endDate.format('YYYY-MM-DD'),
    })
  )?.map((activity) => ({ ...activity, type: activity.type.toLowerCase() }));

  if (!activities) {
    return res.status(200).json({});
  }

  if (absoluteTimeFrames.length > 0) {
    absoluteResult = await handleAbsoluteTimeFrame(
      absoluteTimeFrames,
      activities,
    );
  }

  if (relativeTimeFrames.length > 0) {
    relativeResult = await handleRelativeTimeFrame(
      relativeTimeFrames,
      activities,
    );
  }

  const result: Statistics = {
    ...absoluteResult,
    ...relativeResult,
  };

  res.status(200).json(result);
}

async function handleAbsoluteTimeFrame(
  timeFrames: AbsoluteTimes[],
  activities: Activity[],
) {
  const uniqueSports = [
    ...new Set(activities.map((activity) => activity.type.toLowerCase())),
  ];

  const result: Statistics = {};

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
        (activity) => activity.type === sport,
      );

      // @ts-expect-error Setting result[timeFrame] to an empty object above
      result[timeFrame][sport] = getTimeFrameData({
        ...props,
        activities: sportActivities,
      });
    });

    // @ts-expect-error Setting result[timeFrame] to an empty object above
    result[timeFrame]['totals'] = getTimeFrameData({ ...props, activities });
  });

  return result;
}

async function handleRelativeTimeFrame(
  timeFrames: RelativeTimes[],
  activities: Activity[],
) {
  const timeFramesInDays = timeFrames.map((timeFrame) => {
    return Number(timeFrame.slice(0, -1));
  }) as (7 | 30 | 365)[];

  const uniqueSports = [
    ...new Set(activities.map((activity) => activity.type.toLowerCase())),
  ];

  const result: Statistics = {};

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

      // @ts-expect-error Setting result[timeFrame] to an empty object above
      result[`${timeFrame}d`][sport] = getTimeFrameData({
        ...props,
        activities: sportActivities,
      });
    });

    // @ts-expect-error Setting result[timeFrame] to an empty object above
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
  activities: Activity[];
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

function getLargestTimeFrame(
  absoluteTimeFrames: AbsoluteTimes[],
  relativeTimeFrames: RelativeTimes[],
) {
  const absoluteTimeFramesOrder = ['week', 'month', 'year'];
  const largestAbsoluteTimeFrame = absoluteTimeFrames.sort(
    (a, b) =>
      absoluteTimeFramesOrder.indexOf(b) - absoluteTimeFramesOrder.indexOf(a),
  )[0];

  const timeFramesInDays = relativeTimeFrames.map((timeFrame) =>
    Number(timeFrame.slice(0, -1)),
  );
  const largestRelativeTimeFrame = Math.max(...timeFramesInDays);

  const minRelativeTimeFrame = dayjs().subtract(
    2 * largestRelativeTimeFrame,
    'day',
  );
  const minAbsoluteTimeFrame = dayjs()
    .subtract(1, largestAbsoluteTimeFrame)
    .startOf(largestAbsoluteTimeFrame);

  return minRelativeTimeFrame.isBefore(minAbsoluteTimeFrame)
    ? minRelativeTimeFrame
    : minAbsoluteTimeFrame;
}
