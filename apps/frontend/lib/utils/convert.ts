// Speed and pace functions
function convertSpeedToPaceInSeconds(
  metersPerSecond: number | undefined,
  units: Units,
): number {
  // Takes speed in m/s and returns pace the seconds it takes to run 1 km or 1 mile
  if (!metersPerSecond) return 0;
  return units === 'metric'
    ? (1 / metersPerSecond) * 1000
    : (1 / metersPerSecond) * 1609.34;
}

function convertPaceToMetersPerSecond(
  paceInSeconds: number,
  units: Units,
): number {
  // Takes pace in seconds per km or mile and returns speed in m/s
  if (!paceInSeconds) return 0;
  return units === 'metric' ? 1000 / paceInSeconds : 1609.34 / paceInSeconds;
}

function convertPaceToSeconds(pace: string): number {
  // Takes pace in format 'mm:ss' and returns seconds
  const [minutes, seconds = '0'] = pace.split(':');
  const paddedSeconds = seconds.padStart(2, '0');
  return parseInt(minutes, 10) * 60 + parseInt(paddedSeconds, 10);
}

// Distance functions
function convertDistance(meters: number, units: Units): number {
  if (units === 'metric') {
    return meters / 1000;
  } else {
    return meters / 1609.34;
  }
}

// Time functions
function convertSecondsToTimeComponents(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return [hours, minutes, remainingSeconds];
}

function convertSecondsToMinutesAndRemainder(
  seconds: number,
): [number, number] {
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return [minutes, remainder];
}

function convertSpeedToUnitsPerHour(
  metersPerSecond: number | undefined,
  units: Units,
): number {
  if (!metersPerSecond) return 0;
  return units === 'metric' ? metersPerSecond * 3.6 : metersPerSecond * 2.23694;
}

// Export
export {
  convertSpeedToPaceInSeconds,
  convertSecondsToMinutesAndRemainder,
  convertDistance,
  convertPaceToSeconds,
  convertSecondsToTimeComponents,
  convertPaceToMetersPerSecond,
  convertSpeedToUnitsPerHour,
};
