import { StravaAuthentication } from './authentication';

export type Stream = {
  original_size: number;
  resolution: 'low' | 'medium' | 'high';
  series_type: 'time' | 'distance';
};

interface TimeStream extends Stream {
  type: 'time';
  data: number[];
}

interface DistanceStream extends Stream {
  type: 'distance';
  data: number[];
}

interface LatLngStream extends Stream {
  type: 'latlng';
  data: [number, number][];
}

interface AltitudeStream extends Stream {
  type: 'altitude';
  data: number[];
}

interface VelocitySmoothStream extends Stream {
  type: 'velocity_smooth';
  data: number[];
}

interface HeartrateStream extends Stream {
  type: 'heartrate';
  data: number[];
}

interface CadenceStream extends Stream {
  type: 'cadence';
  data: number[];
}

interface WattsStream extends Stream {
  type: 'watts';
  data: number[];
}

interface TempStream extends Stream {
  type: 'temp';
  data: number[];
}

interface MovingStream extends Stream {
  type: 'moving';
  data: boolean[];
}

interface GradeSmoothStream extends Stream {
  type: 'grade_smooth';
  data: number[];
}

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

export type StravaStreams = {
  time: TimeStream;
  distance: DistanceStream;
  latlng: LatLngStream;
  altitude: AltitudeStream;
  velocity_smooth: VelocitySmoothStream;
  heartrate: HeartrateStream;
  cadence: CadenceStream;
  watts: WattsStream;
  temp: TempStream;
  moving: MovingStream;
  grade_smooth: GradeSmoothStream;
};

export type StreamQuery = {
  auth: StravaAuthentication;
  id: number | string;
  keys: StreamType[];
};
