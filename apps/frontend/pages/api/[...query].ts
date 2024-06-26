import { WretchError, createWretchInstance } from '@repo/api';
import { frontendServerEnv as env } from '@repo/env';
import { signAndEncryptPayload } from '@repo/jwt';
import type { NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

import type { NextApiRequestUnknown } from './types';

/**
This is a catch-all route handler that forwards requests to the NestJS API.
 - It checks for valid methods, URL, and token before forwarding the request.
 - If any of these checks fail, it sends an appropriate HTTP response.
 - Responses from the Azure function are then forwarded to the client.
 */
export default async function handler(
  req: NextApiRequestUnknown,
  res: NextApiResponse,
) {
  const { url: urlPath, method } = req;

  // Check for valid method
  if (!method || method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    return;
  }

  // Check for valid URL
  if (!urlPath) {
    res.status(400).json({ message: 'Invalid URL' });
    return;
  }

  // Check for valid token
  const token = await getToken({ req });
  if (!token || !token.id) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  // Prepare request to NestJS
  let isError = false;
  let statusCode = 200;
  let error: unknown;
  const jwt = await signAndEncryptPayload(token, {
    secret: env.API_SHARED_KEY,
    issuer: env.NEXTAUTH_URL,
  });
  const url = `${env.NESTJS_URL}${urlPath.replace('/api', '')}`;
  const wretchInstance = createWretchInstance({
    url,
    method,
    controller: new AbortController(),
    bearerToken: jwt,
  });

  // Send request and handle response
  const response = await wretchInstance
    .onAbort(() => {
      isError = true;
      statusCode = 500;
    })
    .json()
    .catch((err: WretchError) => {
      isError = true;
      statusCode = err.status;
      error = err.json; // type-coverage:ignore-line
    });

  if (!statusCode) {
    console.log('No status code found');
    statusCode = 500;
  }

  res.status(statusCode).json(isError ? error : response);
}
