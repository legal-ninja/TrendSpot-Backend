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
  isAdmin: boolean;
  isDeactivated: boolean;
  isDeactivatedByAdmin: boolean;
}

export interface ExternalNews {
  source: {
    id: string | null;
    name: string;
  };
  author: string;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  content: string;
}
