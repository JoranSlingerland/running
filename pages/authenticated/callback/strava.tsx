import { useRouter } from 'next/router';
import { useStravaCallback } from '../../../components/services/callback/strava';
import { Steps } from 'antd';
import {
  LoadingOutlined,
  CloseOutlined,
  CheckOutlined,
} from '@ant-design/icons';

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
        direction="vertical"
        items={[
          {
            title: 'Processing Strava Authentication',
            status: isLoading ? 'process' : isError ? 'error' : 'finish',
            icon: isLoading ? (
              <LoadingOutlined />
            ) : isError ? (
              <CloseOutlined />
            ) : (
              <CheckOutlined />
            ),
          },
          {
            title: 'Redirecting to settings',
            status: isLoading ? 'wait' : isError ? 'error' : 'finish',
            icon: isLoading ? <></> : <LoadingOutlined />,
            description: isError ? error?.json.result : data?.result,
          },
        ]}
        className="w-auto mt-4"
      />
    </div>
  );
}
