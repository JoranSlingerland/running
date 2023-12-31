import { Typography } from 'antd';
import {
  convertSecondsToMinutes,
  convertSpeedToPaceInSeconds,
} from './convert';

const { Text } = Typography;

function formatDistance(distance: number, unit: string, decimals = 2) {
  switch (unit) {
    case 'm':
      return <Text>{distance.toFixed(decimals)}M</Text>;
    case 'km':
      return <Text>{(distance / 1000).toFixed(decimals)}KM</Text>;
    case 'mi':
      return <Text>{(distance / 1609).toFixed(decimals)}MI</Text>;
    case 'ft':
      return <Text>{(distance / 0.3048).toFixed(decimals)}FT</Text>;
    default:
      return <Text>{distance.toFixed(decimals)}M</Text>;
  }
}

function formatTime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return (
    <Text>
      {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:
      {remainingSeconds.toString().padStart(2, '0')}
    </Text>
  );
}

function formatSpeed(metersPerSecond: number, unit: string, decimals = 2) {
  switch (unit) {
    case 'm':
      return <Text>{(metersPerSecond * 3.6).toFixed(decimals)}KM/H</Text>;
    case 'km':
      return <Text>{(metersPerSecond * 3.6).toFixed(decimals)}KM/H</Text>;
    case 'mi':
      return <Text>{(metersPerSecond * 2.237).toFixed(decimals)}MPH</Text>;
    case 'ft':
      return <Text>{(metersPerSecond * 3.281).toFixed(decimals)}FT/S</Text>;
  }
}

function formatPace(
  metersPerSecond: number | undefined,
  unit: 'km' | 'mi' = 'km',
  addUnit = true,
  wrapInText = true,
) {
  const minutes = formatMinute(
    convertSpeedToPaceInSeconds(metersPerSecond, unit),
    addUnit,
    false,
  );
  return wrapInText ? <Text>{minutes}</Text> : minutes;
}

function formatMinute(seconds: number, addUnit = true, wrapInText = true) {
  const [minutes, remainingSeconds] = convertSecondsToMinutes(seconds);
  const formattedTime = `${minutes
    .toString()
    .padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}${
    addUnit ? ' MIN/KM' : ''
  }`;

  return wrapInText ? <Text>{formattedTime}</Text> : formattedTime;
}

function formatHeartRate(heartRate: number) {
  return <Text>{Math.floor(heartRate)} BPM</Text>;
}

export { formatDistance, formatTime, formatSpeed, formatPace, formatHeartRate };
