export type TimeFrame = 'week' | 'month' | 'year';

export type ActivityStats = {
  [key in 'distance' | 'duration' | 'activityCount']: {
    previousValue: number;
    currentValue: number;
    percentageDifference: number;
    absoluteDifference: number;
  };
};

export type Statistics = Partial<Record<TimeFrame, ActivityStats>>;
