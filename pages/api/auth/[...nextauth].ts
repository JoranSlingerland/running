import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import crypto from 'crypto';

declare module 'next-auth' {
  interface User {
    id: string;
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

export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.clientId as string,
      clientSecret: process.env.clientSecret as string,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    jwt({ token, account, user }) {
      const adminEmails = JSON.parse(process.env.adminEmails || '[]');
      if (account) {
        token.accessToken = account.access_token;
        token.id = crypto
          .createHash('sha256')
          .update(`${account.provider}-${user?.id}`)
          .digest('hex');
        if (adminEmails.includes(user?.email)) {
          token.admin = true;
        }
      }
      return token;
    },
    session({ session, token }) {
      return {
        ...session,
        accessToken: token.accessToken,
        user: { ...session.user, id: token.id, admin: token.admin },
      };
    },
  },
});
