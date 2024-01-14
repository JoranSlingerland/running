import { useRouter } from 'next/router';
import { useStravaCallback } from '@services/callback/strava';
import Steps from '@elements/steps';
import { Loader2, XCircle, CheckCircle2 } from 'lucide-react';

export default function home() {
  const router = useRouter();
  const { code, scope } = router.query;
  const { isLoading, isError, data, error } = useStravaCallback({
    query: { code: code as string, scope: scope as string },
    enabled: code ? true : false,
  });
  if (!isLoading) {
    setTimeout(
      () => {
        router.push('/authenticated/settings');
      },
      isError ? 5000 : 1000,
    );
  }

  return (
    <div className="flex justify-center">
      <Steps
        steps={[
          {
            title: 'Processing Strava Authentication',
            status: isLoading ? 'process' : isError ? 'error' : 'finish',
            icon: isLoading ? (
              <Loader2 className="animate-spin" />
            ) : isError ? (
              <XCircle />
            ) : (
              <CheckCircle2 />
            ),
          },
          {
            title: 'Redirecting to settings',
            status: isLoading ? 'wait' : isError ? 'error' : 'finish',
            icon: isLoading ? <></> : <Loader2 className="animate-spin" />,
            description: isError ? error?.json.result : data?.result,
          },
        ]}
        className="w-auto mt-4"
      />
    </div>
  );
}
