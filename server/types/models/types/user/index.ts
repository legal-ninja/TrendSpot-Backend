export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isAdmin: boolean;
  avatar: string;
  bio: string;
  joinedAt: Date;
  lastUpdated: Date;
  withGoogle: boolean;
}
