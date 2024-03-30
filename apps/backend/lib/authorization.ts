import { HttpRequest } from '@azure/functions';
import { decryptJwt } from '@repo/jwt';

function getAuthorization(request: HttpRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const jwt = decryptJwt(token, { secret: process.env.API_SHARED_KEY });
  const currentUnixTimeStamps = Math.floor(Date.now() / 1000);

  // eslint-disable-next-line sonarjs/prefer-single-boolean-return
  if (
    !jwt ||
    !jwt.id ||
    !jwt.exp ||
    typeof jwt.exp !== 'number' ||
    jwt.exp < currentUnixTimeStamps
  ) {
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
