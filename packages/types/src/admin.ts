export type RateLimitStatus = {
  _id: string;
  apiCallCount15Min: number;
  apiCallCountDaily: number;
  apiCallLimit15Min: number;
  apiCallLimitDaily: number;
  lastReset15Min: string;
  lastResetDaily: string;
  version: number;
};

export type IsRunningStatus = {
  _id: string;
  isRunning: boolean;
  lastUpdated: string;
  version: number;
};
