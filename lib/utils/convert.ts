function convertSpeedToPaceInSeconds(
  metersPerSecond: number | undefined,
  unit: 'km' | 'mi' = 'km',
): number {
  if (!metersPerSecond) return 0;
  return unit === 'km'
    ? (1 / metersPerSecond) * 1000
    : (1 / metersPerSecond) * 1609.34;
}

function convertSecondsToMinutes(seconds: number): [number, number] {
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return [minutes, remainder];
}

function convertDistance(
  meters: number,
  unit: 'm' | 'km' | 'mi' | 'ft' = 'km',
): number {
  switch (unit) {
    case 'm':
      return meters;
    case 'km':
      return meters / 1000;
    case 'mi':
      return meters / 1609.34;
    case 'ft':
      return meters / 0.3048;
    default:
      return meters;
  }
}

function convertPaceToSpeed(
  paceInSeconds: number,
  unit: 'km/h' | 'mi/h' | 'm/s' = 'km/h',
): number {
  if (!paceInSeconds) return 0;
  switch (unit) {
    case 'km/h':
      return 3600 / paceInSeconds;
    case 'mi/h':
      return 3600 / paceInSeconds / 1.60934;
    case 'm/s':
      return (1 / paceInSeconds) * 1000;
    default:
      return (1 / paceInSeconds) * 1000;
  }
}

function convertTime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return [hours, minutes, remainingSeconds];
}

function convertPaceToSeconds(pace: string): number {
  const [minutes, seconds = '0'] = pace.split(':');
  const paddedSeconds = seconds.padStart(2, '0');
  return parseInt(minutes, 10) * 60 + parseInt(paddedSeconds, 10);
}

function convertMStoMinPerKM(metersPerSecond: number | undefined): string {
  const paceInSeconds = convertSpeedToPaceInSeconds(metersPerSecond);
  const [minutes, seconds] = convertSecondsToMinutes(paceInSeconds);
  const paddedSeconds = seconds.toString().padStart(2, '0');
  return `${minutes}:${paddedSeconds}`;
}

export {
  convertSpeedToPaceInSeconds,
  convertSecondsToMinutes,
  convertDistance,
  convertPaceToSpeed,
  convertPaceToSeconds,
  convertTime,
  convertMStoMinPerKM,
};
