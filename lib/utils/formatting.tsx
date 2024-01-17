import { Icon } from '@elements/icon';
import {
  convertSecondsToMinutesAndRemainder,
  convertSpeedToPaceInSeconds,
  convertSecondsToTimeComponents,
  convertDistance,
} from './convert';

// Helper functions
function unitMapper(units: Units, type: 'distance' | 'speed' | 'pace') {
  let result;

  switch (type) {
    case 'distance':
      result = units === 'metric' ? 'km' : 'mi';
      break;
    case 'speed':
      result = units === 'metric' ? 'km/h' : 'mph';
      break;
    case 'pace':
      result = units === 'metric' ? 'min/km' : 'min/mi';
      break;
  }

  return result;
}

// Distance functions
function formatDistance({
  meters,
  units,
  decimals = 2,
  addUnits = true,
}: {
  meters: number | undefined;
  units: Units;
  decimals?: number;
  addUnits?: boolean;
}) {
  meters = meters || 0;
  const value = convertDistance(meters, units);

  let formattedValue = value.toFixed(decimals);
  if (addUnits) {
    formattedValue += ` ${unitMapper(units, 'distance')}`;
  }

  return formattedValue;
}

// Time functions
function formatTime({
  seconds,
  addSeconds = true,
  addMinutes = true,
  addHours = true,
}: {
  seconds: number;
  addSeconds?: boolean;
  addMinutes?: boolean;
  addHours?: boolean;
}) {
  const [hours, minutes, remainingSeconds] =
    convertSecondsToTimeComponents(seconds);

  let formattedTime = '';

  if (addHours) {
    const paddedHours = hours.toString().padStart(2, '0');
    formattedTime += `${paddedHours}:`;
  }

  if (addMinutes) {
    const paddedMinutes = minutes.toString().padStart(2, '0');
    formattedTime += `${paddedMinutes}:`;
  }

  if (addSeconds) {
    const paddedSeconds = remainingSeconds.toString().padStart(2, '0');
    formattedTime += `${paddedSeconds}`;
  }

  // Remove trailing colon if seconds are not included
  if (!addSeconds) {
    formattedTime = formattedTime.slice(0, -1);
  }

  return formattedTime;
}

function formatDateTime(date: string) {
  return new Date(date).toLocaleString();
}

function formatMinute(seconds: number) {
  const [minutes, remainingSeconds] =
    convertSecondsToMinutesAndRemainder(seconds);
  const formattedTime = `${minutes
    .toString()
    .padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;

  return formattedTime;
}

// Pace and speed functions
function formatPace({
  metersPerSecond,
  units,
  addUnit = true,
}: {
  metersPerSecond: number | undefined;
  units: Units;
  addUnit?: boolean;
}) {
  let formattedValue = '';

  formattedValue = formatMinute(
    convertSpeedToPaceInSeconds(metersPerSecond, units),
  );
  if (addUnit) {
    formattedValue += `${formattedValue} ${unitMapper(units, 'pace')}`;
  }

  return formattedValue;
}

// Misc functions
function formatHeartRate(heartRate: number, addUnit = true) {
  const value = heartRate.toFixed(0);
  const formattedValue = addUnit ? `${value} bpm` : value;
  return formattedValue;
}

function formatNumber({
  number,
  decimals = 2,
}: {
  number: number | undefined;
  decimals?: number;
}) {
  if (number === undefined) {
    return '';
  }
  const formattedNumber = number.toFixed(decimals);
  return formattedNumber;
}

const sportIcon = (sport: string): JSX.Element => {
  switch (sport) {
    case 'Run':
      return <Icon icon="directions_run" />;
    case 'Ride':
      return <Icon icon="directions_bike" />;
    case 'Swim':
      return <Icon icon="pool" />;
    case 'Walk':
      return <Icon icon="directions_walk" />;
    case 'Hike':
      return <Icon icon="terrain" />;
    case 'Workout':
      return <Icon icon="fitness_center" />;
    case 'WeightTraining':
      return <Icon icon="fitness_center" />;
    case 'Yoga':
      return <Icon icon="self_improvement" />;
    case 'VirtualRide':
      return <Icon icon="directions_bike" />;
    case 'VirtualRun':
      return <Icon icon="directions_run" />;
    default:
      return <></>;
  }
};

export {
  formatDistance,
  formatTime,
  formatPace,
  formatHeartRate,
  formatNumber,
  sportIcon,
  formatDateTime,
  unitMapper,
};
