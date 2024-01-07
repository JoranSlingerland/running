import type { Activity } from '../services/data/activities';

function getPreferredTss(
  userSettings: UserSettings | undefined,
  activity: Activity,
): { tss: number | undefined; type: 'hr' | 'pace' | undefined } {
  const preferredTss = userSettings
    ? userSettings.preferences.preferred_tss_type
    : undefined;
  const hr_tss = activity.hr_trimp;
  const pace_tss = activity.pace_trimp;

  if (preferredTss === 'hr' && hr_tss) {
    return {
      tss: hr_tss,
      type: 'hr',
    };
  } else if (preferredTss === 'pace' && pace_tss) {
    return {
      tss: pace_tss,
      type: 'pace',
    };
  } else if (pace_tss) {
    return {
      tss: pace_tss,
      type: 'pace',
    };
  } else if (hr_tss) {
    return {
      tss: hr_tss,
      type: 'hr',
    };
  }
  return {
    tss: undefined,
    type: preferredTss,
  };
}

export { getPreferredTss };
