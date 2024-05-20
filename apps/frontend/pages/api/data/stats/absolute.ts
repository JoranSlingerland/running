import { activitiesFromMongoDB } from '@repo/mongodb';
import { Activity } from '@repo/types';
import { ActivityStats, Statistics } from '@repo/types';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import type { NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

import { NextApiRequestUnknown } from '@pages/api/types';
import { getQueryParam } from '@utils/api';

dayjs.extend(isBetween);

type TimeFrame = 'week' | 'month' | 'year';

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
  const timeFrames = (getQueryParam(req.query, 'timeFrames') || '').split(
    ',',
  ) as TimeFrame[];

  const allowedTimeFrames = ['week', 'month', 'year'];
  if (timeFrames.some((timeFrame) => !allowedTimeFrames.includes(timeFrame))) {
    return res.status(400).json({
      message: `Invalid timeFrame. Allowed values are ${allowedTimeFrames.join(
        ', ',
      )}.`,
    });
  }

  // Get largest timeFrame
  const largestTimeFrame = timeFrames.reduce((acc, timeFrame) => {
    if (allowedTimeFrames.indexOf(timeFrame) > allowedTimeFrames.indexOf(acc)) {
      return timeFrame;
    }
    return acc;
  }, 'week');

  // Get all activities within timeFrame
  const startDate = dayjs()
    .subtract(1, largestTimeFrame)
    .startOf(largestTimeFrame);
  const endDate = dayjs();
  const activities = await activitiesFromMongoDB({
    id,
    startDate: startDate.format('YYYY-MM-DD'),
    endDate: endDate.format('YYYY-MM-DD'),
  });

  if (!activities) {
    return res.status(500).json({
      message: 'Something went wrong',
    });
  }

  const result: Statistics = {};
  timeFrames.forEach((timeFrame) => {
    result[timeFrame] = getTimeFrameData(timeFrame, activities);
  });

  return res.status(200).json(result);
}

function getTimeFrameData(
  timeFrame: TimeFrame,
  activities: Activity[],
): ActivityStats {
  const previousStartDate = dayjs().subtract(1, timeFrame).startOf(timeFrame);
  const previousEndDate = dayjs().subtract(1, timeFrame).endOf(timeFrame);
  const currentStartDate = dayjs().startOf(timeFrame);
  const currentEndDate = dayjs().endOf(timeFrame);
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
