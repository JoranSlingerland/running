import {
  upsertUserSettingsToMongoDB,
  userSettingsFromMongoDB,
} from '@repo/mongodb';
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
      await handleGet(res, token.id as string);
      break;
    case 'POST':
      await handlePost(req, res);
      break;
    default:
      res.setHeader('Allow', 'GET, POST');
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

async function handleGet(res: NextApiResponse, id: string) {
  const user = await userSettingsFromMongoDB(id);
  if (!user) {
    res.status(400).json({ message: 'User not found' });
    return;
  }

  return res.status(200).json(user);
}

async function handlePost(req: NextApiRequestUnknown, res: NextApiResponse) {
  const result = await upsertUserSettingsToMongoDB(req.body);

  if (!result.isError && result.result) {
    return res.status(200).json({ message: 'Account settings saved!' });
  }

  return res.status(500).json({ message: 'Something went wrong' });
}
