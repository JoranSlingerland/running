import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import type { jwtObject, Options } from './types';

export function decryptJwt(
  token: string | null | undefined,
  options: Options,
): jwtObject {
  const { algorithm = 'aes-256-xts', secret } = options;
  if (!token) {
    throw new Error('Token is required');
  }
  if (!secret) {
    throw new Error('Secret is required');
  }

  // Decode the JWT token
  const decodedToken = jwt.decode(token, { complete: true });

  if (
    !decodedToken ||
    typeof decodedToken === 'string' ||
    typeof decodedToken.payload === 'string'
  ) {
    throw new Error('Invalid token');
  }

  // Get the initialization vector from the decoded token
  const iv = Buffer.from(decodedToken.payload.iv, 'hex'); // type-coverage:ignore-line

  // Decrypt the encrypted payload
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secret), iv);
  let decryptedPayload = decipher.update(
    decodedToken.payload.data, // type-coverage:ignore-line
    'hex',
    'utf8',
  );
  decryptedPayload += decipher.final('utf8');

  // Parse the decrypted payload
  const payload: jwtObject = JSON.parse(decryptedPayload);

  return payload;
}
