import { AbsoluteTimes, SportStats, Units } from '@repo/types';

import { ActivityCardWithDialog } from '@elements/activityCard';
import { GoalsFormElement } from '@elements/forms/goals';
import { Icon } from '@elements/icon';
import { DailyWeatherBlock } from '@elements/weather';
import { useProps } from '@hooks/useProps';
import useSessionStorageState from '@hooks/useSessionStorageState';
import { useActivity } from '@services/data/activity';
import { useStats } from '@services/data/stats';
import { UseGoals, useGoals } from '@services/goals';
import { Badge } from '@ui/badge';
import { Button } from '@ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@ui/popover';
import { Progress } from '@ui/progress';
import { Skeleton } from '@ui/skeleton';
import { Text } from '@ui/typography';
import { formatDistance, formatTime } from '@utils/formatting';
import { SportIcon } from '@utils/formatting';

const StatsCard = ({
  timeFrame,
  absoluteStats,
  relativeStats,
  units,
  useGoals,
  isLoading,
}: {
  timeFrame: AbsoluteTimes;
  absoluteStats: SportStats | undefined;
  relativeStats: SportStats | undefined;
  units: Units;
  useGoals: UseGoals;
  isLoading: boolean;
}) => {
  const [statTimeFrame, setStatTimeFrame] = useSessionStorageState<
    'absolute' | 'relative'
  >(`${timeFrame}-DashboardStats`, 'absolute');
  const stats = statTimeFrame === 'absolute' ? absoluteStats : relativeStats;
  const totals = stats?.totals;
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

  const Goals = ({
    useGoals,
    absoluteStats,
    timeFrame,
  }: {
    useGoals: UseGoals;
    absoluteStats: SportStats | undefined;
    timeFrame: AbsoluteTimes;
  }) => {
    const goals =
      useGoals?.data?.filter((goal) => goal.timeFrame === timeFrame) || [];

    return (
      <div className="flex flex-col">
        <div className="flex items-center justify-center">
          <Text>Goals</Text>
          <Popover>
            <PopoverTrigger asChild>
              <Button size="icon" variant="ghost">
                <Icon icon="add" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto px-6">
              <GoalsFormElement
                goal={undefined}
                useGoals={useGoals}
                timeFrame={timeFrame}
              />
            </PopoverContent>
          </Popover>
        </div>
        {isLoading ? (
          <Skeleton className="mx-2 mb-1 h-6 w-full self-center" />
        ) : (
          <div>
            {goals.map((goal) => {
              const progress =
                ((absoluteStats?.[goal.sport]?.[
                  goal.type === 'distance' ? 'distance' : 'duration'
                ].currentValue || 0) /
                  goal.value) *
                100;

              return (
                <Popover key={goal._id}>
                  <PopoverTrigger asChild>
                    <div className="cursor-pointer">
                      <div className="flex  flex-col items-center justify-center sm:mx-2 sm:flex-row">
                        <div className="flex w-full items-center justify-center space-x-1">
                          <SportIcon sport={goal.sport} />
                          <Progress value={progress} />
                        </div>
                        <Icon
                          className={`size-4 ${progress >= 100 ? 'text-green-500 dark:text-green-900' : ''} hidden sm:block`}
                          icon={
                            progress >= 100
                              ? 'check_circle'
                              : 'keyboard_arrow_right'
                          }
                        />
                      </div>
                      <Text>
                        {
                          {
                            distance: `${formatDistance({
                              meters:
                                absoluteStats?.[goal.sport]?.distance
                                  .currentValue || 0,
                              units,
                              decimals: 0,
                            })} / ${formatDistance({
                              meters: goal.value,
                              units,
                              decimals: 0,
                            })}`,
                            time: `${formatTime({
                              seconds:
                                absoluteStats?.[goal.sport]?.duration
                                  .currentValue || 0,
                              addSeconds: false,
                            })} / ${formatTime({
                              seconds: goal.value,
                              addSeconds: false,
                            })}`,
                          }[goal.type]
                        }
                      </Text>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto px-6">
                    <GoalsFormElement
                      goal={{
                        ...goal,
                        value:
                          goal.type === 'distance'
                            ? goal.value / 1000
                            : goal.value / 60,
                      }}
                      useGoals={useGoals}
                      timeFrame={timeFrame}
                    />
                  </PopoverContent>
                </Popover>
              );
            })}
          </div>
        )}
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
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Stats
              title="Distance"
              currentValue={formatDistance({
                meters: totals?.distance.currentValue || 0,
                units,
                decimals: 0,
              })}
              absoluteDifference={formatDistance({
                meters: totals?.distance.absoluteDifference || 0,
                units,
                decimals: 0,
              })}
              isPositive={
                totals?.distance.absoluteDifference &&
                totals?.distance.absoluteDifference > 0
                  ? totals?.distance.absoluteDifference > 0
                  : false
              }
            />
          </div>
          <div className="hidden sm:block">
            <Stats
              title="Duration"
              currentValue={formatTime({
                seconds: totals?.duration.currentValue,
                addSeconds: false,
              })}
              absoluteDifference={formatTime({
                seconds: totals?.duration.absoluteDifference,
                addSeconds: false,
              })}
              isPositive={
                totals?.duration.absoluteDifference &&
                totals?.duration.absoluteDifference > 0
                  ? totals?.duration.absoluteDifference > 0
                  : false
              }
            />
          </div>
          <div className="hidden lg:block">
            <Stats
              title="Activities"
              currentValue={totals?.activityCount.currentValue || 0}
              absoluteDifference={totals?.activityCount.absoluteDifference || 0}
              isPositive={
                totals?.activityCount.absoluteDifference &&
                totals?.activityCount.absoluteDifference > 0
                  ? totals?.activityCount.absoluteDifference > 0
                  : false
              }
            />
          </div>
        </div>
        <div className="mt-2">
          <Goals
            useGoals={useGoals}
            absoluteStats={absoluteStats}
            timeFrame={timeFrame}
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
  const goals = useGoals({});

  return (
    <div className="grid gap-2 md:gap-4">
      <div className="grid grid-cols-3 gap-2 pt-2 md:gap-4">
        <StatsCard
          timeFrame="week"
          absoluteStats={stats?.week}
          relativeStats={stats?.['7d']}
          units={userSettings?.data?.preferences.units || 'metric'}
          isLoading={statsIsLoading || goals.isLoading}
          useGoals={goals}
        />
        <StatsCard
          timeFrame="month"
          absoluteStats={stats?.month}
          relativeStats={stats?.['30d']}
          units={userSettings?.data?.preferences.units || 'metric'}
          isLoading={statsIsLoading || goals.isLoading}
          useGoals={goals}
        />
        <StatsCard
          timeFrame="year"
          absoluteStats={stats?.year}
          relativeStats={stats?.['365d']}
          units={userSettings?.data?.preferences.units || 'metric'}
          isLoading={statsIsLoading || goals.isLoading}
          useGoals={goals}
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
