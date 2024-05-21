import { activitiesFromMongoDB } from '@repo/mongodb';
import { Activity } from '@repo/types';
import { ActivityStats, Statistics } from '@repo/types';
import { AbsoluteTimes, RelativeTimes } from '@repo/types';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import type { NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

import { NextApiRequestUnknown } from '@pages/api/types';
import { getQueryParam } from '@utils/api';

dayjs.extend(isBetween);

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

  // Check if only allowed timeFrames are used and if they are not mixed
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

  if (absoluteTimeFrames.length > 0) {
    absoluteResult = await handleAbsoluteTimeFrame(res, id, absoluteTimeFrames);
  }

  if (relativeTimeFrames.length > 0) {
    relativeResult = await handleRelativeTimeFrame(res, id, relativeTimeFrames);
  }

  const result = {
    ...absoluteResult,
    ...relativeResult,
  };

  if (!result) {
    return res.status(500).json({
      message: 'Something went wrong.',
    });
  }

  res.status(200).json(result);
}

async function handleAbsoluteTimeFrame(
  res: NextApiResponse,
  id: string,
  timeFrames: AbsoluteTimes[],
) {
  const allowedAbsoluteTimeFrames = ['week', 'month', 'year'];
  const largestTimeFrame = timeFrames.reduce((acc, timeFrame) => {
    if (
      allowedAbsoluteTimeFrames.indexOf(timeFrame) >
      allowedAbsoluteTimeFrames.indexOf(acc)
    ) {
      return timeFrame;
    }
    return acc;
  }, 'week');

  const startDate = dayjs()
    .subtract(1, largestTimeFrame)
    .startOf(largestTimeFrame);
  const endDate = dayjs().endOf(largestTimeFrame);
  const activities = await activitiesFromMongoDB({
    id,
    startDate: startDate.format('YYYY-MM-DD'),
    endDate: endDate.format('YYYY-MM-DD'),
  });

  if (!activities) {
    return undefined;
  }

  const result: Statistics = {};
  timeFrames.forEach((timeFrame) => {
    result[timeFrame] = getTimeFrameData(
      dayjs().subtract(1, timeFrame).startOf(timeFrame),
      dayjs().subtract(1, timeFrame).endOf(timeFrame),
      dayjs().startOf(timeFrame),
      dayjs().endOf(timeFrame),
      activities,
    );
  });

  return result;
}

async function handleRelativeTimeFrame(
  res: NextApiResponse,
  id: string,
  timeFrames: RelativeTimes[],
) {
  const timeFramesInDays = timeFrames.map((timeFrame) => {
    return Number(timeFrame.slice(0, -1));
  }) as (7 | 30 | 365)[];

  const largestTimeFrame = timeFramesInDays.sort((a, b) => b - a)[0];

  const startDate = dayjs().subtract(2 * largestTimeFrame, 'day');
  const endDate = dayjs();
  const activities = await activitiesFromMongoDB({
    id,
    startDate: startDate.format('YYYY-MM-DD'),
    endDate: endDate.format('YYYY-MM-DD'),
  });

  if (!activities) {
    return undefined;
  }

  const result: Statistics = {};
  timeFramesInDays.forEach((timeFrame) => {
    result[`${timeFrame}d`] = getTimeFrameData(
      dayjs().subtract(2 * timeFrame, 'day'),
      dayjs().subtract(timeFrame, 'day'),
      dayjs().subtract(timeFrame, 'day'),
      dayjs(),
      activities,
    );
  });

  return result;
}

function getTimeFrameData(
  previousStartDate: dayjs.Dayjs,
  previousEndDate: dayjs.Dayjs,
  currentStartDate: dayjs.Dayjs,
  currentEndDate: dayjs.Dayjs,
  activities: Activity[],
): ActivityStats {
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
    if (
      dayjs(activity.start_date).isBetween(previousStartDate, previousEndDate)
    ) {
      activityCount.previousValue++;
      duration.previousValue += activity.moving_time;
      distance.previousValue += activity.distance;
    }
    if (
      dayjs(activity.start_date).isBetween(currentStartDate, currentEndDate)
    ) {
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
