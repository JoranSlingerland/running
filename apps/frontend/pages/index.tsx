import dayjs from 'dayjs';
import { signIn, useSession } from 'next-auth/react';

import { useActivities } from '@services/data/activities';
import { useDistanceStats } from '@services/data/stats';
import { Button } from '@ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@ui/card';
import { Text, Title } from '@ui/typography';

export default function Home() {
  const { status } = useSession();

  if (status === 'authenticated') {
    return <Dashboard />;
  }

  return <SignIn />;
}

function Dashboard() {
  // TODO: ? Write custom api that only gets required stats. This should allow caching and drastically reduce the amount of data fetched.
  const { data: statsData, isLoading: statsIsLoading } = useDistanceStats({
    query: {
      timeFrames: ['week', 'month', 'year'],
    },
  });
  console.log(statsData);
  return (
    <div className="grid gap-2">
      <div className="grid grid-cols-3 gap-2 pt-2">
        <Card>
          <CardHeader>Weekly</CardHeader>
          <CardContent>10km</CardContent>
          <CardFooter>10% </CardFooter>
        </Card>
        <Card>
          <CardHeader>Monthly</CardHeader>
          <CardContent>10km</CardContent>
          <CardFooter>10% </CardFooter>
        </Card>
        <Card>
          <CardHeader>Yearly</CardHeader>
          <CardContent>10km</CardContent>
          <CardFooter>10% </CardFooter>
        </Card>
      </div>
      <div className="grid gap-2 xl:grid-cols-2">
        <Card>
          <CardHeader>Latest run</CardHeader>
          <CardContent>10km</CardContent>
          <CardFooter>Map </CardFooter>
        </Card>
        <Card>
          <CardHeader>Weather</CardHeader>
          <CardContent>Weather</CardContent>
          <CardFooter>10% </CardFooter>
        </Card>
      </div>
      <div className="grid gap-2 xl:grid-cols-2">
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
