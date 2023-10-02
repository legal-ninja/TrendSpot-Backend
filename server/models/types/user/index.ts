export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  avatar: string;
  bio: string;
  joinedAt: Date;
  lastUpdated: Date;
  isAuthor: string;
  isAdmin: boolean;
  isDeactivated: boolean;
  isDeactivatedByAdmin: boolean;
  isSuperAdmin: boolean;
}
