import type { NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

import { NextApiRequestUnknown } from '@pages/api/types';

export default async function handler(
  req: NextApiRequestUnknown,
  res: NextApiResponse,
) {
  const token = await getToken({ req });
  if (!token) {
    res.status(401).end();
    return;
  }

  switch (req.method) {
    case 'GET':
      return res.status(200).json({ isAdmin: token.admin ?? false });
    default:
      res.setHeader('Allow', 'GET');
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
