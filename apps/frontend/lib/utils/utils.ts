import { Streams } from '@repo/strava';

const isNotNullOrZero = (value: unknown) =>
  value !== null && value !== undefined && value !== 0;

function averageDataPoints(data: number[] | undefined, numPoints: number) {
  if (!data) {
    return [];
  }

  const step = Math.ceil(data.length / numPoints);
  const averagedData = [];

  for (let i = 0; i < data.length; i += step) {
    const chunk = data.slice(i, i + step);
    const average = chunk.reduce((sum, value) => sum + value, 0) / chunk.length;
    averagedData.push(average);
  }

  return averagedData;
}

function calculateTickInterval(
  streams: Streams | undefined,
  dataSmoothing: number,
  distance = 1000,
) {
  if (!streams || !streams.distance) {
    return 1;
  }

  const data = streams?.distance.data;

  const totalDistance = data[data.length - 1] || 0;
  const totalTicks = data.length / dataSmoothing || 1;
  const distancePerTick = totalDistance / totalTicks;
  const ticksPerKm = distance / distancePerTick;
  const ticksThatWillBeDisplayed = totalTicks / ticksPerKm;

  return Math.round(
    ticksThatWillBeDisplayed > 20 ? totalTicks / 20 : ticksPerKm,
  );
}

export { isNotNullOrZero, averageDataPoints, calculateTickInterval };
