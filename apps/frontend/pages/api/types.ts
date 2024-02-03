import { NextApiRequest } from 'next';

interface NextApiRequestUnknown extends NextApiRequest {
  body: unknown;
}

export type { NextApiRequestUnknown };
