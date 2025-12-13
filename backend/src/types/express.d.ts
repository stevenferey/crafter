import type { User as AuthUser } from './auth.types';

declare global {
  namespace Express {
    interface User extends AuthUser {}
  }
}

export {};
