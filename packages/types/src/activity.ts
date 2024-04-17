interface Activity {
  _id: string;
  achievement_count: number;
  athlete_count: number;
  average_speed: number;
  average_watts: number | undefined;
  device_watts: boolean;
  distance: number;
  elapsed_time: number;
  elev_high: number;
  elev_low: number;
  end_latlng: [number, number];
  external_id: string;
  gear_id: null | string;
  kilojoules: number | null;
  manual: boolean;
  map: {
    id: string;
    polyline: null | string;
    summary_polyline: string;
  };
  max_speed: number;
  max_watts: number | null | undefined;
  moving_time: number;
  name: string;
  sport_type: string;
  start_date: string;
  start_date_local: string;
  start_latlng: [number, number];
  timezone: string;
  total_elevation_gain: number;
  trainer: boolean;
  type: string;
  upload_id: number;
  upload_id_str: string;
  weighted_average_watts: number | null | undefined;
  workout_type: null | number;
  best_efforts: null | BestEfforts[] | undefined;
  calories: null | number;
  description: null | string | undefined;
  device_name: null | string;
  embed_token: null | string;
  laps: Laps[] | undefined | null;
  splits_metric: null | Split[] | undefined;
  utc_offset: number;
  location_city: null | string;
  location_state: null | string;
  location_country: null | string;
  pr_count: number;
  has_heartrate: boolean;
  average_heartrate: number;
  max_heartrate: number;
  average_cadence: number;
  perceived_exertion: null | number | undefined;
  userId: string;
  full_data: boolean;
  hr_reserve: null | number;
  pace_reserve: null | number;
  hr_trimp: null | number;
  pace_trimp: null | number;
  hr_max_percentage: null | number;
  vo2max_estimate: {
    workout_vo2_max: null | number;
    vo2_max_percentage: null | number;
    estimated_vo2_max: null | number;
  };
  user_input: {
    include_in_vo2max_estimate: boolean;
    tags: string[];
    notes: string;
    race: boolean;
    workout_type: string;
  };
  streams?: null | streams;
}

export interface BestEfforts {
  id: number;
  resource_state: number;
  name: string;
  elapsed_time: number;
  moving_time: number;
  start_date: string;
  start_date_local: string;
  distance: number;
  pr_rank: null;
  achievements: [];
  start_index: number;
  end_index: number;
}

export interface Laps {
  activity: {
    id: number;
  };
  athlete: {
    id: number;
  };
  average_cadence: number;
  average_speed: number;
  distance: number;
  elapsed_time: number;
  end_index: number;
  id: number;
  lap_index: number;
  max_speed: number;
  moving_time: number;
  name: string;
  pace_zone: number;
  split: number;
  start_date: string;
  start_date_local: string;
  start_index: number;
  total_elevation_gain: number;
  average_heartrate: number | null;
  hr_reserve: number | null;
  pace_reserve: number | null;
  hr_trimp: number | null;
  pace_trimp: number | null;
}

export interface Split {
  average_speed: number;
  distance: number;
  elapsed_time: number;
  elevation_difference: number;
  moving_time: number;
  pace_zone: number;
  split: number;
  average_heartrate: number;
  average_grade_adjusted_speed: number;
}

interface stream<T> {
  original_size: number;
  resolution: string;
  series_type: string;
  type: null | string;
  data: T[];
}

interface streams {
  moving?: stream<boolean>;
  latlng?: stream<[number, number]>;
  velocity_smooth?: stream<number>;
  grade_smooth?: stream<number>;
  cadence?: stream<number>;
  distance?: stream<number>;
  altitude?: stream<number>;
  heartrate?: stream<number>;
  time?: stream<number>;
}

export type { Activity };
