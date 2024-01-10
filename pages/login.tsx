import Typography from '@ui/typography';
import Image from 'next/image';
import Link from 'next/link';

const { Text } = Typography;

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center space-y-10">
      <div className="max-w-5xl text-center">
        <Text className="pt-10" variant="h1">
          Unleash Your Potential with the Running Web App
        </Text>
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
      </div>
      <Link
        href={
          '/.auth/login/aad?post_login_redirect_uri=/authenticated/calendar/'
        }
      >
        <Image
          src="/images/ms-symbollockup_signin_light.png"
          alt="Microsoft"
          width={215}
          height={41}
        />
      </Link>
    </div>
  );
}
