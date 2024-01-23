import { useRouter } from 'next/router';
import { toast } from 'sonner';

import { orchestratorColumns } from '@elements/columns/orchestratorColumns';
import { AccountForm } from '@elements/forms/Account';
import { PreferencesForm } from '@elements/forms/preferences';
import { DataTable } from '@elements/shadcnTable';
import useSessionStorageState from '@hooks/useSessionStorageState';
import { useListOrchestrator } from '@services/orchestrator/list';
import { startOrchestrator } from '@services/orchestrator/start';
import { Button } from '@ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ui/tabs';
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

export default function Home() {
  // State and constants
  const [tab, setTab] = useSessionStorageState('settingsTab', 'account');
  const {
    data: orchestratorListData,
    isLoading: orchestratorListIsLoading,
    refetchData: orchestratorListRefetch,
  } = useListOrchestrator({
    query: { days: 7 },
    enabled: tab === 'orchestrations',
  });
  const router = useRouter();

  // handle click functions
  function handleStravaAuthentication() {
    const callback_url = `${window.location.origin}/authenticated/callback/strava`;
    const scope = 'profile:read_all,activity:read_all';

    if (!process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID) {
      toast.error('Strava client id not found');
      return;
    }

    // Push the strava authentication page to the router
    router.push(
      `https://www.strava.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID}&redirect_uri=${callback_url}&response_type=code&%20response_type=force&scope=${scope}`,
    );
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

  const Actions = () => (
    <div className="flex flex-col items-center">
      <div className="w-full px-2 columns-1 space-y-4">
        <div className="flex items-center justify-center">
          <Title variant="h3">Safe changes</Title>
        </div>
        {buttonRow(
          'Refresh data',
          'This will Refresh all the data from scratch.',
          () =>
            startOrchestrator({
              query: {
                functionName: 'orch_gather_data',
              },
            }),
          'Refresh',
        )}
        {buttonRow(
          'Clear local storage',
          'This will clear all cached data in the local storage of the browser.',
          () => handleSessionStorageClearClick(),
          'Clear',
        )}
        {buttonRow(
          'Authenticate Strava',
          'This will authenticate strava again or for the first time.',
          () => handleStravaAuthentication(),
          'Authenticate',
        )}
      </div>
    </div>
  );
  return (
    <>
      <Title variant="h2" className="flex items-center justify-center p-5">
        Settings
      </Title>
      <div className="mx-auto max-w-screen-xl w-full px-4">
        <Tabs onValueChange={(value) => setTab(value)} value={tab}>
          <div className="flex mt-2 justify-center ">
            <TabsList>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
              <TabsTrigger value="orchestrations">Orchestrations</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent className="px-2" value="account">
            <AccountForm />
          </TabsContent>
          <TabsContent className="px-2" value="preferences">
            <PreferencesForm />
          </TabsContent>
          <TabsContent className="px-2" value="actions">
            <Actions />
          </TabsContent>
          <TabsContent className="px-2" value="orchestrations">
            <DataTable
              isLoading={orchestratorListIsLoading}
              columns={orchestratorColumns}
              data={orchestratorListData || []}
              pagination={true}
              refetch={orchestratorListRefetch}
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
