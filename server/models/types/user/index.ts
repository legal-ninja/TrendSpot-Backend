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
  isAuthor: boolean | null;
  isAdmin: boolean;
  pushToken?: string | null;
  isDeactivated: boolean;
  isDeactivatedByAdmin: boolean;
  isSuperAdmin: boolean;
}
