import { Activity } from '@repo/types';
import { useEffect, useMemo, useState } from 'react';

import { lapColumns } from '@elements//columns/lapColumns';
import { splitColumns } from '@elements//columns/splitColumns';
import { DataTable } from '@elements//shadcnTable';
import { bestEffortColumns } from '@elements/columns/bestEffortsColumns';
import { Icon } from '@elements/icon';
import { useProps } from '@hooks/useProps';
import useSessionStorageState from '@hooks/useSessionStorageState';
import { useActivity } from '@services/data/activity';
import { useStreams } from '@services/data/streams';
import { Chart } from '@ui/chart';
import { chartColorsMap } from '@ui/colors';
import Map from '@ui/map';
import { Skeleton } from '@ui/skeleton';
import { ToggleGroup, ToggleGroupItem } from '@ui/toggle-group';
import { Text } from '@ui/typography';
import {
  formatDistance,
  formatHeartRate,
  formatNumber,
  formatPace,
  formatTime,
} from '@utils/formatting';
import { getPreferredTss } from '@utils/tss/helpers';
import { averageDataPoints, calculateTickInterval } from '@utils/utils';
const dataSmoothing = 10;
interface HeaderStatProps {
  value: string;
  label: string;
  isLoading: boolean;
}

const HeaderStat: React.FC<HeaderStatProps> = ({ value, label, isLoading }) => {
  return (
    <div>
      {isLoading ? (
        <Skeleton className="h-6 w-16" />
      ) : (
        <Text bold size="large">
          {value}
        </Text>
      )}

      <Text size="small" type="muted">
        {label}
      </Text>
    </div>
  );
};

type TableProps = {
  isLoading: boolean;
  selectedTable: string;
  setSelectedTable: (value: string) => void;
  units: Units;
  laps: Activity['laps'];
  splits: Activity['splits_metric'];
  bestEfforts: Activity['best_efforts'];
};

const Tables: React.FC<TableProps> = ({
  isLoading,
  selectedTable,
  setSelectedTable,
  units,
  laps,
  splits,
  bestEfforts,
}) => {
  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-center pb-2">
          <Skeleton className="h-12 w-48" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <>
      <ToggleGroup
        type="single"
        value={selectedTable}
        onValueChange={(value) => {
          if (value) {
            setSelectedTable(value);
          }
        }}
      >
        <ToggleGroupItem value={'laps'}>Laps</ToggleGroupItem>
        <ToggleGroupItem value={'splits'}>Splits</ToggleGroupItem>
        <ToggleGroupItem value={'best_efforts'}>Best efforts</ToggleGroupItem>
      </ToggleGroup>

      {selectedTable == 'laps' && (
        <DataTable
          isLoading={isLoading}
          columns={lapColumns(units)}
          data={laps || []}
        />
      )}
      {selectedTable == 'splits' && (
        <DataTable
          isLoading={isLoading}
          columns={splitColumns(units || 'metric')}
          data={splits || []}
        />
      )}
      {selectedTable == 'best_efforts' && (
        <DataTable
          isLoading={isLoading}
          columns={bestEffortColumns(units || 'metric')}
          data={bestEfforts || []}
        />
      )}
    </>
  );
};

const formatters = (units: Units) => [
  {
    formatter(value: number) {
      return formatPace({
        metersPerSecond: value,
        units,
      });
    },
    dataKeys: ['Pace'],
  },
  {
    formatter(value: number) {
      return formatHeartRate(value);
    },
    dataKeys: ['Heartrate'],
  },
  {
    formatter(value: number) {
      return `${formatNumber({
        number: value,
        decimals: 0,
      })} m`;
    },
    dataKeys: ['Altitude'],
  },
  {
    formatter(value: number) {
      return formatDistance({
        meters: value,
        units,
        decimals: value < 950 ? 1 : 0,
      });
    },
    dataKeys: ['Distance'],
  },
];

