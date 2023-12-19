import { Typography } from 'antd';

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

function formatPace(metersPerSecond: number, unit: string) {
  switch (unit) {
    case 'm':
      return <Text>{formatMinute(1000 / metersPerSecond)}MIN/KM</Text>;
    case 'km':
      return <Text>{formatMinute(1000 / metersPerSecond)}MIN/KM</Text>;
    case 'mi':
      return <Text>{formatMinute(1609 / metersPerSecond)}MIN/MI</Text>;
    case 'ft':
      return <Text>{formatMinute(0.3048 / metersPerSecond)}MIN/FT</Text>;
  }
}

function formatMinute(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return (
    <Text>
      {minutes.toString().padStart(2, '0')}:
      {remainingSeconds.toString().padStart(2, '0')}
    </Text>
  );
}

export { formatDistance, formatTime, formatSpeed, formatPace };
