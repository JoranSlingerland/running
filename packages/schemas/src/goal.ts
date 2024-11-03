import * as z from 'zod';

const goalForm = z.object({
  timeFrame: z.union([
    z.literal('week'),
    z.literal('month'),
    z.literal('year'),
  ]),
  sport: z.union([z.literal('run'), z.literal('ride')]),
  type: z.union([z.literal('time'), z.literal('distance')]),
  value: z.number(),
});

type GoalForm = z.infer<typeof goalForm>;

const goalSchema = goalForm.extend({
  userId: z.string(),
  _id: z.string().nullable(),
  version: z.number(),
});

export { goalSchema, goalForm };
export type { GoalForm };
