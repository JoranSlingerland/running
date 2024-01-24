import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { cosmosContainer } from '@utils/cosmosdb';
import { Container } from '@azure/cosmos';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const token = await getToken({ req });
  if (!token) {
    res.status(401).end();
    return;
  }

  const container = cosmosContainer('users');

  switch (req.method) {
    case 'GET':
      await handleGet(res, container, token.id as string);
      break;
    case 'POST':
      await handlePost(req, res);
      break;
    default:
      res.setHeader('Allow', 'GET, POST');
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

async function handleGet(
  res: NextApiResponse,
  container: Container,
  id: string,
) {
  const { resources: user } = await container.items
    .query({
      query: 'SELECT * FROM c WHERE c.id = @id',
      parameters: [{ name: '@id', value: id }],
    })
    .fetchAll();
  if (!user || user.length === 0) {
    res.status(400).json({ message: 'User not found' });
    return;
  }
  res.status(200).json(user[0]);
  return;
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  // Update user in cosmosdb database
}
