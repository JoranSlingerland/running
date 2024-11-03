export type AbsoluteTimes = 'week' | 'month' | 'year';
export type RelativeTimes = '7d' | '30d' | '365d';
type TimeFrames = AbsoluteTimes | RelativeTimes;

export type ActivityStats = {
  [key in 'distance' | 'duration' | 'activityCount']: {
    previousValue: number;
    currentValue: number;
    percentageDifference: number;
    absoluteDifference: number;
  };
};

export type SportStats = {
  [key in string | 'totals']?: ActivityStats;
};

export type AbsoluteStatistics = {
  [key in AbsoluteTimes]: SportStats;
};

export type RelativeStatistics = {
  [key in RelativeTimes]: SportStats;
};

export type Statistics = {
  [key in TimeFrames]: SportStats;
};
