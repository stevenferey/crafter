import type { User as AuthUser } from './auth.types.js';

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends AuthUser {}

    interface Request {
      user?: User;
    }
  }
}

export {};
