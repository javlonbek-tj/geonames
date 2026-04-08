import type { User } from './user';

export type AuthUser = User;

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}
