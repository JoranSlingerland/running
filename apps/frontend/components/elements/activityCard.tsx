import 'dayjs/locale/en';

import type { Activity } from '@repo/types';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import dayLocaleData from 'dayjs/plugin/localeData';
import updateLocale from 'dayjs/plugin/updateLocale';
import utc from 'dayjs/plugin/utc';
import * as React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@ui/dialog';
import { Text } from '@ui/typography';
import {
  formatDistance,
  formatNumber,
  formatPace,
  formatTime,
  sportIcon,
} from '@utils/formatting';
import { getPreferredTss } from '@utils/tss/helpers';
import { isNotNullOrZero } from '@utils/utils';

import { ActivityBox } from './activityBox';

dayjs.extend(isBetween);
dayjs.extend(dayLocaleData);
dayjs.extend(updateLocale);
dayjs.extend(utc);

type CardProps = {
  activity: Activity;
  userSettings: UserSettings | undefined;
  tss: { tss: number | undefined; type: 'hr' | 'pace' | undefined };
};

export const ActivityCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & CardProps
>(({ activity, userSettings, tss, className, ...props }, ref) => (
  <Card className={className} ref={ref} {...props}>
    <CardHeader>
      <CardTitle>
        <div className="flex items-center space-x-1">
          {sportIcon(activity.type)}
          {`${activity.type} at ${dayjs(activity.start_date).format('HH:mm')}`}
        </div>
      </CardTitle>
    </CardHeader>
    <CardContent className="ml-2 flex flex-col">
      {isNotNullOrZero(activity.elapsed_time) && (
        <Text>
          {formatTime({
            seconds: activity.elapsed_time,
            addSeconds: false,
          })}
          {' hours'}
        </Text>
      )}
      {isNotNullOrZero(activity.distance) && (
        <Text>
          {formatDistance({
            meters: activity.distance,
            units: userSettings?.preferences.units || 'metric',
          })}
        </Text>
      )}
      {isNotNullOrZero(tss?.tss) && (
        <Text>
          {formatNumber({
            number: tss?.tss,
            decimals: 0,
          })}{' '}
          TSS
        </Text>
      )}

      {isNotNullOrZero(activity.average_heartrate) && (
        <Text>{activity.average_heartrate} BPM</Text>
      )}
      {isNotNullOrZero(activity.average_speed) && (
        <Text>
          {formatPace({
            metersPerSecond: activity.average_speed,
            units: userSettings?.preferences.units || 'metric',
          })}
        </Text>
      )}
    </CardContent>
  </Card>
));
ActivityCard.displayName = 'ActivityCard';

export function ActivityCardWithDialog({
  activity,
  userSettings,
  cardClassName,
}: {
  activity: Activity;
  userSettings: UserSettings | undefined;
  cardClassName?: string;
}): JSX.Element {
  const tss = getPreferredTss(
    userSettings?.preferences?.preferred_tss_type,
    activity,
  );
  return (
    <Dialog>
      <DialogTrigger asChild>
        <ActivityCard
          activity={activity}
          userSettings={userSettings}
          tss={tss}
          className={cardClassName}
          ref={(ref) => {
            if (ref) {
              ref.style.width = '100%';
            }
          }}
        />
      </DialogTrigger>
      <DialogContent className="max-h-[90%] max-w-[90%] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-1">
            {sportIcon(activity.type)}
            {`${activity.type} at ${dayjs(activity.start_date).format('HH:mm')}`}
          </DialogTitle>
          <ActivityBox activityId={activity._id} />
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
