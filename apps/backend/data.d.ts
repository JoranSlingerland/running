import { Request } from 'express';

interface RequestWithUser extends Request {
  userId: string;
  isAdmin: boolean;
}
