import {
  Divider,
  Button,
  message,
  Tabs,
  Typography,
  List,
  Select,
  Input,
} from 'antd';
import AntdTable from '@elements/antdTable';
import { useWindowSize } from 'rooks';
import { startOrchestrator } from '@services/orchestrator/start';
import { orchestratorColumns } from '@elements/columns/orchestratorColumns';
import { heartRateZoneColumns } from '@elements/columns/heartRateZoneColumns';
import { paceZoneColumns } from '@elements/columns/paceZoneColumns';
import { useListOrchestrator } from '@services/orchestrator/list';
import { RedoOutlined } from '@ant-design/icons';
import { useProps } from '@hooks/useProps';
import { addUserData } from '@services/user/post';
import getConfig from 'next/config';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { formatPace } from '@utils/formatting';
import useSessionStorageState from '@hooks/useSessionStorageState';
import { convertPaceToSpeed, convertPaceToSeconds } from '@utils/convert';

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

// Helper functions
function calculateHeartRateZones({ threshold }: { threshold: number }) {
  const zonePercentages = {
    'Zone 1: Recovery': [0, 0.85],
    'Zone 2: Aerobic': [0.85, 0.89],
    'Zone 3: Tempo': [0.89, 0.94],
    'Zone 4: SubThreshold': [0.94, 0.99],
    'Zone 5A: SuperThreshold': [0.99, 1.02],
    'Zone 5B: Aerobic Capacity': [1.02, 1.06],
    'Zone 5C: Anaerobic Capacity': [1.06, 2],
  };

  const zones = Object.keys(zonePercentages);

  const zonesWithValues = zones.map((name) => {
    const percentage = zonePercentages[name as keyof typeof zonePercentages];
    let min = threshold * percentage[0];
    let max = threshold * percentage[1];

    if (name === 'Zone 5C: Anaerobic Capacity') {
      max = 255;
    }

    return {
      name,
      min,
      max,
    };
  });

  return zonesWithValues;
}

function calculatePaceZones({ threshold }: { threshold: string }) {
  const zonePercentages = {
    'Zone 1: Recovery': [0.78, 0],
    'Zone 2: Aerobic': [0.78, 0.88],
    'Zone 3: Tempo': [0.88, 0.94],
    'Zone 4: SubThreshold': [0.94, 1.01],
    'Zone 5A: SuperThreshold': [1.01, 1.03],
    'Zone 5B: Aerobic Capacity': [1.04, 1.11],
    'Zone 5C: Anaerobic Capacity': [1.11, 2],
  };
  const speed = convertPaceToSpeed(convertPaceToSeconds(threshold), 'm/s');

  const zones = Object.keys(zonePercentages);

  const zonesWithValues = zones.map((name) => {
    const percentage = zonePercentages[name as keyof typeof zonePercentages];
    let min: number = speed * percentage[0];
    let max: number = speed * percentage[1];

    if (name === 'Zone 5C: Anaerobic Capacity') {
      max = 27.5;
    }

    return {
      name,
      min,
      max,
    };
  });
  return zonesWithValues;
}

