import crypto from 'crypto';

import jwt from 'jsonwebtoken';

import type { Options, jwtObject } from './types';

export function encryptJwt(payload: jwtObject, options: Options): string {
  const { algorithm = 'aes-256-xts', secret } = options;

  if (!secret) {
    throw new Error('Secret is required');
  }

  // Generate initialization vector
  const iv = crypto.randomBytes(16);

  // Convert payload to string
  const payloadString = JSON.stringify(payload);

  // Encrypt payload
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secret), iv);
  let encryptedPayload = cipher.update(payloadString, 'utf8', 'hex');
  encryptedPayload += cipher.final('hex');

  // Create JWT token with encrypted payload
  const token = jwt.sign(
    { data: encryptedPayload, iv: iv.toString('hex') },
    secret,
    { algorithm: 'HS256' },
  );

  return token;
}
