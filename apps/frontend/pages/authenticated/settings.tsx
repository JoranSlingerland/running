import { useRouter } from 'next/router';
import { toast } from 'sonner';

import { AccountForm } from '@elements/forms/Account';
import { PreferencesForm } from '@elements/forms/preferences';
import useSessionStorageState from '@hooks/useSessionStorageState';
import { gatherStravaData } from '@services/backend/strava';
import { getStravaUrl } from '@services/env/stravaurl';
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

export default function Settings() {
  const [tab, setTab] = useSessionStorageState('settingsTab', 'account');
  const router = useRouter();

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
        </Tabs>
      </div>
    </>
  );
}
