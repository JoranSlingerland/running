import { AbsoluteTimes, Units } from '@repo/types';
import { ActivityStats } from '@repo/types';

import { ActivityCardWithDialog } from '@elements/activityCard';
import { Icon } from '@elements/icon';
import { DailyWeatherBlock } from '@elements/weather';
import { useProps } from '@hooks/useProps';
import useSessionStorageState from '@hooks/useSessionStorageState';
import { useActivity } from '@services/data/activity';
import { useStats } from '@services/data/stats';
import { Badge } from '@ui/badge';
import { Button } from '@ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@ui/card';
import { Skeleton } from '@ui/skeleton';
import { Text } from '@ui/typography';
import { formatDistance, formatTime } from '@utils/formatting';

const StatsCard = ({
  timeFrame,
  absoluteStats,
  relativeStats,
  units,
  isLoading,
}: {
  timeFrame: AbsoluteTimes;
  absoluteStats: ActivityStats | undefined;
  relativeStats: ActivityStats | undefined;
  units: Units;
  isLoading: boolean;
}) => {
  const [statTimeFrame, setStatTimeFrame] = useSessionStorageState<
    'absolute' | 'relative'
  >(`${timeFrame}-DashboardStats`, 'absolute');
  const stats = statTimeFrame === 'absolute' ? absoluteStats : relativeStats;
  const titles = {
    absolute: {
      week: 'Weekly',
      month: 'Monthly',
      year: 'Yearly',
    },
    relative: {
      week: '7 Days',
      month: '30 Days',
      year: '365 Days',
    },
  };

  const Stats = ({
    title,
    currentValue,
    absoluteDifference,
    isPositive,
  }: {
    title: string;
    currentValue: string | number | '() => string | number';
    absoluteDifference: string | number | '() => string | number';
    isPositive: boolean;
  }) => {
    return (
      <div className="flex flex-col">
        <Text className="text-xs" type="muted">
          {title}
        </Text>
        {isLoading ? (
          <Skeleton className="mb-1 h-6 w-16 self-center" />
        ) : (
          <Text className="text-base sm:text-lg">{currentValue}</Text>
        )}
        <div>
          <Badge className="px-2" variant={isPositive ? 'success' : 'outline'}>
            <div className="flex items-center justify-center space-x-2">
              {isLoading ? (
                <Skeleton className="h-6 w-16" />
              ) : (
                <>
                  <div>
                    <Icon
                      className="size-4 pr-4"
                      icon={
                        isPositive ? 'keyboard_arrow_up' : 'keyboard_arrow_down'
                      }
                    />
                  </div>
                  <Text>{absoluteDifference}</Text>
                </>
              )}
            </div>
          </Badge>
        </div>
      </div>
    );
  };

  return (
    <Card className="text-center">
      <CardHeader>
        <div className="flex items-center justify-center">
          <Text size="large">{titles[statTimeFrame][timeFrame]}</Text>
          <Button
            onClick={() =>
              setStatTimeFrame(
                statTimeFrame === 'absolute' ? 'relative' : 'absolute',
              )
            }
            size={'icon'}
            variant="ghost"
          >
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
  const { data: stats, isLoading: statsIsLoading } = useStats({
    query: {
      timeFrames: ['week', 'month', 'year', '7d', '30d', '365d'],
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
          timeFrame="week"
          absoluteStats={stats?.week}
          relativeStats={stats?.['7d']}
          units={userSettings?.data?.preferences.units || 'metric'}
          isLoading={statsIsLoading}
        />
        <StatsCard
          timeFrame="month"
          absoluteStats={stats?.month}
          relativeStats={stats?.['30d']}
          units={userSettings?.data?.preferences.units || 'metric'}
          isLoading={statsIsLoading}
        />
        <StatsCard
          timeFrame="year"
          absoluteStats={stats?.year}
          relativeStats={stats?.['365d']}
          units={userSettings?.data?.preferences.units || 'metric'}
          isLoading={statsIsLoading}
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
