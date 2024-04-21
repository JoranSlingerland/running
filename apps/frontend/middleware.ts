import { NextFetchEvent } from 'next/server';
import { withAuth } from 'next-auth/middleware';
import { NextMiddlewareWithAuth } from 'next-auth/middleware';
import { NextRequestWithAuth } from 'next-auth/middleware';

const requestLogger =
  (handler: NextMiddlewareWithAuth) =>
  async (req: NextRequestWithAuth, res: NextFetchEvent) => {
    console.log(
      `\x1b[35m[New Request]\x1b[0m \x1b[36m[${new Date().toISOString()}]\x1b[0m \x1b[32m${req.method}\x1b[0m \x1b[33m${req.nextUrl.href}\x1b[0m`,
    );
    return handler(req, res);
  };

export default requestLogger(
  withAuth({
    pages: {
      signIn: '/',
    },
  }),
);

export const config = { matcher: ['/authenticated/:page*'] };
