import * as z from 'zod';

const preferencesForm = z.object({
  dark_mode: z.union([
    z.literal('light'),
    z.literal('dark'),
    z.literal('system'),
  ]),
  preferred_tss_type: z.union([z.literal('pace'), z.literal('hr')]),
  units: z.union([z.literal('metric'), z.literal('imperial')]),
  enable_weather: z.boolean(),
});

type PreferencesForm = z.infer<typeof preferencesForm>;

export { preferencesForm };
export type { PreferencesForm };
