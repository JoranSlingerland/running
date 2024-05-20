import { Units } from '@repo/types';
import { ActivityStats } from '@repo/types';

import { ActivityCardWithDialog } from '@elements/activityCard';
import { Icon } from '@elements/icon';
import { DailyWeatherBlock } from '@elements/weather';
import { useProps } from '@hooks/useProps';
import { useActivity } from '@services/data/activity';
import { useAbsoluteStats } from '@services/data/stats';
import { Badge } from '@ui/badge';
import { Button } from '@ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@ui/card';
import { Text } from '@ui/typography';
import { formatDistance, formatTime } from '@utils/formatting';

const StatsCard = ({
  title,
  stats,
  units,
}: {
  title: string;
  stats: ActivityStats | undefined;
  units: Units;
}) => {
  const Stats = ({
    title,
    currentValue,
    absoluteDifference,
    isPositive,
  }: {
    title: string;
    currentValue: string | number | '() => string | number';
    percentageDifference: number;
    absoluteDifference: string | number | '() => string | number';
    isPositive: boolean;
  }) => {
    return (
      <div>
        <Text className="text-xs" type="muted">
          {title}
        </Text>
        <Text className="text-base sm:text-lg">{currentValue}</Text>
        <Badge className="px-2" variant={isPositive ? 'success' : 'outline'}>
          <div className="flex items-center justify-center space-x-2">
            <div>
              <Icon
                className="size-4 pr-4"
                icon={isPositive ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
              />
            </div>
            <Text>{absoluteDifference}</Text>
          </div>
        </Badge>
      </div>
    );
  };

  return (
    <Card className="text-center">
      <CardHeader>
        <div className="flex items-center justify-center">
          <Text size="large">{title}</Text>
          <Button size={'icon'} variant="ghost">
            <Icon icon="swap_horiz" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <Stats
            title="Distance"
            currentValue={formatDistance({
              meters: stats?.distance.currentValue || 0,
              units,
            })}
            percentageDifference={stats?.distance.percentageDifference || 0}
            absoluteDifference={formatDistance({
              meters: stats?.distance.absoluteDifference || 0,
              units,
            })}
            isPositive={
              stats?.distance.absoluteDifference &&
              stats?.distance.absoluteDifference > 0
                ? stats?.distance.absoluteDifference > 0
                : false
            }
          />
        </div>
        <div className="hidden sm:block">
          <Stats
            title="Duration"
            currentValue={formatTime({
              seconds: stats?.duration.currentValue,
              addSeconds: false,
            })}
            percentageDifference={stats?.duration.percentageDifference || 0}
            absoluteDifference={formatTime({
              seconds: stats?.duration.absoluteDifference,
              addSeconds: false,
            })}
            isPositive={
              stats?.duration.absoluteDifference &&
              stats?.duration.absoluteDifference > 0
                ? stats?.duration.absoluteDifference > 0
                : false
            }
          />
        </div>
        <div className="hidden lg:block">
          <Stats
            title="Activities"
            currentValue={stats?.activityCount.currentValue || 0}
            percentageDifference={
              stats?.activityCount.percentageDifference || 0
            }
            absoluteDifference={stats?.activityCount.absoluteDifference || 0}
            isPositive={
              stats?.activityCount.absoluteDifference &&
              stats?.activityCount.absoluteDifference > 0
                ? stats?.activityCount.absoluteDifference > 0
                : false
            }
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default function Dashboard() {
  const { data: statsData } = useAbsoluteStats({
    query: {
      timeFrames: ['week', 'month', 'year'].toString(),
    },
  });
  const { userSettings } = useProps();
  const { data: latestActivity } = useActivity({
    query: {
      id: 'latest',
    },
  });

  return (
    <div className="grid gap-2 md:gap-4">
      <div className="grid grid-cols-3 gap-2 pt-2 md:gap-4">
        <StatsCard
          title="Weekly"
          stats={statsData?.week}
          units={userSettings?.data?.preferences.units || 'metric'}
        />
        <StatsCard
          title="Monthly"
          stats={statsData?.month}
          units={userSettings?.data?.preferences.units || 'metric'}
        />
        <StatsCard
          title="Yearly"
          stats={statsData?.year}
          units={userSettings?.data?.preferences.units || 'metric'}
        />
      </div>
      <div className="grid gap-2 md:gap-4 lg:grid-cols-2">
        {latestActivity ? (
          <Card className="p-2">
            <Text size="large" className="pb-2">
              Your latest activity
            </Text>
            <ActivityCardWithDialog
              activity={latestActivity}
              userSettings={userSettings?.data}
            />
          </Card>
        ) : (
          <Card className="flex h-full items-center justify-center">
            <Text size="large">
              Begin tracking your activities to view them here
            </Text>
          </Card>
        )}
        <Card className="pr-2 pt-2">
          <DailyWeatherBlock />
        </Card>
      </div>
      <div className="grid gap-2 md:gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>Chart 1</CardHeader>
          <CardContent>Chart</CardContent>
          <CardFooter>Chart </CardFooter>
        </Card>
        <Card>
          <CardHeader>Chart 2</CardHeader>
          <CardContent>Chart</CardContent>
          <CardFooter>Chart </CardFooter>
        </Card>
      </div>
    </div>
  );
}
