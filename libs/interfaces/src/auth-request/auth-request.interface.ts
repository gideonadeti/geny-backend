import { Request } from 'express';

import { User } from '@app/protos/generated/auth';

export interface AuthRequest extends Request {
  user: User;
}
