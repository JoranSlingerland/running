import { ZodSchema } from 'zod';

export const validateEnv = <T>(schema: ZodSchema<T>): T => {
  const parsedEnv = schema.safeParse(process.env);
  if (!parsedEnv.success) {
    throw new Error(
      parsedEnv.error.errors
        .map(
          (e) =>
            `env Variable '${e.path.join('.')}' Gives the error '${e.message}'`,
        )
        .join('\n'),
    );
  }

  return parsedEnv.data;
};
