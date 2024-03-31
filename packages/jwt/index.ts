import {
  CompactEncrypt,
  JWTPayload,
  SignJWT,
  compactDecrypt,
  jwtVerify,
} from 'jose';
import { JwtPayload } from 'jsonwebtoken';

interface Options {
  secret?: string;
  issuer?: string;
}

const encode = (str: string) => new TextEncoder().encode(str);

function validateAndEncodeSecret(secret: string | undefined) {
  if (!secret) {
    throw new Error('Secret is required');
  }
  return encode(secret);
}

async function signAndEncryptPayload(
  payload: JWTPayload,
  options: Options,
): Promise<string> {
  const secret = validateAndEncodeSecret(options.secret);

  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(options.issuer || 'unknown')
    .sign(secret);

  return await new CompactEncrypt(encode(jwt))
    .setProtectedHeader({ alg: 'A256KW', enc: 'A256GCM' })
    .encrypt(secret.slice(0, 32));
}

async function decryptAndVerifyPayload(
  jwe: string,
  options: Options,
): Promise<JwtPayload | undefined> {
  const secret = validateAndEncodeSecret(options.secret);

  const { plaintext: jwt } = await compactDecrypt(jwe, secret.slice(0, 32));

  try {
    const { payload } = await jwtVerify(jwt, secret);
    return payload;
  } catch (error) {
    console.error('Error verifying JWT', error);
    return undefined;
  }
}

export { decryptAndVerifyPayload, signAndEncryptPayload };
