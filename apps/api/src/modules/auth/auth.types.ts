export const UserRole = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  SUPPORT: 'SUPPORT',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthenticatedRequest {
  headers: any;
  user: AuthenticatedUser;
}
