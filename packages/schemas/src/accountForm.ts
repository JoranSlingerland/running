import * as z from 'zod';

const paceRegex = /^(\d{1,3}):(\d{1,2})$/;

const accountForm = z.object({
  gender: z.union([z.literal('male'), z.literal('female')]),
  hr_max: z.number().min(0).max(300),
  hr_rest: z.number().min(0).max(300),
  hr_threshold: z.number().min(0).max(300),
  pace_threshold: z.string().refine((v) => paceRegex.test(v), {
    message:
      'Pace threshold must be in the format MM:SS, where leading zeros are optional.',
  }),
});

type AccountForm = z.infer<typeof accountForm>;

export { accountForm };
export type { AccountForm };
