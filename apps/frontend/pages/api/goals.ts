import {
  deleteGoalFromMongoDB,
  goalsFromMongoDB,
  upsertGoalToMongoDB,
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
      await handlePost(req, res, token.id as string);
      break;
    case 'DELETE':
      await handleDelete(req, res, token.id as string);
      break;
    default:
      res.setHeader('Allow', 'GET, POST, DELETE');
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

async function handleGet(res: NextApiResponse, id: string) {
  const goals = await goalsFromMongoDB(id);
  if (!goals) {
    res.status(200).json([]);
  }

  return res.status(200).json(goals);
}

async function handlePost(
  req: NextApiRequestUnknown,
  res: NextApiResponse,
  id: string,
) {
  if (typeof req.body !== 'object' || req.body === null) {
    return res.status(400).json({ message: 'Invalid request body' });
  }

  if ('userId' in req.body && req.body['userId'] !== id) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const result = await upsertGoalToMongoDB(req.body);
  if (!result.isError && result.result) {
    return res.status(200).json({ message: 'Goal saved!' });
  }

  return res.status(500).json({ message: 'Something went wrong' });
}

async function handleDelete(
  req: NextApiRequestUnknown,
  res: NextApiResponse,
  id: string,
) {
  const goalId = (req.query.id as string) || '';
  if (!goalId) {
    return res.status(400).json({ message: 'Invalid request' });
  }
  const result = await deleteGoalFromMongoDB({ _id: goalId, userId: id });

  if (!result.isError && result.result) {
    return res.status(200).json({ message: 'Account settings deleted!' });
  }

  return res.status(500).json({ message: 'Something went wrong' });
}
