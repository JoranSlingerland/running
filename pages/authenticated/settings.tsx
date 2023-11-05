import {
  Divider,
  Button,
  message,
  Tabs,
  Typography,
  List,
  Input,
  Select,
} from 'antd';
import useWindowDimensions from '../../components/hooks/useWindowDimensions';
import AntdTable from '../../components/elements/antdTable';
import useSessionStorageState from '../../components/hooks/useSessionStorageState';
import { startOrchestrator } from '../../components/services/orchestrator/start';
import { orchestratorColumns } from '../../components/elements/columns/orchestratorColumns';
import { useListOrchestrator } from '../../components/services/orchestrator/list';
import { RedoOutlined } from '@ant-design/icons';
import { useProps } from '../../components/hooks/useProps';
import { addUserData } from '../../components/services/user/post';

const { Text, Title } = Typography;

// handle click functions
function handleSessionStorageClearClick() {
  sessionStorage.clear();
  if (sessionStorage.length === 0) {
    message.success('Local storage cleared');
  } else {
    message.error('Something went wrong :(');
  }
}

export default function Home() {
  const [tab, setTab] = useSessionStorageState('settingsTab', '1');
  const dimensions = useWindowDimensions();
  const {
    data: orchestratorListData,
    isLoading: orchestratorListIsLoading,
    refetchData: orchestratorListRefetch,
  } = useListOrchestrator({
    query: { days: 7 },
    enabled: tab === '3',
  });
  const { userSettings } = useProps();

  // handle click functions
  async function handleSaveAccountSettings() {
    console.log(userSettings);
    if (userSettings?.data) {
      await addUserData({
        body: userSettings?.data,
      }).then(() => {
        userSettings?.refetchData({
          cacheOnly: true,
        });
      });
    }
  }

  function handleStravaAuthentication() {
    const callback_url = `${window.location.origin}/api/callback/strava`;
    const client_id = userSettings?.data.strava_authentication.client_id;
    const scope = 'profile:read_all,activity:read_all';

    const stravaAuthenticationWindow = window.open(
      `https://www.strava.com/oauth/authorize?client_id=${client_id}&redirect_uri=${callback_url}&response_type=code&%20response_type=force&scope=${scope}`,
      'Strava Authentication',
      'width=500,height=500'
    );
    const stravaAuthenticationInterval = setInterval(() => {
      if (stravaAuthenticationWindow?.closed) {
        clearInterval(stravaAuthenticationInterval);
        userSettings?.refetchData({
          cacheOnly: true,
        });
      }
    }, 100);
  }

  // constants
  const buttonRow = (
    title: string,
    description: string,
    button: JSX.Element
  ) => (
    <div className="grid grid-cols-2 grid-rows-2">
      <Title level={4}>{title}</Title>
      <div className="row-span-2 ml-auto mr-0">{button}</div>
      <Text>{description}</Text>
    </div>
  );

  const items = [
    {
      key: '1',
      Title: 'Account',
      label: 'Account',
      children: (
        <List
          size="large"
          loading={userSettings?.isLoading}
          footer={
            <div className="flex flex-col items-center">
              <Button
                type="primary"
                onClick={() => {
                  handleSaveAccountSettings();
                }}
                disabled={userSettings?.isLoading}
              >
                Save
              </Button>
            </div>
          }
        >
          <List.Item>
            <List.Item.Meta
              title={<Text strong>Strava Client ID</Text>}
              description={
                <Input
                  className="w-72 sm:w-96"
                  value={userSettings?.data.strava_authentication.client_id}
                  onChange={(e: any) => {
                    userSettings?.overwriteData({
                      ...userSettings?.data,
                      strava_authentication: {
                        ...userSettings?.data.strava_authentication,
                        client_id: e.target.value,
                      },
                    });
                  }}
                  size="small"
                />
              }
            />
          </List.Item>
          <List.Item>
            <List.Item.Meta
              title={<Text strong>Strava Client Secret</Text>}
              description={
                <Input.Password
                  className="w-72 sm:w-96"
                  value={userSettings?.data.strava_authentication.client_secret}
                  onChange={(e) => {
                    userSettings?.overwriteData({
                      ...userSettings?.data,
                      strava_authentication: {
                        ...userSettings?.data.strava_authentication,
                        client_secret: e.target.value,
                      },
                    });
                  }}
                  size="small"
                />
              }
            />
          </List.Item>
          <List.Item>
            <List.Item.Meta
              title={<Text strong>Theme</Text>}
              description={
                <Select
                  value={userSettings?.data.dark_mode}
                  onChange={(value: any) => {
                    userSettings?.overwriteData({
                      ...userSettings?.data,
                      dark_mode: value,
                    });
                  }}
                  options={[
                    { value: 'system', label: 'System' },
                    { value: 'dark', label: 'Dark' },
                    { value: 'light', label: 'Light' },
                  ]}
                  loading={userSettings?.isLoading}
                />
              }
            />
          </List.Item>
        </List>
      ),
    },
    {
      key: '2',
      title: 'Actions',
      label: 'Actions',
      children: (
        <div className="flex flex-col items-center">
          <div className="w-full px-2 columns-1">
            <div className="flex items-center justify-center">
              <Title level={3}>Safe changes</Title>
            </div>
            {buttonRow(
              'Refresh data',
              'This will Refresh all the data from scratch.',
              <Button
                onClick={() =>
                  startOrchestrator({
                    query: {
                      functionName: 'orchestrator_gather_data',
                    },
                  })
                }
                type="primary"
                size="large"
              >
                Refresh
              </Button>
            )}
            <Divider plain></Divider>
            {buttonRow(
              'Clear local storage',
              'This will clear all cached data in the local storage of the browser.',
              <Button
                onClick={() => handleSessionStorageClearClick()}
                type="primary"
                size="large"
              >
                Clear
              </Button>
            )}
            <Divider plain></Divider>
            {buttonRow(
              'Authenticate Strava',
              'This will authenticate strava again or for the first time.',
              <Button
                onClick={() => handleStravaAuthentication()}
                type="primary"
                size="large"
              >
                Authenticate
              </Button>
            )}
          </div>
        </div>
      ),
    },
    {
      key: '3',
      title: 'Orchestrations',
      label: 'Orchestrations',
      children: (
        <div>
          <AntdTable
            isLoading={orchestratorListIsLoading}
            columns={orchestratorColumns}
            data={orchestratorListData}
            tableProps={{
              pagination: {
                pageSize: 10,
                size: 'small',
                hideOnSinglePage: true,
                className: 'm-0',
              },
            }}
            caption={
              <div className="flex flex-row-reverse">
                <Button
                  icon={<RedoOutlined />}
                  type="text"
                  shape="circle"
                  onClick={() => {
                    orchestratorListRefetch();
                  }}
                ></Button>
              </div>
            }
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <Title className="flex items-center justify-center p-5" level={1}>
        Settings
      </Title>
      <Divider plain></Divider>
      <Tabs
        type="line"
        activeKey={tab}
        onChange={(key: any) => setTab(key)}
        items={items}
        tabPosition={
          dimensions.width === null || dimensions.width > 768 ? 'left' : 'top'
        }
      />
    </>
  );
}
