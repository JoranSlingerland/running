import { NextApiResponse } from 'next';

import { NextApiRequestUnknown } from './types';

export default function handler(
  req: NextApiRequestUnknown,
  res: NextApiResponse,
) {
  res.status(200).json({ status: 'ok' });
}
