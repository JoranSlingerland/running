import { useEffect, useMemo, useState } from 'react';

import { Icon } from '@elements/icon';
import { useProps } from '@hooks/useProps';
import useSessionStorageState from '@hooks/useSessionStorageState';
import { useActivity } from '@services/data/activity';
import { useStreams } from '@services/data/streams';
import { Chart } from '@ui/chart';
import { chartColorsMap } from '@ui/colors';
import Map from '@ui/map';
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

import { lapColumns } from './columns/lapColumns';
import { splitColumns } from './columns/splitColumns';
import { DataTable } from './shadcnTable';

// Data to implement:

// Stats - Implemented
// Pace min / avg / max
// HR min / avg /max
// Elevation
// calories

// Tables:
// Best efforts
// Format y-axis on whole minutes

const dataSmoothing = 10;

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

  useEffect(() => {
    setActiveCoordinates(
      streams?.latlng.data[activeIndex]
        ? [...streams.latlng.data[activeIndex]].reverse()
        : [0, 0],
    );
  }, [streams, activeIndex]);

  const routeCoordinates = useMemo(() => {
    return streams?.latlng.data.map(([lat, lng]) => [lng, lat]) || [];
  }, [streams?.latlng.data]);

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
    const distance = averageDataPoints(
      streams.distance.data,
      streams.distance.data.length / dataSmoothing,
    );
    const heartrate = averageDataPoints(
      streams.heartrate.data,
      streams.heartrate.data.length / dataSmoothing,
    );
    const cadence = averageDataPoints(
      streams.cadence.data,
      streams.cadence.data.length / dataSmoothing,
    );
    const altitude = averageDataPoints(
      streams.altitude.data,
      streams.altitude.data.length / dataSmoothing,
    );
    const pace = averageDataPoints(
      streams.velocity_smooth.data,
      streams.velocity_smooth.data.length / dataSmoothing,
    );

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

  // Implement skeleton loading
  if (activityIsLoading || streamsIsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex space-x-4">
        <div>
          <Text bold size="large">
            {formatDistance({
              meters: activity?.distance,
              units: userSettings?.data?.preferences.units || 'metric',
            })}
          </Text>
          <Text size="small" type="muted">
            Distance
          </Text>
        </div>
        <div>
          <Text bold size="large">
            {formatPace({
              metersPerSecond: activity?.average_speed,
              units: userSettings?.data?.preferences.units || 'metric',
            })}
          </Text>
          <Text size="small" type="muted">
            Pace
          </Text>
        </div>
        <div>
          <Text bold size="large">
            {formatTime({
              seconds: activity?.moving_time || 0,
            })}
          </Text>
          <Text size="small" type="muted">
            Moving time
          </Text>
        </div>
        <div>
          <Text bold size="large">
            {formatNumber({ number: activity?.average_heartrate, decimals: 0 })}
          </Text>
          <Text size="small" type="muted">
            Heartrate
          </Text>
        </div>
        <div>
          <Text bold size="large">
            {formatNumber({
              number: getPreferredTss(
                userSettings?.data?.preferences.preferred_tss_type,
                activity,
              ).tss,
              decimals: 0,
            })}
          </Text>
          <Text size="small" type="muted">
            Training stress score (TSS)
          </Text>
        </div>
      </div>

      {/* 
        - Hide point when not hovered over chart
        - Add animation to point
      */}
      <Map
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
        ]}
      />
      <div>
        <ToggleGroup
          type="single"
          value={selectedChart}
          onValueChange={(value) => {
            if (value) {
              setSelectedChart(value);
            }
          }}
          className="float-left pb-4"
        >
          <ToggleGroupItem value={'area'}>
            <Icon icon="area_chart" />
          </ToggleGroupItem>
          <ToggleGroupItem value={'bar'}>
            <Icon icon="bar_chart" />
          </ToggleGroupItem>
        </ToggleGroup>
        <div className="h-64">
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
              toggle={{ type: 'single', enabled: true, initial: ['Pace'] }}
              toolTip={{
                enabled: true,
                labelFormatter(label: number) {
                  return formatDistance({
                    meters: label,
                    units: userSettings?.data?.preferences.units || 'metric',
                    decimals: 1,
                  });
                },
              }}
              xAxis={[
                {
                  dataKey: 'Distance',
                  tickFormatter(value: number) {
                    return formatDistance({
                      meters: value,
                      units: userSettings?.data?.preferences.units || 'metric',
                      decimals: 0,
                    });
                  },
                  interval: tickInterval,
                },
              ]}
              yAxis={[
                {
                  tickFormatter(value: number) {
                    return formatPace({
                      metersPerSecond: value,
                      units: userSettings?.data?.preferences.units || 'metric',
                    });
                  },
                  orientation: 'left',
                  dataKey: 'Pace',
                  toolTipFormatDataKeys: ['Pace'],
                  domain([dataMin, dataMax]) {
                    return [Math.max(dataMin - 0.1, 0), dataMax];
                  },
                  allowDataOverflow: true,
                },
                {
                  tickFormatter(value: number) {
                    return formatHeartRate(value);
                  },
                  orientation: 'left',
                  dataKey: 'Heartrate',
                  toolTipFormatDataKeys: ['Heartrate'],
                  domain([dataMin, dataMax]) {
                    return [dataMin - 0.9, dataMax];
                  },
                  allowDataOverflow: true,
                },
                {
                  tickFormatter(value: number) {
                    return `${formatNumber({ number: value, decimals: 0 })} m`;
                  },
                  orientation: 'left',
                  dataKey: 'Altitude',
                  toolTipFormatDataKeys: ['Altitude'],
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
              yAxis={[
                {
                  tickFormatter(value: number) {
                    return formatPace({
                      metersPerSecond: value,
                      units: userSettings?.data?.preferences.units || 'metric',
                    });
                  },
                  orientation: 'left',
                  dataKey: 'Pace',
                  toolTipFormatDataKeys: ['Pace'],
                  domain([dataMin, dataMax]) {
                    return [Math.max(dataMin - 0.1, 0), dataMax];
                  },
                },
                {
                  tickFormatter(value: number) {
                    return formatHeartRate(value);
                  },
                  orientation: 'left',
                  dataKey: 'Heartrate',
                  toolTipFormatDataKeys: ['Heartrate'],
                  domain([dataMin, dataMax]) {
                    return [dataMin - 0.9, dataMax];
                  },
                  // allowDataOverflow: true,
                },
                {
                  tickFormatter(value: number) {
                    return formatDistance({
                      meters: value,
                      units: userSettings?.data?.preferences.units || 'metric',
                      decimals: 1,
                    });
                  },
                  orientation: 'left',
                  dataKey: 'Distance',
                  toolTipFormatDataKeys: ['Distance'],
                  domain([dataMin, dataMax]) {
                    return [0.9 * dataMin, 1.1 * dataMax];
                  },
                  // allowDataOverflow: true,
                },
              ]}
            />
          )}
        </div>
      </div>
      <div className="pt-16">
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
        </ToggleGroup>
        {selectedTable == 'laps' && (
          <DataTable
            isLoading={activityIsLoading}
            columns={lapColumns(
              userSettings?.data?.preferences.units || 'metric',
            )}
            data={activity?.laps || []}
          />
        )}
        {selectedTable == 'splits' && (
          <DataTable
            isLoading={activityIsLoading}
            columns={splitColumns(
              userSettings?.data?.preferences.units || 'metric',
            )}
            data={activity?.splits_metric || []}
          />
        )}
      </div>
    </div>
  );
}
