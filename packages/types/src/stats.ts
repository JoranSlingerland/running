export type TimeFrame = 'week' | 'month' | 'year';

export type DistanceStat = {
  previousDistance: number;
  currentDistance: number;
  percentageDifference: number;
  absoluteDifference: number;
};

export type DistanceStats = Partial<Record<TimeFrame, DistanceStat>>;
