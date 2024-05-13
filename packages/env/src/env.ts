import { z } from 'zod';

export const frontendEnv = z.object({
  API_SHARED_KEY: z.string().min(1),
  STRAVA_CLIENT_ID: z.string().min(1),
  STRAVA_CLIENT_SECRET: z.string().min(1),
  STRAVA_DAILY_LIMIT: z.coerce.number().int().positive(),
  STRAVA_15MIN_LIMIT: z.coerce.number().int().positive(),
  MONGO_INITDB_ROOT_USERNAME: z.string().min(1),
  MONGO_INITDB_ROOT_PASSWORD: z.string().min(1),
  MONGODB_URI: z.string().min(1),
  NEXTAUTH_ADMIN_EMAIL: z.string().email(),
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_SALT: z.string().min(1),
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_GITHUB_CLIENTID: z.string().min(1),
  NEXTAUTH_GITHUB_CLIENTSECRET: z.string().min(1),
  NESTJS_URL: z.string().url(),
  MAPTILERTOKEN: z.string().min(1),
  NODE_ENV: z.string().min(1),
});

export const frontendClientEnv = z.object({
  NEXT_PUBLIC_api_key: z.string().min(1),
});

export const backendEnv = z.object({
  API_SHARED_KEY: z.string().min(1),
  STRAVA_CLIENT_ID: z.string().min(1),
  STRAVA_CLIENT_SECRET: z.string().min(1),
  STRAVA_DAILY_LIMIT: z.coerce.number().int().positive(),
  STRAVA_15MIN_LIMIT: z.coerce.number().int().positive(),
  MONGO_INITDB_ROOT_USERNAME: z.string().min(1),
  MONGO_INITDB_ROOT_PASSWORD: z.string().min(1),
  MONGODB_URI: z.string().min(1),
  NODE_ENV: z.string().min(1),
});

export const backendEnvFunction = () => {
  const backendEnv = z.object({
    API_SHARED_KEY: z.string().min(1),
    STRAVA_CLIENT_ID: z.string().min(1),
    STRAVA_CLIENT_SECRET: z.string().min(1),
    STRAVA_DAILY_LIMIT: z.coerce.number().int().positive(),
    STRAVA_15MIN_LIMIT: z.coerce.number().int().positive(),
    MONGO_INITDB_ROOT_USERNAME: z.string().min(1),
    MONGO_INITDB_ROOT_PASSWORD: z.string().min(1),
    MONGODB_URI: z.string().min(1),
    NODE_ENV: z.string().min(1),
  });

  const parsedEnv = backendEnv.safeParse(process.env);
  if (!parsedEnv.success) {
    throw new Error(parsedEnv.error.errors.join('\n'));
  }
  return parsedEnv.data;
};
