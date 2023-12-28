import { cachedFetch } from '../../utils/api';
import { useFetch } from '../../hooks/useFetch';

interface GetActivitiesQuery {
  startDate?: string;
  endDate?: string;
}

interface Activity {
  id: string;
  achievement_count: number;
  athlete_count: number;
  average_speed: number;
  average_watts: number;
  device_watts: boolean;
  distance: number;
  elapsed_time: number;
  elev_high: number;
  elev_low: number;
  end_latlng: [number, number];
  external_id: string;
  gear_id: null | string;
  kilojoules: number;
  manual: boolean;
  map: {
    id: string;
    polyline: null | string;
    summary_polyline: string;
  };
  max_speed: number;
  max_watts: number;
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
  weighted_average_watts: number;
  workout_type: null | number;
  best_efforts: null | BestEfforts[];
  calories: null | number;
  description: null | string;
  device_name: null | string;
  embed_token: null | string;
  gear: null;
  laps: null | Laps[];
  splits_metric: null | Splits[];
  guid: null | string;
  utc_offset: number;
  location_city: null | string;
  location_state: null | string;
  location_country: null | string;
  start_latitude: null | string;
  start_longitude: null | string;
  pr_count: number;
  has_heartrate: boolean;
  average_heartrate: number;
  max_heartrate: number;
  average_cadence: number;
  average_temp: null | number;
  perceived_exertion: null | number;
  userId: string;
  full_data: boolean;
  streams?: null | streams;
}

interface BestEfforts {
  activity_id: null | number;
  distance: number;
  elapsed_time: number;
  id: number;
  is_kom: null | boolean;
  start_date: string;
  start_date_local: string;
  average_cadence: null | number;
  average_heartrate: null | number;
  average_watts: null | number;
  device_watts: null | boolean;
  end_index: number;
  hidden: null | boolean;
  kom_rank: null | number;
  max_heartrate: null | number;
  moving_time: number;
  name: string;
  pr_rank: null | number;
  segment: null | string;
  start_index: string;
}

interface Laps {
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
}

interface Splits {
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

async function getActivities({
  query,
  abortController,
}: {
  query?: GetActivitiesQuery;
  abortController: AbortController;
}) {
  const response = await cachedFetch({
    url: `/api/data/activities`,
    method: 'GET',
    query,
    controller: abortController,
  });
  return response;
}

function useActivities({
  query,
  enabled = true,
  background = false,
}: {
  query?: GetActivitiesQuery;
  enabled?: boolean;
  background?: boolean;
}) {
  const fetchResult = useFetch<undefined, GetActivitiesQuery, Activity[]>({
    query,
    fetchData: getActivities,
    enabled,
    background,
  });

  return fetchResult;
}

export { useActivities };

export type { Activity, GetActivitiesQuery };
