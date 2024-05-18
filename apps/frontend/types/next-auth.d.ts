import { DefaultJWT } from '@auth/core/jwt';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: DefaultSession['user'] & {
      admin: boolean;
    };
  }
  interface JWT extends DefaultJWT {
    admin: boolean;
    id: string;
  }
}