export function ActivityBox({ activityId }: { activityId: string | 'latest' }) {
  const { userSettings } = useProps();
  const { data: activity, isLoading: activityIsLoading } = useActivity({
    query: { id: activityId },
  });
  const { data: streams, isLoading: streamsIsLoading } = useStreams({
    query: { id: activityId },
  });
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeCoordinates, setActiveCoordinates] = useState([0, 0]);
  const [selectedTable, setSelectedTable] = useSessionStorageState(
    'activitySelectedTable',
    'laps',
  );
  const [selectedChart, setSelectedChart] = useSessionStorageState(
    'activitySelectedChart',
    'area',
  );
  const [renderMap, setRenderMap] = useState(true);
  const [renderChart, setRenderChart] = useState(true);

  const routeCoordinates = useMemo(() => {
    return streams?.latlng?.data.map(([lat, lng]) => [lng, lat]) || [];
  }, [streams?.latlng?.data]);

  const finishCoordinates = useMemo(() => {
    return activity?.end_latlng?.slice().reverse() || [];
  }, [activity?.end_latlng]);

  const startCoordinates = useMemo(() => {
    return activity?.start_latlng?.slice().reverse() || [];
  }, [activity?.start_latlng]);

  const lapsData = useMemo(() => {
    if (!activity?.laps) {
      return [];
    }
    return activity.laps.map((lap) => ({
      Distance: lap.distance,
      Pace: lap.average_speed,
      Heartrate: lap.average_heartrate,
      Split: lap.split,
    }));
  }, [activity?.laps]);

  const bestEffortData = useMemo(() => {
    if (!activity?.best_efforts) {
      return [];
    }
    return activity.best_efforts.map((effort) => ({
      Name: effort.name,
      Pace: effort.distance / effort.moving_time,
    }));
  }, [activity?.best_efforts]);

  const splitsData = useMemo(() => {
    if (!activity?.splits_metric) {
      return [];
    }
    return activity.splits_metric.map((lap) => ({
      Distance: lap.distance,
      Pace: lap.average_speed,
      Heartrate: lap.average_heartrate,
      Split: lap.split,
    }));
  }, [activity?.splits_metric]);

  const chartData = useMemo(() => {
    if (!streams) {
      return [];
    }
    let distance: number[] = [];
    let heartrate: number[] = [];
    let cadence: number[] = [];
    let altitude: number[] = [];
    let pace: number[] = [];

    if (streams.distance?.data) {
      distance = averageDataPoints(
        streams.distance.data,
        streams.distance.data.length / dataSmoothing,
      );
    }

    if (streams.heartrate?.data) {
      heartrate = averageDataPoints(
        streams.heartrate.data,
        streams.heartrate.data.length / dataSmoothing,
      );
    }

    if (streams.cadence?.data) {
      cadence = averageDataPoints(
        streams.cadence.data,
        streams.cadence.data.length / dataSmoothing,
      );
    }

    if (streams.altitude?.data) {
      altitude = averageDataPoints(
        streams.altitude.data,
        streams.altitude.data.length / dataSmoothing,
      );
    }

    if (streams.velocity_smooth?.data) {
      pace = averageDataPoints(
        streams.velocity_smooth.data,
        streams.velocity_smooth.data.length / dataSmoothing,
      );
    }

    return distance.map((value, index) => ({
      Distance: value,
      Heartrate: heartrate[index],
      Cadence: cadence[index],
      Altitude: altitude[index],
      Pace: pace[index],
    }));
  }, [streams]);

  const tickInterval = useMemo(() => {
    return calculateTickInterval(streams, dataSmoothing);
  }, [streams]);

  const isLoading = activityIsLoading || streamsIsLoading;

  useEffect(() => {
    if ((!chartData || chartData.length === 0) && !streamsIsLoading) {
      setRenderChart(false);
    }
  }, [chartData, streamsIsLoading]);

  useEffect(() => {
    if (!streams?.latlng && !streamsIsLoading) {
      setRenderMap(false);
    }
  }, [streams, streamsIsLoading]);

  useEffect(() => {
    setActiveCoordinates(
      streams?.latlng?.data[activeIndex]
        ? [...streams.latlng.data[activeIndex]].reverse()
        : [0, 0],
    );
  }, [streams, activeIndex]);

  return (
    <div className="flex flex-col space-y-4">
      <div className="grid grid-cols-2 grid-rows-3 p-2 sm:grid-cols-3 sm:grid-rows-2 md:flex md:space-x-4">
        <HeaderStat
          value={formatDistance({
            meters: activity?.distance,
            units: userSettings?.data?.preferences.units || 'metric',
          })}
          label="Distance"
          isLoading={isLoading}
        />
        <HeaderStat
          value={formatPace({
            metersPerSecond: activity?.average_speed,
            units: userSettings?.data?.preferences.units || 'metric',
          })}
          label="Pace"
          isLoading={isLoading}
        />
        <HeaderStat
          value={formatTime({
            seconds: activity?.moving_time || 0,
          })}
          label="Moving time"
          isLoading={isLoading}
        />
        <HeaderStat
          value={formatNumber({
            number: activity?.average_heartrate,
            decimals: 0,
          })}
          label="Heartrate"
          isLoading={isLoading}
        />
        <HeaderStat
          value={formatNumber({
            number: getPreferredTss(
              userSettings?.data?.preferences.preferred_tss_type,
              activity,
            ).tss,
            decimals: 0,
          })}
          label="Training stress score (TSS)"
          isLoading={isLoading}
        />
      </div>
      {renderMap && (
        <Map
          isLoading={isLoading}
          boundingBox={{
            type: 'LineString',
            coordinates: routeCoordinates,
          }}
          className="h-96"
          sources={[
            {
              id: 'route',
              source: {
                type: 'geojson',
                data: {
                  type: 'Feature',
                  properties: {},
                  geometry: {
                    type: 'LineString',
                    coordinates: routeCoordinates,
                  },
                },
              },
            },
            {
              id: 'point',
              source: {
                type: 'geojson',
                data: {
                  type: 'Feature',
                  properties: {},
                  geometry: {
                    type: 'Point',
                    coordinates: activeCoordinates,
                  },
                },
              },
            },
            {
              id: 'finish',
              source: {
                type: 'geojson',
                data: {
                  type: 'Feature',
                  properties: {},
                  geometry: {
                    type: 'Point',
                    coordinates: finishCoordinates,
                  },
                },
              },
            },
            {
              id: 'start',
              source: {
                type: 'geojson',
                data: {
                  type: 'Feature',
                  properties: {},
                  geometry: {
                    type: 'Point',
                    coordinates: startCoordinates,
                  },
                },
              },
            },
          ]}
          layers={[
            {
              layer: {
                id: 'route',
                type: 'line',
                source: 'route',
                layout: {
                  'line-join': 'round',
                  'line-cap': 'round',
                },
                paint: {
                  'line-color': chartColorsMap['blue'],
                  'line-width': 2,
                },
              },
            },
            {
              layer: {
                id: 'point',
                type: 'circle',
                source: 'point',
                paint: {
                  'circle-radius': 4,
                  'circle-color': chartColorsMap['orange'],
                },
              },
            },
            {
              layer: {
                id: 'finish',
                type: 'circle',
                source: 'finish',
                paint: {
                  'circle-radius': 4,
                  'circle-color': chartColorsMap['red'],
                  'circle-stroke-width': 2,
                  'circle-stroke-color': '#fff',
                },
              },
            },
            {
              layer: {
                id: 'start',
                type: 'circle',
                source: 'start',
                paint: {
                  'circle-radius': 4,
                  'circle-color': chartColorsMap['green'],
                  'circle-stroke-width': 2,
                  'circle-stroke-color': '#fff',
                  'circle-opacity': 1,
                },
              },
            },
          ]}
        />
      )}
      {renderChart && (
        <div onMouseLeave={() => setActiveIndex(0)}>
          {isLoading ? (
            <>
              <Skeleton className="h-64 w-full" />
            </>
          ) : (
            <>
              <ToggleGroup
                type="single"
                value={selectedChart}
                onValueChange={(value) => {
                  if (value) {
                    setSelectedChart(value);
                  }
                }}
                className="pb-4 sm:float-left"
              >
                <ToggleGroupItem value={'area'}>
                  <Icon icon="area_chart" />
                </ToggleGroupItem>
                <ToggleGroupItem value={'bar'}>
                  <Icon icon="bar_chart" />
                </ToggleGroupItem>
              </ToggleGroup>
              <div className="h-64 pb-16">
                {selectedChart == 'area' && (
                  <Chart
                    data={chartData || []}
                    dataIndexCallback={(value) =>
                      setActiveIndex(value * dataSmoothing)
                    }
                    isLoading={streamsIsLoading}
                    areas={[
                      {
                        dataKey: 'Pace',
                        useGradient: true,
                      },
                      {
                        dataKey: 'Heartrate',
                        useGradient: true,
                      },
                      {
                        dataKey: 'Altitude',
                        useGradient: true,
                      },
                    ]}
                    toggle={{
                      type: 'single',
                      enabled: true,
                      initial: ['Pace'],
                    }}
                    toolTip={{
                      enabled: true,
                      labelFormatter(label: number) {
                        return formatDistance({
                          meters: label,
                          units:
                            userSettings?.data?.preferences.units || 'metric',
                          decimals: 1,
                        });
                      },
                    }}
                    formatters={formatters(
                      userSettings?.data?.preferences.units || 'metric',
                    )}
                    xAxis={[
                      {
                        dataKey: 'Distance',
                        interval: tickInterval,
                      },
                    ]}
                    yAxis={[
                      {
                        orientation: 'left',
                        dataKey: 'Pace',
                        domain([dataMin, dataMax]) {
                          return [Math.max(dataMin - 0.1, 0), dataMax];
                        },
                        allowDataOverflow: true,
                      },
                      {
                        orientation: 'left',
                        dataKey: 'Heartrate',
                        domain([dataMin, dataMax]) {
                          return [dataMin - 0.9, dataMax];
                        },
                        allowDataOverflow: true,
                      },
                      {
                        orientation: 'left',
                        dataKey: 'Altitude',
                        domain([dataMin, dataMax]) {
                          return [
                            dataMin < 0 ? 1.1 * dataMin : 0.9 * dataMin,
                            dataMax < 0 ? 0.9 * dataMax : 1.1 * dataMax,
                          ];
                        },
                        allowDataOverflow: true,
                      },
                    ]}
                  />
                )}
                {selectedChart == 'bar' && (
                  <>
                    {(selectedTable == 'laps' || selectedTable == 'splits') && (
                      <Chart
                        data={selectedTable == 'laps' ? lapsData : splitsData}
                        isLoading={activityIsLoading}
                        bars={[
                          {
                            dataKey: 'Pace',
                            stackId: 'a',
                            useGradient: true,
                          },
                          {
                            dataKey: 'Heartrate',
                            stackId: 'a',
                            useGradient: true,
                          },
                          {
                            dataKey: 'Distance',
                            stackId: 'a',
                            useGradient: true,
                          },
                        ]}
                        toggle={{
                          type: 'single',
                          enabled: true,
                          initial: ['Pace'],
                        }}
                        toolTip={{
                          enabled: true,
                          hideLabel: true,
                        }}
                        formatters={formatters(
                          userSettings?.data?.preferences.units || 'metric',
                        )}
                        yAxis={[
                          {
                            orientation: 'left',
                            dataKey: 'Pace',
                            domain([dataMin, dataMax]) {
                              return [Math.max(dataMin - 0.1, 0), dataMax];
                            },
                          },
                          {
                            orientation: 'left',
                            dataKey: 'Heartrate',
                            domain([dataMin, dataMax]) {
                              return [dataMin - 0.9, dataMax];
                            },
                          },
                          {
                            orientation: 'left',
                            dataKey: 'Distance',
                            domain([dataMin, dataMax]) {
                              return [0.9 * dataMin, 1.1 * dataMax];
                            },
                          },
                        ]}
                      />
                    )}
                    {selectedTable == 'best_efforts' && (
                      <Chart
                        data={bestEffortData}
                        isLoading={activityIsLoading}
                        bars={[
                          {
                            dataKey: 'Pace',
                            stackId: 'a',
                            useGradient: true,
                          },
                        ]}
                        toggle={{
                          type: 'single',
                          enabled: true,
                          initial: ['Pace'],
                        }}
                        toolTip={{
                          enabled: true,
                        }}
                        formatters={formatters(
                          userSettings?.data?.preferences.units || 'metric',
                        )}
                        yAxis={[
                          {
                            orientation: 'left',
                            dataKey: 'Pace',
                            domain([dataMin, dataMax]) {
                              return [Math.max(dataMin - 0.1, 0), dataMax];
                            },
                          },
                        ]}
                        xAxis={[
                          {
                            dataKey: 'Name',
                          },
                        ]}
                      />
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      )}
      <Tables
        isLoading={isLoading}
        selectedTable={selectedTable}
        setSelectedTable={setSelectedTable}
        units={userSettings?.data?.preferences.units || 'metric'}
        laps={activity?.laps}
        splits={activity?.splits_metric}
        bestEfforts={activity?.best_efforts}
      />
    </div>
  );
}