export default function Home() {
  // State and constants
  const [tab, setTab] = useSessionStorageState('settingsTab', '1');
  const dimensions = useWindowSize();
  const {
    data: orchestratorListData,
    isLoading: orchestratorListIsLoading,
    refetchData: orchestratorListRefetch,
  } = useListOrchestrator({
    query: { days: 7 },
    enabled: tab === '3',
  });
  const { userSettings } = useProps();
  const router = useRouter();
  const { publicRuntimeConfig } = getConfig();
  const [pace, setPace] = useState<string | undefined>(undefined);
  const paceRegex = /^(\d{1,3}):(\d{1,2})$/;

  // handle click functions
  async function handleSaveAccountSettings() {
    if (pace) {
      userSettings?.overwriteData({
        ...userSettings?.data,
        pace: {
          ...userSettings?.data.pace,
          threshold: convertPaceToSpeed(convertPaceToSeconds(pace), 'm/s'),
        },
      });
    }

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
    const callback_url = `${window.location.origin}/authenticated/callback/strava`;
    const scope = 'profile:read_all,activity:read_all';

    if (!publicRuntimeConfig.NEXT_PUBLIC_STRAVA_CLIENT_ID) {
      message.error('Strava client id not found');
      return;
    }

    // Push the strava authentication page to the router
    router.push(
      `https://www.strava.com/oauth/authorize?client_id=${publicRuntimeConfig.NEXT_PUBLIC_STRAVA_CLIENT_ID}&redirect_uri=${callback_url}&response_type=code&%20response_type=force&scope=${scope}`,
    );
  }

  // Helper functions
  function saveButtonDisabled() {
    if (!userSettings) return true;
    if (userSettings.isLoading) return true;
    if (!userSettings.data) return true;
    if (!userSettings.data.heart_rate) return true;
    if (!userSettings.data.heart_rate.threshold) return true;
    if (!userSettings.data.heart_rate.max) return true;
    if (!userSettings.data.heart_rate.resting) return true;
    if (pace === undefined && !userSettings.data.pace.threshold) return true;
    if (pace !== undefined) {
      if (paceRegex.test(pace)) return false;
      return true;
    }
    return false;
  }

  // Components
  const buttonRow = (
    title: string,
    description: string,
    button: JSX.Element,
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
                disabled={saveButtonDisabled()}
              >
                Save
              </Button>
            </div>
          }
        >
          <List.Item>
            <List.Item.Meta
              title={<Text strong>Theme</Text>}
              description={
                <Select
                  className="w-24"
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
          <List.Item>
            <List.Item.Meta
              title={<Text strong>Gender</Text>}
              description={
                <Select
                  className="w-24"
                  value={userSettings?.data.gender}
                  onChange={(value: any) => {
                    userSettings?.overwriteData({
                      ...userSettings?.data,
                      gender: value,
                    });
                  }}
                  options={[
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                  ]}
                  loading={userSettings?.isLoading}
                />
              }
            />
          </List.Item>
          <List.Item>
            <List.Item.Meta
              title={<Text strong>Heart rate</Text>}
              description={
                <div className="space-y-2">
                  <div className="grid space-y-2 md:space-y-0 md:grid-cols-3 md:grid-rows-1 md:space-x-2">
                    <div className="flex">
                      <Text className="pr-2" type="secondary">
                        Threshold heart rate
                      </Text>
                      <Input
                        placeholder="Threshold"
                        value={userSettings?.data.heart_rate.threshold}
                        onChange={(e) => {
                          userSettings?.overwriteData({
                            ...userSettings?.data,
                            heart_rate: {
                              ...userSettings?.data.heart_rate,
                              threshold: parseInt(e.target.value),
                              zones: calculateHeartRateZones({
                                threshold:
                                  userSettings?.data.heart_rate.threshold,
                              }),
                            },
                          });
                        }}
                        type="number"
                        maxLength={3}
                        minLength={1}
                        disabled={userSettings?.isLoading}
                        addonAfter="bpm"
                        className="w-32 ml-auto md:ml-0"
                      />
                    </div>
                    <div className="flex">
                      <Text className="pr-2" type="secondary">
                        Max heart rate
                      </Text>
                      <Input
                        placeholder="Max"
                        value={userSettings?.data.heart_rate.max}
                        onChange={(e) => {
                          userSettings?.overwriteData({
                            ...userSettings?.data,
                            heart_rate: {
                              ...userSettings?.data.heart_rate,
                              max: parseInt(e.target.value),
                            },
                          });
                        }}
                        type="number"
                        maxLength={3}
                        minLength={1}
                        disabled={userSettings?.isLoading}
                        addonAfter="bpm"
                        className="w-32 ml-auto md:ml-0"
                      />
                    </div>
                    <div className="flex">
                      <Text className="pr-2" type="secondary">
                        Resting heart rate
                      </Text>
                      <Input
                        placeholder="Rest"
                        value={userSettings?.data.heart_rate.resting}
                        onChange={(e) => {
                          userSettings?.overwriteData({
                            ...userSettings?.data,
                            heart_rate: {
                              ...userSettings?.data.heart_rate,
                              resting: parseInt(e.target.value),
                            },
                          });
                        }}
                        type="number"
                        maxLength={3}
                        minLength={1}
                        disabled={userSettings?.isLoading}
                        addonAfter="bpm"
                        className="w-32 ml-auto md:ml-0"
                      />
                    </div>
                  </div>
                  <div>
                    <AntdTable
                      isLoading={userSettings?.isLoading || false}
                      columns={heartRateZoneColumns}
                      data={userSettings?.data.heart_rate.zones}
                      tableProps={{
                        size: 'small',
                      }}
                    />
                  </div>
                </div>
              }
            />
          </List.Item>
          <List.Item>
            <List.Item.Meta
              title={<Text strong>Pace</Text>}
              description={
                <div className="space-y-2">
                  <div className="grid space-y-2 md:space-y-0 md:grid-cols-3 md:grid-rows-1 md:space-x-2">
                    <div className="flex">
                      <Text className="pr-2" type="secondary">
                        Threshold pace
                      </Text>
                      <Input
                        placeholder="Threshold"
                        value={
                          pace !== undefined
                            ? pace
                            : (formatPace(
                                userSettings?.data.pace.threshold,
                                'km',
                                false,
                                false,
                              ) as string)
                        }
                        onChange={(e) => {
                          setPace(e.target.value);
                          userSettings?.overwriteData({
                            ...userSettings?.data,
                            pace: {
                              ...userSettings?.data.pace,
                              zones: calculatePaceZones({
                                threshold: pace || '0:00',
                              }),
                            },
                          });
                        }}
                        type="text"
                        maxLength={6}
                        minLength={1}
                        disabled={userSettings?.isLoading}
                        addonAfter="min/km"
                        className="w-36 ml-auto md:ml-0"
                        status={
                          pace !== undefined
                            ? paceRegex.test(pace)
                              ? undefined
                              : 'error'
                            : undefined
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <AntdTable
                      isLoading={userSettings?.isLoading || false}
                      columns={paceZoneColumns}
                      data={userSettings?.data.pace.zones}
                      tableProps={{
                        size: 'small',
                      }}
                    />
                  </div>
                </div>
              }
            />
          </List.Item>
        </List>
      ),
    },
    {
      key: '2',
      title: 'Preferences',
      label: 'Preferences',
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
                disabled={saveButtonDisabled()}
              >
                Save
              </Button>
            </div>
          }
        >
          <List.Item>
            <List.Item.Meta
              title={<Text strong>Preferred TSS type</Text>}
              description={
                <Select
                  className="w-36"
                  value={userSettings?.data?.preferences?.preferred_tss_type}
                  onChange={(value: any) => {
                    userSettings?.overwriteData({
                      ...userSettings?.data,
                      preferences: {
                        ...userSettings?.data.preferences,
                        preferred_tss_type: value,
                      },
                    });
                  }}
                  options={[
                    { value: 'hr', label: 'HeartRate' },
                    { value: 'pace', label: 'Pace' },
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
      key: '3',
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
                      functionName: 'orch_gather_data',
                    },
                  })
                }
                type="primary"
                size="large"
              >
                Refresh
              </Button>,
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
              </Button>,
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
              </Button>,
            )}
          </div>
        </div>
      ),
    },
    {
      key: '4',
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
          dimensions.innerWidth === null || dimensions.innerWidth > 1024
            ? 'left'
            : 'top'
        }
      />
    </>
  );
}
