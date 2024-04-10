import { Streams } from '@repo/strava';
import bbox from '@turf/bbox';
import { useEffect, useMemo, useState } from 'react';
import Map, { Layer, Source } from 'react-map-gl';
import WebMercatorViewport from 'viewport-mercator-project';

import { useProps } from '@hooks/useProps';
import { useActivity } from '@services/data/activity';
import { useStreams } from '@services/data/streams';
import { Chart } from '@ui/chart';
import { chartColorsMap } from '@ui/colors';
import { formatDistance, formatPace } from '@utils/formatting';

import 'mapbox-gl/dist/mapbox-gl.css';

// Data to implement:

// Map should interact with the charts - Implemented

// Charts - Implemented
// Pace
// HeartRate
// Altitude

// Tables:
// Splits
// Laps

// Stats:
// Distance
// Time
// Pace min / avg / max
// HR min / avg /max
// TSS

// Speed
// Elevation
// calories
// elapsed time
// weather

// Components:
// Best efforts

function calculateTickInterval(streams: Streams | undefined) {
  const totalDistance =
    streams?.distance.data[streams?.distance.data.length - 1] || 0;
  const totalTicks = streams?.distance.original_size || 1;
  const distancePerTick = totalDistance / totalTicks;
  const ticksPerKm = 1000 / distancePerTick;
  const ticksThatWillBeDisplayed = totalTicks / ticksPerKm;

  return Math.round(
    ticksThatWillBeDisplayed > 20 ? totalTicks / 20 : ticksPerKm,
  );
}

const viewport = new WebMercatorViewport({ width: 1100, height: 300 });

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

  useEffect(() => {
    const animation = window.requestAnimationFrame(() =>
      setActiveCoordinates(
        streams?.latlng.data[activeIndex]
          ? [...streams.latlng.data[activeIndex]].reverse()
          : [0, 0],
      ),
    );
    return () => window.cancelAnimationFrame(animation);
  }, [streams, activeIndex]);

  const routeCoordinates = useMemo(() => {
    return streams?.latlng.data.map(([lat, lng]) => [lng, lat]) || [];
  }, [streams?.latlng.data]);

  const routeBbox = useMemo(() => {
    return bbox({ type: 'LineString', coordinates: routeCoordinates });
  }, [routeCoordinates]);

  const chartData = useMemo(() => {
    return (
      streams?.distance.data.map((value, index) => ({
        Distance: value,
        Heartrate: streams.heartrate.data[index],
        Cadence: streams.cadence.data[index],
        Altitude: streams.altitude.data[index],
        Pace: streams.velocity_smooth.data[index],
      })) || []
    );
  }, [streams]);
  console.log(chartData);
  const tickInterval = useMemo(() => {
    return calculateTickInterval(streams);
  }, [streams]);

  if (activityIsLoading || streamsIsLoading) {
    return <div>Loading...</div>;
  }

  const { longitude, latitude, zoom } = viewport.fitBounds([
    [routeBbox[0], routeBbox[1]],
    [routeBbox[2], routeBbox[3]],
  ]);

  return (
    <div className="flex flex-col space-y-2">
      {/* 
        - Move to separate component
        - switch to different map library
        - Hide point when not hovered over chart
        - Add zoom buttons
      */}
      <div className="h-96">
        <Map
          mapLib={import('mapbox-gl')}
          initialViewState={{
            longitude,
            latitude,
            zoom,
          }}
          mapStyle="mapbox://styles/mapbox/streets-v9"
          mapboxAccessToken={process.env.NEXT_PUBLIC_MapboxAccessToken}
        >
          <Source
            id="route"
            type="geojson"
            data={{
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: routeCoordinates,
              },
            }}
          />
          <Layer
            id="route"
            type="line"
            source="route"
            layout={{
              'line-join': 'round',
              'line-cap': 'round',
            }}
            paint={{
              'line-color': chartColorsMap['blue'],
              'line-width': 2,
            }}
          />
          <Source
            id="point"
            type="geojson"
            data={{
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'Point',
                coordinates: activeCoordinates,
              },
            }}
          />
          <Layer
            id="point"
            type="circle"
            source="point"
            paint={{
              'circle-radius': 4,
              'circle-color': chartColorsMap['orange'],
            }}
          />
        </Map>
      </div>
      <div className="h-64">
        <Chart
          data={chartData || []}
          dataIndexCallback={(value) => setActiveIndex(value)}
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
          toggle={{ type: 'single', enabled: true, initial: ['Heartrate'] }}
          toolTip={{
            enabled: true,
            formatter(value: number) {
              return `${value} bpm`;
            },
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
            },
            {
              tickFormatter(value: number) {
                return `${value} bpm`;
              },
              orientation: 'left',
              dataKey: 'Heartrate',
              toolTipFormatDataKeys: ['Heartrate'],
            },
            {
              tickFormatter(value: number) {
                return `${value} m`;
              },
              orientation: 'left',
              dataKey: 'Altitude',
              toolTipFormatDataKeys: ['Altitude'],
            },
          ]}
        />
      </div>
    </div>
  );
}
