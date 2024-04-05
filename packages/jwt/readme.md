# JWT Encryption and Decryption Package

This package provides functions for encrypting and decrypting JSON Web Tokens (JWTs).

## Usage

```typescript
import { encrypt, decrypt } from '@repo/jwt';

const payload = { data: 'Hello, World!' };
const secret = 'your-secret-key';
const options = { algorithm: 'aes-256-xts' };

// Encrypt a JWT
const token = encrypt(payload, { secret, ...options });

// Decrypt a JWT
const decryptedPayload = decrypt(token, { secret, ...options });
```

## API

`encrypt(payload: object, options: object): string`

Encrypts a payload into a JWT.

* `payload`: The payload to encrypt. This should be an object.
* `options`: An object containing the following properties:
  * `secret`: The secret key to use for encryption.
  * `algorithm` (optional): The encryption algorithm to use. Defaults to `'aes-256-xts'`.
  
Returns the encrypted JWT as a string.

`decrypt(token: string, secret: string): object`

Decrypts a JWT into a payload.

* `token`: The JWT to decrypt.
* `options`: An object containing the following properties:
  * `secret`: The secret key to use for encryption.
  * `algorithm` (optional): The encryption algorithm to use. Defaults to `'aes-256-xts'`.
