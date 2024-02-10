import { encryptJwt } from '@repo/jwt';
import type { NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { WretchError } from 'wretch/resolver';

import { createWretchInstance } from '@utils/api';

import type { NextApiRequestUnknown } from './types';

const allowedMethods = ['POST', 'GET', 'DELETE'];

/**
This is a catch-all route handler that forwards requests to Azure functions.
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
  if (!method || !allowedMethods.includes(method)) {
    res.setHeader('Allow', allowedMethods.join(', '));
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

  // Prepare request to Azure function
  let isError = false;
  let statusCode = 200;
  let error: unknown;
  const jwt = encryptJwt(token, { secret: process.env.API_SHARED_KEY });
  const url = `${process.env.AZURE_FUNCTION_URL}${urlPath.replace('/api', '')}`;
  const query = {
    code: process.env.AZURE_FUNCTION_KEY,
  };
  const wretchInstance = createWretchInstance({
    url,
    method,
    controller: new AbortController(),
    query,
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

  res.status(statusCode).json(isError ? error : response);
}
