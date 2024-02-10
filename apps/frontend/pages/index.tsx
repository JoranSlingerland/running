import { signIn, signOut, useSession } from 'next-auth/react';

import { Button } from '@ui/button';
import { Text, Title } from '@ui/typography';
import { cn } from '@utils/shadcn';

function Layout({
  children,
  ClassName,
}: {
  children: React.ReactNode;
  ClassName?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center pt-10',
        ClassName,
      )}
    >
      <div className="max-w-5xl text-center space-y-5">{children}</div>
    </div>
  );
}

export default function Home() {
  const { data: session, status } = useSession();
  const userEmail = session?.user?.email;

  if (status === 'authenticated') {
    return (
      <Layout ClassName="pt-10">
        <Text>Signed in as {userEmail}</Text>
        <Button onClick={() => signOut()}>Sign out</Button>
      </Layout>
    );
  }

  return (
    <Layout>
      <Title variant="h1">
        Unleash Your Potential with the Running Web App
      </Title>
      <Text className="px-5">
        Our app integrates data from third-party services, providing you with
        comprehensive insights and tools for your running training. Analyze your
        performance, track your progress, and reach your goals faster with our
        analytics.
      </Text>
      <Text className="px-5">
        Ready to take your training to the next level? Sign in now to get
        started!
      </Text>

      <Button onClick={() => signIn('github')}>Sign in</Button>
    </Layout>
  );
}
