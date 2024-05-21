export type AbsoluteTimes = 'week' | 'month' | 'year';
export type RelativeTimes = '7d' | '30d' | '365d';

export type ActivityStats = {
  [key in 'distance' | 'duration' | 'activityCount']: {
    previousValue: number;
    currentValue: number;
    percentageDifference: number;
    absoluteDifference: number;
  };
};

export type Statistics = Partial<
  Record<AbsoluteTimes | RelativeTimes, ActivityStats>
>;
