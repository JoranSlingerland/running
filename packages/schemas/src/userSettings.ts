import * as z from 'zod';

const userSettingsSchema = z.object({
  strava_authentication: z.object({
    access_token: z.string(),
    refresh_token: z.string(),
    expires_at: z.number(),
  }),
  heart_rate: z.object({
    max: z.number(),
    resting: z.number(),
    threshold: z.number(),
    zones: z.array(
      z.object({
        name: z.string(),
        min: z.number(),
        max: z.number(),
      }),
    ),
  }),
  pace: z.object({
    threshold: z.number(),
    zones: z.array(
      z.object({
        name: z.string(),
        min: z.number(),
        max: z.number(),
      }),
    ),
  }),
  preferences: z.object({
    preferred_tss_type: z.union([z.literal('hr'), z.literal('pace')]),
    units: z.union([z.literal('metric'), z.literal('imperial')]),
    dark_mode: z.union([
      z.literal('dark'),
      z.literal('light'),
      z.literal('system'),
    ]),
    enable_weather: z.boolean(),
  }),
  gender: z.union([z.literal('male'), z.literal('female'), z.undefined()]),
  _id: z.string(),
});

export { userSettingsSchema };
