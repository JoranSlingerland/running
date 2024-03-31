import { HttpRequest } from '@azure/functions';
import { decryptAndVerifyPayload } from '@repo/jwt';

async function getAuthorization(request: HttpRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return {
      authorized: false,
      userId: null,
    };
  }

  const jwt = await decryptAndVerifyPayload(token, {
    secret: process.env.API_SHARED_KEY || '',
  });

  if (!jwt || !jwt.id || typeof jwt.id !== 'string') {
    return {
      authorized: false,
      userId: null,
    };
  }

  return {
    authorized: true,
    userId: jwt.id,
  };
}

export { getAuthorization };
