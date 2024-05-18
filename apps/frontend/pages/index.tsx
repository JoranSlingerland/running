import { useRouter } from 'next/router';
import { signIn, useSession } from 'next-auth/react';
import { useEffect } from 'react';

import { Button } from '@ui/button';
import { Text, Title } from '@ui/typography';

export default function Home() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/authenticated/dashboard/');
    }
  }, [status, router]);

  return <SignIn />;
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
        <Button
          onClick={() =>
            signIn('github', {
              callbackUrl: '/authenticated/dashboard',
            })
          }
        >
          Sign in
        </Button>
      </div>
    </div>
  );
}
