/**
 * Represents a goal.
 * @property {string} id - Unique identifier for the goal
 * @property {'week' | 'month' | 'year'} timeFrame - The time frame for the goal
 * @property {'run' | 'ride'} sport - The sport for which the goal is set
 * @property {'time' | 'distance'} type - The type of the goal, either time-based or distance-based
 * @property {number} value - The value of the goal. For 'time', this is in seconds. For 'distance', this is in meters.
 */
export type Goal = {
  _id: string | null;
  timeFrame: 'week' | 'month' | 'year';
  sport: 'run' | 'ride';
  type: 'time' | 'distance';
  userId: string;
  value: number;
  version: number;
};
