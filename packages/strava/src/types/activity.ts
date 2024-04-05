export type SummaryActivity = {
  resource_state: number;
  athlete: Athlete;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
  sport_type: string;
  workout_type: null | number;
  id: number;
  start_date: string;
  start_date_local: string;
  timezone: string;
  utc_offset: number;
  location_city: null | string;
  location_state: null | string;
  location_country: null | string;
  achievement_count: number;
  kudos_count: number;
  comment_count: number;
  athlete_count: number;
  photo_count: number;
  map: SummaryMap;
  trainer: boolean;
  commute: boolean;
  manual: boolean;
  private: boolean;
  visibility: string;
  flagged: boolean;
  gear_id: null | string;
  start_latlng: [number, number];
  end_latlng: [number, number];
  average_speed: number;
  max_speed: number;
  average_cadence: number;
  average_watts?: number;
  weighted_average_watts?: number;
  max_watts?: number;
  device_watts: boolean;
  has_heartrate: boolean;
  average_heartrate: number;
  max_heartrate: number;
  heartrate_opt_out: boolean;
  display_hide_heartrate_option: boolean;
  elev_high: number;
  elev_low: number;
  upload_id: number;
  upload_id_str: string;
  external_id: string;
  from_accepted_tag: boolean;
  pr_count: number;
  total_photo_count: number;
  has_kudoed: boolean;
  suffer_score: number;
};

export type DetailedActivity = SummaryActivity & {
  map: DetailedMap;
  description: undefined | string;
  calories: number;
  perceived_exertion: undefined;
  prefer_perceived_exertion: null;
  kilojoules: number;
  segment_efforts: SegmentEffort[];
  splits_metric: Splits[];
  splits_standard: Splits[];
  laps: Laps[];
  best_efforts: BestEfforts[];
  photos: {
    primary: undefined | string;
    count: number;
  };
  stats_visibility: StatsVisibility[];
  hide_from_home: boolean;
  device_name: string;
  embed_token: string;
  similar_activities: {
    effort_count: number;
    average_speed: number;
    min_average_speed: number;
    mid_average_speed: number;
    max_average_speed: number;
    pr_rank: undefined;
    frequency_milestone: undefined;
    trend: {
      speeds: number[];
      current_activity_index: number;
      min_speed: number;
      mid_speed: number;
      max_speed: number;
      direction: number;
    };
    resource_state: number;
  };
  available_zones: string[];
};

type Athlete = {
  id: number;
  resource_state: number;
};

type SummaryMap = {
  id: string;
  summary_polyline: string;
  resource_state: number;
};

type DetailedMap = SummaryMap & {
  polyline: string;
};

type SegmentEffort = {
  id: number;
  resource_state: number;
  name: string;
  activity: {
    id: number;
    visibility: string;
    resource_state: number;
  };
  athlete: Athlete;
  elapsed_time: number;
  moving_time: number;
  start_date: string;
  start_date_local: string;
  distance: number;
  start_index: number;
  end_index: number;
  average_cadence: number;
  average_watts?: number;
  weighted_average_watts?: number;
  max_watts?: number;
  device_watts: boolean;
  average_heartrate: number;
  max_heartrate: number;
  segment: Segment;
  pr_rank: null;
  achievements: [];
  visibility: string;
  kom_rank: null;
  hidden: boolean;
};

type Segment = {
  id: number;
  resource_state: number;
  name: string;
  activity_type: string;
  distance: number;
  average_grade: number;
  maximum_grade: number;
  elevation_high: number;
  elevation_low: number;
  start_latlng: [number, number];
  end_latlng: [number, number];
  elevation_profile: null;
  climb_category: number;
  city: string;
  state: string;
  country: string;
  private: boolean;
  hazardous: boolean;
  starred: boolean;
};

type Splits = {
  distance: number;
  elapsed_time: number;
  elevation_difference: number;
  moving_time: number;
  split: number;
  average_speed: number;
  average_grade_adjusted_speed: number;
  average_heartrate: number;
  pace_zone: number;
};

type Laps = {
  id: number;
  resource_state: number;
  name: string;
  activity: {
    id: number;
    visibility: string;
    resource_state: number;
  };
  athlete: Athlete;
  elapsed_time: number;
  moving_time: number;
  start_date: string;
  start_date_local: string;
  distance: number;
  average_speed: number;
  max_speed: number;
  lap_index: number;
  split: number;
  start_index: number;
  end_index: number;
  total_elevation_gain: number;
  average_cadence: number;
  pace_zone: number;
};

type BestEfforts = {
  id: number;
  resource_state: number;
  name: string;
  activity: {
    id: number;
    visibility: string;
    resource_state: number;
  };
  athlete: Athlete;
  elapsed_time: number;
  moving_time: number;
  start_date: string;
  start_date_local: string;
  distance: number;
  pr_rank: null;
  achievements: [];
  start_index: number;
  end_index: number;
};

type StatsVisibility = {
  type: string;
  visibility: string;
};
