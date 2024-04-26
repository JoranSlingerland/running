import dayjs from 'dayjs';
import { Hourglass, Loader2, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';

import { AccountForm } from '@elements/forms/Account';
import { PreferencesForm } from '@elements/forms/preferences';
import useSessionStorageState from '@hooks/useSessionStorageState';
import { useIsAdmin } from '@services/auth/isAdmin';
import { enhanceStravaData } from '@services/backend/admin/enhance';
import { useRateLimitStatus } from '@services/backend/admin/ratelimit';
import { useServiceStatus } from '@services/backend/admin/servicestatus/get';
import { resetServiceStatus } from '@services/backend/admin/servicestatus/reset';
import { gatherStravaData } from '@services/backend/strava/gather';
import { getStravaUrl } from '@services/env/stravaurl';
import { Badge } from '@ui/badge';
import { Button } from '@ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@ui/tooltip';
import { Text, Title } from '@ui/typography';

// handle click functions
function handleSessionStorageClearClick() {
  sessionStorage.clear();
  if (sessionStorage.length === 0) {
    toast.success('Local storage cleared');
  } else {
    toast.error('Something went wrong :(');
  }
}

async function handleStravaAuthentication(
  router: ReturnType<typeof useRouter>,
) {
  const callbackUrl = `${window.location.origin}/authenticated/callback/strava`;
  const scope = 'profile:read_all,activity:read_all';

  const url = await getStravaUrl({ callbackUrl, scope });

  if (!url) {
    toast.error('Error getting Strava authentication URL');
    return;
  }
  router.push(url);
}

// Components
const buttonRow = (
  title: string,
  description: string,
  onClick: () => void,
  buttonText: string,
) => (
  <div className="grid grid-cols-2 grid-rows-2">
    <Title variant="h4">{title}</Title>
    <div className="row-span-2 ml-auto mr-0">
      <Button variant="secondary" onClick={onClick}>
        {buttonText}
      </Button>
    </div>
    <Text>{description}</Text>
  </div>
);

const getBadgeVariant = (
  apiCallCount: number | undefined,
  apiCallLimit: number | undefined,
) => {
  if (!apiCallCount || !apiCallLimit) {
    return 'processing';
  }

  const apiCallRatio = apiCallCount / apiCallLimit;

  if (apiCallRatio > 0.8) {
    return 'error';
  } else if (apiCallRatio > 0.5) {
    return 'warning';
  } else {
    return 'success';
  }
};

const Actions = (router: ReturnType<typeof useRouter>) => (
  <div className="flex flex-col items-center">
    <div className="w-full columns-1 space-y-4 px-2">
      {buttonRow(
        'Get activities',
        'This will get all new activities from Strava ',
        () => gatherStravaData(),
        'Refresh',
      )}
      {buttonRow(
        'Clear local storage',
        'This will clear all cached data in the local storage of the browser',
        () => handleSessionStorageClearClick,
        'Clear',
      )}
      {buttonRow(
        'Authenticate Strava',
        'This will authenticate strava again or for the first time',
        () => handleStravaAuthentication(router),
        'Authenticate',
      )}
    </div>
  </div>
);

function Admin() {
  const { data: serviceStatusData, isLoading: serviceStatusIsLoading } =
    useServiceStatus({
      query: { serviceName: 'StravaDataEnhancementService' },
    });
  const { data: rateLimitData, isLoading: rateLimitIsLoading } =
    useRateLimitStatus({});

  return (
    <div className="grid grid-cols-1 gap-4 pt-4 md:grid-cols-2 xl:grid-cols-3">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Service status</CardTitle>
          <CardDescription>Strava Data Enhancement Service</CardDescription>
        </CardHeader>
        <CardContent>
          <Text>
            {serviceStatusIsLoading ? (
              <Badge variant="processing">
                <Loader2 className="mr-1 size-4 animate-spin" />
                Loading
              </Badge>
            ) : serviceStatusData?.isRunning ? (
              <Badge variant="processing" className="space-x-2">
                <Loader2 className="mr-1 size-4 animate-spin" />
                Running
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-6"
                        disabled={serviceStatusIsLoading}
                        onClick={() =>
                          resetServiceStatus({
                            query: {
                              serviceName: 'StravaDataEnhancementService',
                            },
                          })
                        }
                      >
                        <RotateCcw size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent sideOffset={4}>
                      <Text>
                        The service is currently running. Click the button to
                        reset the service status.
                      </Text>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Badge>
            ) : (
              <Badge className="text-xs">
                <Hourglass className="mr-1 size-4" />
                Waiting
              </Badge>
            )}
          </Text>
        </CardContent>
      </Card>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Strava Rate limits</CardTitle>
        </CardHeader>
        <CardContent>
          <Text>
            {rateLimitIsLoading ? (
              <Badge variant="processing">
                <Loader2 className="mr-1 size-4 animate-spin" />
                Loading
              </Badge>
            ) : (
              <div className="grid grid-cols-1 space-y-2">
                <div className="grid grid-cols-3">
                  <Text className="col-span-2">15 minute: </Text>
                  <div>
                    <Badge
                      variant={getBadgeVariant(
                        rateLimitData?.apiCallCount15Min,
                        rateLimitData?.apiCallLimit15Min,
                      )}
                    >
                      {rateLimitData?.apiCallCount15Min}/
                      {rateLimitData?.apiCallLimit15Min}
                    </Badge>
                  </div>
                  <Text className="col-span-3" type="muted" size="small">
                    Last reset:{' '}
                    {dayjs(rateLimitData?.lastReset15Min).format(
                      'YYYY-MM-DD HH:mm:ss',
                    )}
                  </Text>
                </div>
                <div className="grid grid-cols-3">
                  <Text className="col-span-2">Daily: </Text>
                  <div>
                    <Badge
                      variant={getBadgeVariant(
                        rateLimitData?.apiCallCountDaily,
                        rateLimitData?.apiCallLimitDaily,
                      )}
                    >
                      {rateLimitData?.apiCallCountDaily}/
                      {rateLimitData?.apiCallLimitDaily}
                    </Badge>
                  </div>
                  <Text className="col-span-3" type="muted" size="small">
                    Last reset:{' '}
                    {dayjs(rateLimitData?.lastResetDaily).format(
                      'YYYY-MM-DD HH:mm:ss',
                    )}
                  </Text>
                </div>
              </div>
            )}
          </Text>
        </CardContent>
      </Card>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Data Enhancement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Text>Click the button below to enhance Strava data.</Text>
          <Button onClick={() => enhanceStravaData()}>Enhance Data</Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Settings() {
  const [tab, setTab] = useSessionStorageState('settingsTab', 'account');
  const router = useRouter();
  const { data: isAdminData } = useIsAdmin({
    enabled: true,
  });

  return (
    <>
      <Title variant="h2" className="flex items-center justify-center p-5">
        Settings
      </Title>
      <div className="mx-auto w-full max-w-screen-xl px-4">
        <Tabs onValueChange={(value) => setTab(value)} value={tab}>
          <div className="mt-2 flex justify-center ">
            <TabsList>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
              {isAdminData?.isAdmin && (
                <TabsTrigger value="admin">Admin</TabsTrigger>
              )}
            </TabsList>
          </div>
          <TabsContent className="px-2" value="account">
            <AccountForm />
          </TabsContent>
          <TabsContent className="px-2" value="preferences">
            <PreferencesForm />
          </TabsContent>
          <TabsContent className="px-2" value="actions">
            {Actions(router)}
          </TabsContent>
          {isAdminData?.isAdmin && (
            <TabsContent className="px-2" value="admin">
              <Admin />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </>
  );
}
