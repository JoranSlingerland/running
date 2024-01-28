import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import {
  cosmosContainer,
  containerFunctionWithBackOff,
  removeKeys,
} from '@utils/cosmosdb';
import { Container } from '@azure/cosmos';
import { userSettingsSchema } from '@utils/zodSchema';

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
      await handlePost(req, res, container, token.id as string);
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

  return res
    .status(200)
    .json(
      removeKeys(user[0], [
        '_rid',
        '_self',
        '_etag',
        '_attachments',
        '_ts',
        'id',
      ]),
    );
}

async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse,
  container: Container,
  id: string,
) {
  const validated = userSettingsSchema.safeParse(req.body);
  if (!validated.success) {
    res.status(400).json({ message: validated.error });
    return;
  }

  const result = await containerFunctionWithBackOff(async () => {
    return await container.items.upsert({
      id,
      ...validated.data,
    });
  });

  if (!result.isError && result.result) {
    return res
      .status(200)
      .json(
        removeKeys(result.result.resource || {}, [
          '_rid',
          '_self',
          '_etag',
          '_attachments',
          '_ts',
          'id',
        ]),
      );
  }

  return res
    .status(result.result?.statusCode || 500)
    .json({ message: 'Something went wrong' });
}
