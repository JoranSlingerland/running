import { ZodSchema, z } from 'zod';

const base64regex =
  /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

const parseEnv = <T>(schema: ZodSchema<T>): T => {
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

export const frontendServerEnv = parseEnv(
  z.object({
    API_SHARED_KEY: z.string().length(44).regex(base64regex, 'Invalid base64'),
    STRAVA_CLIENT_ID: z.string().min(1),
    STRAVA_CLIENT_SECRET: z.string().min(1),
    STRAVA_DAILY_LIMIT: z.coerce.number().int().positive(),
    STRAVA_15MIN_LIMIT: z.coerce.number().int().positive(),
    MONGO_INITDB_ROOT_USERNAME: z.string().min(1),
    MONGO_INITDB_ROOT_PASSWORD: z.string().min(1),
    MONGODB_URI: z.string().min(1),
    NEXTAUTH_ADMIN_EMAIL: z.string().email(),
    NEXTAUTH_SECRET: z.string().length(44).regex(base64regex, 'Invalid base64'),
    NEXTAUTH_SALT: z.string().length(44).regex(base64regex, 'Invalid base64'),
    NEXTAUTH_URL: z.string().url(),
    NEXTAUTH_GITHUB_CLIENTID: z.string().min(1),
    NEXTAUTH_GITHUB_CLIENTSECRET: z.string().min(1),
    NESTJS_URL: z.string().url(),
    MAPTILERTOKEN: z.string().min(1),
    NODE_ENV: z.enum(['development', 'test', 'production']),
  }),
);

export const frontendClientEnv = parseEnv(
  z.object({
    NEXT_PUBLIC_api_key: z.string().min(1),
  }),
);

export const backendEnv = parseEnv(
  z.object({
    API_SHARED_KEY: z.string().length(44).regex(base64regex, 'Invalid base64'),
    STRAVA_CLIENT_ID: z.string().min(1),
    STRAVA_CLIENT_SECRET: z.string().min(1),
    STRAVA_DAILY_LIMIT: z.coerce.number().int().positive(),
    STRAVA_15MIN_LIMIT: z.coerce.number().int().positive(),
    MONGO_INITDB_ROOT_USERNAME: z.string().min(1),
    MONGO_INITDB_ROOT_PASSWORD: z.string().min(1),
    MONGODB_URI: z.string().min(1),
    NODE_ENV: z.enum(['development', 'test', 'production']),
  }),
);
