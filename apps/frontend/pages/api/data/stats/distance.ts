import { activitiesFromMongoDB } from '@repo/mongodb';
import { Activity } from '@repo/types';
import { DistanceStat, DistanceStats } from '@repo/types';
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
  const startDate = dayjs().subtract(2, largestTimeFrame);
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

  const result = timeFrames.reduce((acc, timeFrame) => {
    acc[timeFrame] = getTimeFrameData(timeFrame, activities);
    return acc;
  }, {} as DistanceStats);

  return res.status(200).json(result);
}

function getTimeFrameData(
  timeFrame: TimeFrame,
  activities: Activity[],
): DistanceStat {
  let startDate = dayjs().subtract(2, timeFrame as TimeFrame);
  let endDate = dayjs().subtract(1, timeFrame as TimeFrame);
  const previousDistance = activities.reduce((acc, activity) => {
    if (dayjs(activity.start_date).isBetween(startDate, endDate)) {
      return acc + activity.distance;
    }
    return acc;
  }, 0);

  // Calculate total distance for the current timeFrame
  startDate = dayjs().subtract(1, timeFrame as 'week' | 'month' | 'year');
  endDate = dayjs();
  const currentDistance = activities.reduce((acc, activity) => {
    if (dayjs(activity.start_date).isBetween(startDate, endDate)) {
      return acc + activity.distance;
    }
    return acc;
  }, 0);

  return {
    previousDistance,
    currentDistance,
    percentageDifference:
      previousDistance > 0
        ? (currentDistance - previousDistance) / previousDistance
        : 0,
    absoluteDifference: currentDistance - previousDistance,
  };
}
