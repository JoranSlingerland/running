/**
 * Calculate HR reserve
 *
 * @param avgWorkoutHr - The average heart rate of the activity.
 * @param restingHr - The resting heart rate of the individual.
 * @param maxHr - The maximum heart rate of the individual.
 * @returns The calculated HR reserve.
 *
 * References
 * - https://fellrnr.com/wiki/Heart_Rate_Reserve
 */
function calculateHrReserve(
  avgWorkoutHr: number,
  restingHr: number,
  maxHr: number,
): number {
  return (avgWorkoutHr - restingHr) / (maxHr - restingHr);
}

/**
 * Calculate Pace reserve
 *
 * @param avgWorkoutPace - The average pace of the activity.
 * @param thresholdPace - The threshold pace of the individual.
 * @returns The calculated Pace reserve.
 */
function calculatePaceReserve(
  avgWorkoutPace: number,
  thresholdPace: number,
): number {
  return avgWorkoutPace / thresholdPace;
}

/**
 * Calculate HR max percentage
 *
 * @param avgWorkoutHr - The average heart rate of the activity.
 * @param maxHr - The maximum heart rate of the individual.
 * @returns The calculated HR max percentage.
 */
function calculateHrMaxPercentage(avgWorkoutHr: number, maxHr: number): number {
  return avgWorkoutHr / maxHr;
}

/**
 * Convert HR max percentage to VO2 max percentage.
 *
 * @param hrMaxPercentage - The average heart rate of the activity as a percentage of the maximum heart rate.
 * @returns The calculated VO2 max percentage, or null if the calculated percentage is not between 0 and 1.
 *
 * References
 * - https://journals.lww.com/acsm-msse/Fulltext/2007/02000/Relationship_between__HRmax,__HR_Reserve,.18.aspx
 * - https://www.ncsf.org/pdf/ceu/relationship_between_percent_hr_max_and_percent_vo2_max.pdf
 * - https://fellrnr.com/wiki/Heart_Rate_Reserve
 */
function calculateVo2MaxPercentage(hrMaxPercentage: number): number | null {
  const vo2MaxPercentage = (hrMaxPercentage - 0.26) / 0.706;

  if (vo2MaxPercentage >= 0 && vo2MaxPercentage <= 1) {
    return vo2MaxPercentage;
  } else {
    return null;
  }
}

const genderConstants = {
  male: 1.92,
  female: 1.67,
};

/**
 * Calculate HR TRIMP.
 *
 * @param duration - The duration of the activity. This can be in minutes or seconds, depending on the value of durationInSeconds.
 * @param hrReserve - The reserve heart rate of the activity as a percentage.
 * @param gender - The gender of the individual. This should be either "male" or "female".
 * @param durationInSeconds - A boolean value indicating whether the duration is in seconds. If false, the duration is assumed to be in minutes (default is false).
 * @returns The calculated HR TRIMP.
 *
 * References
 * - https://fellrnr.com/wiki/TRIMP
 */
function calculateHrTrimp(
  duration: number,
  hrReserve: number,
  gender: 'male' | 'female',
  durationInSeconds: boolean = false,
): number {
  if (durationInSeconds) {
    duration = duration / 60;
  }

  return (
    duration * hrReserve * 0.64 * Math.exp(genderConstants[gender] * hrReserve)
  );
}

/**
 * Calculate Pace TRIMP.
 *
 * @param duration - The duration of the activity. This can be in minutes or seconds, depending on the value of durationInSeconds.
 * @param paceReserve - The reserve pace of the activity as a percentage of the threshold pace.
 * @param gender - The gender of the individual. This should be either "male" or "female".
 * @param durationInSeconds - A boolean value indicating whether the duration is in seconds. If false, the duration is assumed to be in minutes (default is false).
 * @returns The calculated Pace TRIMP.
 *
 * References
 * - https://fellrnr.com/wiki/TRIMP
 */
function calculatePaceTrimp(
  duration: number,
  paceReserve: number,
  gender: 'male' | 'female',
  durationInSeconds: boolean = false,
): number {
  if (durationInSeconds) {
    duration = duration / 60;
  }

  return (
    duration *
    paceReserve *
    0.64 *
    Math.exp(genderConstants[gender] * paceReserve)
  );
}

/**
 * Calculate VO2 Max.
 *
 * Calculations are still in progress and this is only a rough estimate.
 *
 * @param distance - The distance of the activity in meters.
 * @param duration - The duration of the activity. This can be in minutes or seconds, depending on the value of durationInSeconds.
 * @param hrMaxPercentage - The average heart rate of the activity as a percentage of the maximum heart rate.
 * @param durationInSeconds - A boolean value indicating whether the duration is in seconds. If false, the duration is assumed to be in minutes (default is false).
 * @returns A dictionary containing the workout VO2 Max, the VO2 Max percentage, and the estimated VO2 Max.
 *
 * References
 * - https://www.omnicalculator.com/sports/vo2-max-runners
 */
function calculateVo2MaxEstimate(
  distance: number,
  duration: number,
  hrMaxPercentage: number,
  durationInSeconds: boolean = false,
): {
  workoutVo2Max: number;
  vo2MaxPercentage: number | null;
  estimatedVo2Max: number | null;
} {
  if (durationInSeconds) {
    duration = duration / 60;
  }

  const metersPerMinute = distance / duration;

  const unadjustedVo2MaxForWorkout =
    -4.6 + 0.182258 * metersPerMinute + 0.000104 * Math.pow(metersPerMinute, 2);
  const vo2MaxPercentageForWorkout =
    0.8 +
    0.1894393 * Math.exp(-0.012778 * duration) +
    0.2989558 * Math.exp(-0.1932605 * duration);
  const workoutVo2Max = unadjustedVo2MaxForWorkout / vo2MaxPercentageForWorkout;

  const vo2MaxPercentage = calculateVo2MaxPercentage(hrMaxPercentage);
  const estimatedVo2Max =
    vo2MaxPercentage !== null ? workoutVo2Max / vo2MaxPercentage : null;

  return {
    workoutVo2Max,
    vo2MaxPercentage,
    estimatedVo2Max,
  };
}

export {
  calculateHrReserve,
  calculatePaceReserve,
  calculateHrMaxPercentage,
  calculateVo2MaxPercentage,
  calculateHrTrimp,
  calculatePaceTrimp,
  calculateVo2MaxEstimate,
};
