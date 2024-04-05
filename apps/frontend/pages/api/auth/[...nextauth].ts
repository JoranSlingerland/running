import crypto from 'crypto';

import NextAuth, { NextAuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';

declare module 'next-auth' {
  interface User {
    admin: boolean;
  }
  interface Session {
    accessToken: string;
  }
  interface JWT {
    accessToken: string;
    id: string;
  }
}

const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.NEXTAUTH_GITHUB_CLIENTID as string,
      clientSecret: process.env.NEXTAUTH_GITHUB_CLIENTSECRET as string,
    }),
  ],
  callbacks: {
    jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token;
        token.id = crypto
          .createHash('sha256')
          .update(
            `${account.provider}-${user?.id}-${process.env.NEXTAUTH_SALT}`,
          )
          .digest('hex');
        if (user?.email === process.env.NEXTAUTH_ADMIN_EMAIL) {
          token.admin = true;
        }
      }
      return token;
    },
    session({ session, token }) {
      return {
        ...session,
        accessToken: token.accessToken,
        user: { ...session.user, admin: token.admin },
      };
    },
  },
};

export default NextAuth(authOptions);

export { authOptions };
