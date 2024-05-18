import { Units } from '@repo/types';
import { signIn, useSession } from 'next-auth/react';

import { ActivityCardWithDialog } from '@elements/activityCard';
import { DailyWeatherBlock } from '@elements/weather';
import { useProps } from '@hooks/useProps';
import { useActivity } from '@services/data/activity';
import { useDistanceStats } from '@services/data/stats';
import { Button } from '@ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@ui/card';
import { Text, Title } from '@ui/typography';
import { formatDistance, formatPercent } from '@utils/formatting';

export default function Home() {
  const { status } = useSession();

  if (status === 'authenticated') {
    return <Dashboard />;
  }

  return <SignIn />;
}

const StatsCard = ({
  title,
  currentDistance,
  percentageDifference,
  absoluteDifference,
  units,
}: {
  title: string;
  currentDistance: number;
  percentageDifference: number;
  absoluteDifference: number;
  units: Units;
}) => {
  return (
    <Card className="text-center">
      <CardHeader>{title}</CardHeader>
      <CardContent>
        <Text size="large">
          {formatDistance({
            meters: currentDistance,
            units,
          })}
        </Text>
        <div className="flex flex-col">
          <Text type="muted">
            {formatPercent({
              value: percentageDifference,
            })}
          </Text>
          <Text type="muted">
            {formatDistance({
              meters: absoluteDifference,
              units,
            })}
          </Text>
        </div>
      </CardContent>
    </Card>
  );
};

function Dashboard() {
  const { data: statsData } = useDistanceStats({
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
    <div className="grid gap-4">
      <div className="grid grid-cols-3 gap-4 pt-2">
        <StatsCard
          title="Weekly"
          currentDistance={statsData?.week?.currentDistance || 0}
          percentageDifference={statsData?.week?.percentageDifference || 0}
          absoluteDifference={statsData?.week?.absoluteDifference || 0}
          units={userSettings?.data?.preferences.units || 'metric'}
        />
        <StatsCard
          title="Monthly"
          currentDistance={statsData?.month?.currentDistance || 0}
          percentageDifference={statsData?.month?.percentageDifference || 0}
          absoluteDifference={statsData?.month?.absoluteDifference || 0}
          units={userSettings?.data?.preferences.units || 'metric'}
        />
        <StatsCard
          title="Yearly"
          currentDistance={statsData?.year?.currentDistance || 0}
          percentageDifference={statsData?.year?.percentageDifference || 0}
          absoluteDifference={statsData?.year?.absoluteDifference || 0}
          units={userSettings?.data?.preferences.units || 'metric'}
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
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
          <Card />
        )}
        <Card className="pr-2 pt-2">
          <DailyWeatherBlock />
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
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

function SignIn() {
  return (
    <div className="flex flex-col items-center justify-center pt-10">
      <div className="max-w-screen-md space-y-5 text-center">
        <Title variant="h1">
          Unleash Your Potential with the Running Web App
        </Title>
        <Text className="px-5">
          Our app integrates data from third-party services, providing you with
          comprehensive insights and tools for your running training. Analyze
          your performance, track your progress, and reach your goals faster
          with our analytics.
        </Text>
        <Text className="px-5">
          Ready to take your training to the next level? Sign in now to get
          started!
        </Text>
        <Button onClick={() => signIn('github')}>Sign in</Button>
      </div>
    </div>
  );
}
