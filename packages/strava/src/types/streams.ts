import { StravaAuthentication } from './authentication';

export type Stream = {
  type: StreamType;
  original_size: number;
  resolution: 'low' | 'medium' | 'high';
  series_type: 'time' | 'distance';
  data: number[];
};

export type StreamType =
  | 'time'
  | 'distance'
  | 'latlng'
  | 'altitude'
  | 'velocity_smooth'
  | 'heartrate'
  | 'cadence'
  | 'watts'
  | 'temp'
  | 'moving'
  | 'grade_smooth';

export type StreamQuery = {
  auth: StravaAuthentication;
  id: number;
  keys: StreamType[];
};

export type Streams = {
  [key in StreamType]: Stream;
};
